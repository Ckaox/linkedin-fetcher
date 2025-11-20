import { ApifyClient } from 'apify-client';
import { LinkedInPost, Interaction } from './types';

interface CacheEntry {
  data: any;
  timestamp: number;
  hash: string;
  processedIds?: Set<string>; // IDs de items ya procesados
}

interface InteractionSnapshot {
  likeUserIds: Set<string>;
  commentIds: Set<string>;
  lastChecked: number;
}

export class ApifyScraperService {
  private cache: Map<string, CacheEntry> = new Map();
  private interactionSnapshots: Map<string, InteractionSnapshot> = new Map();
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
   * Y solo trae las interacciones NUEVAS que no teníamos antes
   */
  async getPostInteractions(
    apifyToken: string,
    postUrn: string,
    currentStats: { likes: number; comments: number }
  ): Promise<Interaction[]> {
    console.log(`🔍 Checking interactions for post: ${postUrn}`);

    const cacheKey = `interactions:${postUrn}`;
    const cached = this.getFromCache(cacheKey);
    
    // Obtener snapshot de IDs ya procesados
    let snapshot = this.interactionSnapshots.get(postUrn);
    if (!snapshot) {
      snapshot = {
        likeUserIds: new Set<string>(),
        commentIds: new Set<string>(),
        lastChecked: Date.now(),
      };
      this.interactionSnapshots.set(postUrn, snapshot);
    }

    // Verificar si las stats cambiaron
    const currentHash = this.hashStats(currentStats);
    const previousLikesCount = snapshot.likeUserIds.size;
    const previousCommentsCount = snapshot.commentIds.size;
    
    const newLikesCount = currentStats.likes - previousLikesCount;
    const newCommentsCount = currentStats.comments - previousCommentsCount;

    if (cached && cached.hash === currentHash && newLikesCount === 0 && newCommentsCount === 0) {
      console.log(`✅ No changes detected, using cached interactions`);
      return cached.data;
    }

    console.log(`🔄 Stats changed! Likes: +${newLikesCount}, Comments: +${newCommentsCount}`);
    console.log(`🚀 Fetching only NEW interactions from Apify...`);

    const interactions: Interaction[] = [];
    const client = this.getClient(apifyToken);
    const newInteractions: Interaction[] = []; // Solo las nuevas

    try {
      // 1. Obtener reacciones (likes) - SOLO SI HAY NUEVAS
      if (newLikesCount > 0 || (currentStats.likes > 0 && snapshot.likeUserIds.size === 0)) {
        console.log(`  Fetching up to ${currentStats.likes} likes...`);
        
        const likesRun = await client.actor(this.ACTORS.REACTIONS).call({
          postUrls: [`https://www.linkedin.com/feed/update/urn:li:activity:${postUrn}`],
          maxItems: Math.min(currentStats.likes, 100),
        });

        const likesData = await client.dataset(likesRun.defaultDatasetId).listItems();
        
        console.log(`  📦 Raw likes data sample:`, JSON.stringify(likesData.items[0], null, 2).substring(0, 500));
        
        if (likesData.items && likesData.items.length > 0) {
          let newLikesFound = 0;
          
          likesData.items.forEach((item: any) => {
            const userId = item.profile_url || item.profileUrl || item.url || item.id || `user-${item.name}`;
            
            if (!snapshot!.likeUserIds.has(userId)) {
              const interaction: Interaction = {
                type: 'like',
                userName: item.name || item.full_name || item.userName || 'Unknown',
                userUrl: userId,
                userHeadline: item.headline || item.userHeadline || '',
                timestamp: item.reacted_at || item.reactedAt || item.timestamp || new Date().toISOString(),
              };
              
              interactions.push(interaction);
              snapshot!.likeUserIds.add(userId);
              newLikesFound++;
            }
          });
          
          console.log(`  ✅ Found ${newLikesFound} NEW likes (${snapshot!.likeUserIds.size} total tracked)`);
        }
      } else {
        console.log(`  ℹ️ Skipping likes - no new ones detected`);
      }

      // 2. Obtener comentarios - SOLO SI HAY NUEVOS
      if (newCommentsCount > 0 || (currentStats.comments > 0 && snapshot.commentIds.size === 0)) {
        console.log(`  Fetching up to ${currentStats.comments} comments...`);
        
        const commentsRun = await client.actor(this.ACTORS.COMMENTS).call({
          postUrls: [`https://www.linkedin.com/feed/update/urn:li:activity:${postUrn}`],
          maxItems: Math.min(currentStats.comments, 50),
        });

        const commentsData = await client.dataset(commentsRun.defaultDatasetId).listItems();
        
        console.log(`  📦 Raw comments data sample:`, JSON.stringify(commentsData.items[0], null, 2).substring(0, 500));
        
        if (commentsData.items && commentsData.items.length > 0) {
          let newCommentsFound = 0;
          
          commentsData.items.forEach((item: any) => {
            const commentId = item.comment_id || item.id || item.urn || `${item.author?.name}-${item.timestamp}`;
            
            if (!snapshot!.commentIds.has(commentId)) {
              const interaction: Interaction = {
                type: 'comment',
                userName: item.author?.name || item.authorName || item.name || 'Unknown',
                userUrl: item.author?.profile_url || item.authorProfileUrl || item.profileUrl || '',
                userHeadline: item.author?.headline || item.authorHeadline || item.headline || '',
                commentText: item.text || item.comment || item.replyText || '',
                timestamp: item.posted_at || item.postedAt || item.timestamp || new Date().toISOString(),
              };
              
              interactions.push(interaction);
              snapshot!.commentIds.add(commentId);
              newCommentsFound++;
            }
          });
          
          console.log(`  ✅ Found ${newCommentsFound} NEW comments (${snapshot!.commentIds.size} total tracked)`);
        }
      } else {
        console.log(`  ℹ️ Skipping comments - no new ones detected`);
      }

      // Calcular costo estimado solo por las nuevas
      const actualLikesFetched = newLikesCount > 0 ? currentStats.likes : 0;
      const actualCommentsFetched = newCommentsCount > 0 ? currentStats.comments : 0;
      const estimatedCost = (actualLikesFetched * 0.003) + (actualCommentsFetched * 0.007);
      console.log(`💰 Estimated cost: ~$${estimatedCost.toFixed(3)} (${interactions.length} new interactions)`);

    } catch (error: any) {
      console.error(`❌ Error fetching interactions:`, error.message);
    }

    // Actualizar snapshot
    snapshot.lastChecked = Date.now();
    
    // Merge con interactions anteriores del cache
    const allInteractions = cached ? [...cached.data, ...interactions] : interactions;
    
    // Guardar en cache con hash de stats
    this.saveToCache(cacheKey, allInteractions, currentHash);

    // Retornar solo las nuevas para Clay
    return interactions;
  }

  /**
   * Obtiene métricas actualizadas de posts específicos
   * Usado para actualizar posts existentes en Clay
   */
  async updatePostMetrics(apifyToken: string, username: string, postIds: string[]): Promise<LinkedInPost[]> {
    console.log(`🔄 Updating metrics for ${postIds.length} posts from: ${username}`);

    try {
      const client = this.getClient(apifyToken);
      
      // Obtener posts recientes (suficientes para cubrir los IDs solicitados)
      const maxPostsToFetch = Math.max(20, postIds.length * 2);
      console.log(`💰 Requesting ${maxPostsToFetch} posts from Apify to find target posts...`);
      
      const run = await client.actor(this.ACTORS.POSTS).call({
        username: username,
        limit: maxPostsToFetch,
        page_number: 1,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      if (!items || items.length === 0) {
        console.log(`ℹ️ No posts found for ${username}`);
        return [];
      }

      // Normalizar todos los posts
      const normalizedPosts = this.normalizePosts(items);
      
      // Filtrar solo los posts que nos interesan
      const targetPosts = normalizedPosts.filter(post => 
        postIds.some(id => {
          const postId = typeof post.id === 'object' ? (post.id as any).activity_urn : post.id;
          return postId.includes(id) || id.includes(postId);
        })
      );
      
      console.log(`✅ Found ${targetPosts.length} matching posts out of ${normalizedPosts.length}`);
      console.log(`💰 Cost: ~$${((maxPostsToFetch / 1000) * 5).toFixed(3)}`);

      // Actualizar cache con las nuevas métricas
      const cacheKey = `posts:${username}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && cached.data) {
        // Merge: actualizar posts existentes con nuevas métricas
        const updatedData = cached.data.map((cachedPost: LinkedInPost) => {
          const updated = targetPosts.find(p => {
            const pId = typeof p.id === 'object' ? (p.id as any).activity_urn : p.id;
            const cpId = typeof cachedPost.id === 'object' ? (cachedPost.id as any).activity_urn : cachedPost.id;
            return pId === cpId;
          });
          return updated || cachedPost;
        });
        
        this.saveToCache(cacheKey, updatedData);
      }

      return targetPosts;
    } catch (error: any) {
      console.error(`❌ Error updating metrics:`, error.message);
      throw error;
    }
  }

  /**
   * Compara métricas de posts y retorna solo los que cambiaron
   */
  comparePostMetrics(currentPosts: Array<{id: string, likes: number, comments: number, reposts: number}>): {
    changed: string[];
    unchanged: string[];
    details: Array<{id: string, changes: {likes?: number, comments?: number, reposts?: number}}>
  } {
    const result = {
      changed: [] as string[],
      unchanged: [] as string[],
      details: [] as Array<{id: string, changes: {likes?: number, comments?: number, reposts?: number}}>
    };

    for (const post of currentPosts) {
      const snapshot = this.interactionSnapshots.get(post.id);
      
      if (!snapshot) {
        // Post nuevo o nunca verificado
        result.changed.push(post.id);
        result.details.push({
          id: post.id,
          changes: {
            likes: post.likes,
            comments: post.comments,
            reposts: post.reposts
          }
        });
        continue;
      }

      // Comparar con snapshot previo
      const prevLikes = snapshot.likeUserIds.size;
      const prevComments = snapshot.commentIds.size;
      
      const changes: any = {};
      let hasChanges = false;

      if (post.likes !== prevLikes) {
        changes.likes = post.likes - prevLikes;
        hasChanges = true;
      }
      if (post.comments !== prevComments) {
        changes.comments = post.comments - prevComments;
        hasChanges = true;
      }
      // Reposts no tienen snapshot, siempre verificar
      if (post.reposts > 0) {
        changes.reposts = post.reposts;
        hasChanges = true;
      }

      if (hasChanges) {
        result.changed.push(post.id);
        result.details.push({ id: post.id, changes });
      } else {
        result.unchanged.push(post.id);
      }
    }

    console.log(`📊 Metrics comparison: ${result.changed.length} changed, ${result.unchanged.length} unchanged`);
    return result;
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
  getCacheStats(): { entries: number; size: string; trackedInteractions: number } {
    const entries = this.cache.size;
    const size = JSON.stringify(Array.from(this.cache.entries())).length;
    
    let totalTrackedInteractions = 0;
    this.interactionSnapshots.forEach(snapshot => {
      totalTrackedInteractions += snapshot.likeUserIds.size + snapshot.commentIds.size;
    });
    
    return {
      entries,
      size: `${(size / 1024).toFixed(2)} KB`,
      trackedInteractions: totalTrackedInteractions,
    };
  }
}
