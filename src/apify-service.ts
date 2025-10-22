import { ApifyClient } from 'apify-client';
import { LinkedInPost, Interaction } from './types';

interface CacheEntry {
  data: any;
  timestamp: number;
  hash: string;
}

export class ApifyScraperService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

  // IDs de los actors de Apify
  private readonly ACTORS = {
    POSTS: 'apimaestro/linkedin-profile-posts',
    REACTIONS: 'apimaestro/linkedin-profile-reactions',
    COMMENTS: 'apimaestro/linkedin-profile-comments',
  };

  constructor() {
    // No necesitamos token en el constructor
    // Se pasa dinámicamente en cada método
  }

  /**
   * Crea un cliente de Apify con el token provisto
   */
  private getClient(apiToken: string): ApifyClient {
    return new ApifyClient({ token: apiToken });
  }

  /**
   * Obtiene posts del perfil SOLO SI HAY NUEVOS
   */
  async getProfilePosts(apifyToken: string, username: string, maxPosts: number = 10): Promise<LinkedInPost[]> {
    console.log(`🔍 Checking for new posts from: ${username}`);

    const cacheKey = `posts:${username}`;
    const cached = this.getFromCache(cacheKey);

    // Si hay cache válido, retornar
    if (cached) {
      console.log(`✅ Using cached posts (${cached.data.length} posts)`);
      return cached.data;
    }

    console.log(`🚀 Fetching fresh posts from Apify...`);

    try {
      const client = this.getClient(apifyToken);
      
      // Llamar al actor de Apify
      const run = await client.actor(this.ACTORS.POSTS).call({
        username: username,
        page_number: 1,
        // No usar "Total Posts to Scrape" para tener control manual
      });

      // Obtener resultados
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      console.log(`📦 Apify returned ${items?.length || 0} items`);
      
      if (!items || items.length === 0) {
        console.log(`ℹ️ No posts found for ${username}`);
        return [];
      }

      // Log del primer item para debug
      console.log(`🔍 First item structure:`, JSON.stringify(items[0], null, 2).substring(0, 500));

      // Tomar solo los más recientes
      const recentPosts = items.slice(0, maxPosts);

      // Normalizar datos al formato esperado
      const normalizedPosts = this.normalizePosts(recentPosts);
      
      console.log(`✨ Normalized ${normalizedPosts.length} posts`);

      // Detectar posts nuevos comparando con cache anterior
      const previousCache = this.cache.get(cacheKey);
      let newPostsCount = normalizedPosts.length;

      if (previousCache) {
        const previousIds = new Set(previousCache.data.map((p: any) => p.id));
        newPostsCount = normalizedPosts.filter(p => !previousIds.has(p.id)).length;
      }

      console.log(`✅ Found ${normalizedPosts.length} posts (${newPostsCount} new)`);
      console.log(`💰 Cost: ~$${((normalizedPosts.length / 1000) * 5).toFixed(3)}`);

      // Guardar en cache
      this.saveToCache(cacheKey, normalizedPosts);

      return normalizedPosts;
    } catch (error: any) {
      console.error(`❌ Error fetching posts:`, error.message);
      throw error;
    }
  }

  /**
   * Obtiene interacciones de un post SOLO SI CAMBIARON LOS NÚMEROS
   */
  async getPostInteractions(
    postUrn: string,
    currentStats: { likes: number; comments: number }
  ): Promise<Interaction[]> {
    console.log(`🔍 Checking interactions for post: ${postUrn}`);

    const cacheKey = `interactions:${postUrn}`;
    const cached = this.getFromCache(cacheKey);

    // Verificar si las stats cambiaron
    if (cached && cached.hash) {
      const currentHash = this.hashStats(currentStats);
      
      if (cached.hash === currentHash) {
        console.log(`✅ No changes detected, using cached interactions`);
        return cached.data;
      }

      console.log(`🔄 Stats changed! Previous: ${cached.hash}, Current: ${currentHash}`);
    }

    console.log(`🚀 Fetching fresh interactions from Apify...`);

    // Aquí llamaríamos a los actors de reactions y comments
    // Por ahora retorno array vacío como placeholder
    const interactions: Interaction[] = [];

    // TODO: Implementar llamadas a reactions y comments actors
    // Este es un placeholder para la estructura

    console.log(`💰 Cost: $0.00 (not implemented yet)`);

    // Guardar en cache con hash de stats
    this.saveToCache(cacheKey, interactions, this.hashStats(currentStats));

    return interactions;
  }

  /**
   * Verifica si hay posts nuevos sin hacer scraping completo
   * Solo obtiene el primer post y compara
   */
  async hasNewPosts(apifyToken: string, username: string): Promise<boolean> {
    console.log(`🔍 Quick check for new posts from: ${username}`);

    const cacheKey = `posts:${username}`;
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      console.log(`ℹ️ No cache found, assuming new posts exist`);
      return true;
    }

    try {
      const client = this.getClient(apifyToken);
      
      // Obtener solo el primer post (más barato)
      const run = await client.actor(this.ACTORS.POSTS).call({
        username: username,
        page_number: 1,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems({
        limit: 1,
      });

      if (!items || items.length === 0) {
        return false;
      }

      const latestPostId = (items[0] as any).data?.posts?.[0]?.urn || (items[0] as any).urn;
      const cachedLatestId = cached.data[0]?.id;

      const hasNew = latestPostId !== cachedLatestId;
      
      console.log(hasNew ? `✅ New post detected!` : `ℹ️ No new posts`);
      console.log(`💰 Cost: ~$${((1 / 1000) * 5).toFixed(4)}`);

      return hasNew;
    } catch (error: any) {
      console.error(`❌ Error checking for new posts:`, error.message);
      return false;
    }
  }

  /**
   * Normaliza los datos de Apify al formato esperado
   */
  private normalizePosts(apifyPosts: any[]): LinkedInPost[] {
    console.log(`🔧 Starting normalization of ${apifyPosts.length} items...`);
    
    const posts = apifyPosts
      .map((item, index) => {
        // Apify puede devolver diferentes estructuras
        // Opción 1: item.data.posts (array)
        // Opción 2: item directamente es el post
        // Opción 3: item.posts (array)
        
        let postsArray: any[] = [];
        
        if (item.data && item.data.posts) {
          postsArray = item.data.posts;
        } else if (item.posts) {
          postsArray = item.posts;
        } else if (item.urn || item.url) {
          // El item mismo es un post
          postsArray = [item];
        }
        
        console.log(`  Item ${index}: Found ${postsArray.length} posts`);
        
        return postsArray;
      })
      .flat()
      .filter(post => post && (post.urn || post.full_urn))
      .map((post, index) => {
        console.log(`  Post ${index}: ${post.urn || post.full_urn}`);
        
        return {
          id: post.urn || post.full_urn,
          url: post.url || `https://www.linkedin.com/feed/update/${post.urn}`,
          authorName: post.author 
            ? `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim()
            : 'Unknown',
          authorUrl: post.author?.profile_url || '',
          authorHeadline: post.author?.headline || '',
          content: post.text || post.commentary?.text || '',
          publishedAt: post.posted_at?.date || post.posted_at || new Date().toISOString(),
          mediaUrls: this.extractMediaUrls(post),
          metrics: {
            likes: post.stats?.like || post.num_likes || 0,
            comments: post.stats?.comments || post.num_comments || 0,
            reposts: post.stats?.reposts || post.num_shares || 0,
            views: post.stats?.total_reactions || 0,
          },
          interactions: [],
        };
      });
    
    console.log(`✅ Successfully normalized ${posts.length} posts`);
    return posts;
  }

  private extractMediaUrls(post: any): string[] {
    const urls: string[] = [];

    if (post.media) {
      if (post.media.url) urls.push(post.media.url);
      if (post.media.thumbnail) urls.push(post.media.thumbnail);
      if (post.media.images) {
        post.media.images.forEach((img: any) => {
          if (img.url) urls.push(img.url);
        });
      }
    }

    return urls;
  }

  /**
   * Obtiene datos del cache si son válidos
   */
  private getFromCache(key: string): CacheEntry | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    const age = Date.now() - cached.timestamp;

    if (age > this.CACHE_TTL) {
      console.log(`⏰ Cache expired for ${key} (${Math.round(age / 3600000)}h old)`);
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 Cache hit for ${key} (${Math.round(age / 3600000)}h old)`);
    return cached;
  }

  /**
   * Guarda datos en cache
   */
  private saveToCache(key: string, data: any, hash?: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hash: hash || '',
    });
  }

  /**
   * Crea un hash de las stats para detectar cambios
   */
  private hashStats(stats: { likes: number; comments: number }): string {
    return `${stats.likes}-${stats.comments}`;
  }

  /**
   * Limpia cache antiguo
   */
  clearExpiredCache(): void {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired cache entries`);
    }
  }

  /**
   * Retorna estadísticas de uso
   */
  getCacheStats(): { entries: number; size: string } {
    const entries = this.cache.size;
    const size = JSON.stringify(Array.from(this.cache.entries())).length;
    
    return {
      entries,
      size: `${(size / 1024).toFixed(2)} KB`,
    };
  }
}
