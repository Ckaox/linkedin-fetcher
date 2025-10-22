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
    REACTIONS: 'J9UfswnR3Kae4O6vm',  // Actor de reacciones
    COMMENTS: '2XnpwxfhSW1fAWElp',   // Actor de replies/comentarios
    RESHARES: 'WTiV7eppiChuBc8Xq',   // Actor de reshares
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
      
      // Llamar al actor de Apify con límite específico
      console.log(`💰 Requesting only ${maxPosts} posts from Apify to save costs...`);
      
      const run = await client.actor(this.ACTORS.POSTS).call({
        username: username,
        limit: maxPosts,  // ← Límite directo en Apify
        page_number: 1,
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

      // Normalizar datos al formato esperado (Apify ya limitó a maxPosts)
      const normalizedPosts = this.normalizePosts(items);
      
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
    apifyToken: string,
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

    const interactions: Interaction[] = [];
    const client = this.getClient(apifyToken);

    try {
      // 1. Obtener reacciones (likes)
      if (currentStats.likes > 0) {
        console.log(`  Fetching ${currentStats.likes} likes...`);
        
        const likesRun = await client.actor(this.ACTORS.REACTIONS).call({
          postUrls: [`https://www.linkedin.com/feed/update/urn:li:activity:${postUrn}`],
          maxItems: Math.min(currentStats.likes, 100), // Limitar para no gastar mucho
        });

        const likesData = await client.dataset(likesRun.defaultDatasetId).listItems();
        
        if (likesData.items && likesData.items.length > 0) {
          likesData.items.forEach((item: any) => {
            interactions.push({
              type: 'like',
              userName: item.name || item.full_name || item.userName || 'Unknown',
              userUrl: item.profile_url || item.profileUrl || item.url || '',
              userHeadline: item.headline || item.userHeadline || '',
              timestamp: item.reacted_at || item.reactedAt || item.timestamp || new Date().toISOString(),
            });
          });
          console.log(`  ✅ Found ${likesData.items.length} likes`);
        }
      }

      // 2. Obtener comentarios
      if (currentStats.comments > 0) {
        console.log(`  Fetching ${currentStats.comments} comments...`);
        
        const commentsRun = await client.actor(this.ACTORS.COMMENTS).call({
          postUrls: [`https://www.linkedin.com/feed/update/urn:li:activity:${postUrn}`],
          maxItems: Math.min(currentStats.comments, 50), // Limitar comentarios
        });

        const commentsData = await client.dataset(commentsRun.defaultDatasetId).listItems();
        
        if (commentsData.items && commentsData.items.length > 0) {
          commentsData.items.forEach((item: any) => {
            interactions.push({
              type: 'comment',
              userName: item.author?.name || item.authorName || item.name || 'Unknown',
              userUrl: item.author?.profile_url || item.authorProfileUrl || item.profileUrl || '',
              userHeadline: item.author?.headline || item.authorHeadline || item.headline || '',
              commentText: item.text || item.comment || item.replyText || '',
              timestamp: item.posted_at || item.postedAt || item.timestamp || new Date().toISOString(),
            });
          });
          console.log(`  ✅ Found ${commentsData.items.length} comments`);
        }
      }

      // Calcular costo estimado
      const estimatedCost = (currentStats.likes * 0.003) + (currentStats.comments * 0.007);
      console.log(`💰 Estimated cost: ~$${estimatedCost.toFixed(3)}`);

    } catch (error: any) {
      console.error(`❌ Error fetching interactions:`, error.message);
    }

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
      console.log(`💰 Requesting only 1 post from Apify for comparison...`);
      
      const run = await client.actor(this.ACTORS.POSTS).call({
        username: username,
        limit: 1,  // ← Solo 1 post para comparar
        page_number: 1,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      if (!items || items.length === 0) {
        return false;
      }

      // Extraer el ID del post más reciente
      const latestPost = items[0];
      const latestPostId = (latestPost as any).urn?.activity_urn || 
                          (latestPost as any).full_urn || 
                          (latestPost as any).urn;
      
      const cachedLatestId = typeof cached.data[0]?.id === 'object' 
        ? cached.data[0].id.activity_urn 
        : cached.data[0]?.id;

      const hasNew = latestPostId !== cachedLatestId;
      
      console.log(`  Latest post ID: ${latestPostId}`);
      console.log(`  Cached post ID: ${cachedLatestId}`);
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
