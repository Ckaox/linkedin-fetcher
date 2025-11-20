import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { ApifyScraperService } from './apify-service';
import { WebhookManager } from './webhook';
import { ApiResponse, PostsResponse } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Initialize services
const apifyService = new ApifyScraperService();
const webhookManager = new WebhookManager(
  parseInt(process.env.WEBHOOK_MAX_RETRIES || '3'),
  parseInt(process.env.WEBHOOK_TIMEOUT || '10000')
);

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  const cacheStats = apifyService.getCacheStats();
  
  res.json({
    status: 'ok',
    mode: 'APIFY MODE - COST OPTIMIZED',
    cache: cacheStats,
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// Simple test endpoint
app.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is working! 🎉',
    timestamp: new Date().toISOString(),
  });
});

app.post('/test-post', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'POST endpoint is working! 🎉',
    receivedBody: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Check for new posts (lightweight, casi gratis)
app.get('/api/check-new-posts', async (req: Request, res: Response) => {
  try {
    // Obtener Apify token del header o query
    const apifyToken = req.headers['x-apify-token'] as string || 
                       req.query.apify_token as string || 
                       process.env.APIFY_API_TOKEN || '';

    if (!apifyToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing Apify token. Provide via header "x-apify-token" or query param "apify_token"',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    const username = req.query.username as string || 
                     process.env.TARGET_PROFILE_USERNAME || 
                     'gabrielmartinezes';
    
    const hasNew = await apifyService.hasNewPosts(apifyToken, username);

    res.json({
      success: true,
      data: {
        hasNewPosts: hasNew,
        username,
        checkedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

// Get NEW posts (only IDs and basic info, NO metrics)
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    // Obtener Apify token del header o query
    const apifyToken = req.headers['x-apify-token'] as string || 
                       req.query.apify_token as string || 
                       process.env.APIFY_API_TOKEN || '';

    if (!apifyToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing Apify token. Provide via header "x-apify-token" or query param "apify_token"',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    const username = req.query.username as string || 
                     process.env.TARGET_PROFILE_USERNAME || 
                     'gabrielmartinezes';
    const maxPosts = parseInt(req.query.max_posts as string) || 
                    parseInt(process.env.MAX_POSTS_PER_SCRAPE || '10');
    const forceRefresh = req.query.force_refresh === 'true';

    console.log(`\n📊 Request: Get NEW post IDs for ${username} (max: ${maxPosts})`);

    // Si no es force refresh, verificar si hay posts nuevos
    if (!forceRefresh) {
      const hasNew = await apifyService.hasNewPosts(apifyToken, username);
      
      if (!hasNew) {
        console.log(`ℹ️ No new posts detected`);
        return res.json({
          success: true,
          data: {
            posts: [],
            totalPosts: 0,
            message: 'No new posts found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>);
      }
    }

    // Obtener posts completos
    const fullPosts = await apifyService.getProfilePosts(apifyToken, username, maxPosts);

    // Extraer solo IDs y info básica (SIN métricas)
    const postsBasicInfo = fullPosts.map(post => ({
      id: post.id,
      url: post.url,
      content: post.content,
      publishedAt: post.publishedAt,
      authorName: post.authorName,
      authorUrl: post.authorUrl,
    }));

    console.log(`✅ Found ${postsBasicInfo.length} new posts (IDs only, no metrics)`);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        posts: postsBasicInfo,
        totalPosts: postsBasicInfo.length,
        scrapedAt: new Date().toISOString(),
        profileUrl: `https://www.linkedin.com/in/${username}/`,
        note: 'Use /api/posts/refresh-metrics to get current metrics for these posts',
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

// Update metrics for existing posts (with cache comparison)
app.post('/api/posts/update-metrics', async (req: Request, res: Response) => {
  try {
    console.log(`\n📥 Received update-metrics request`);
    console.log(`   Body:`, JSON.stringify(req.body).substring(0, 200));
    
    const { username, posts } = req.body;

    if (!username || !posts || !Array.isArray(posts)) {
      console.error(`❌ Validation error: missing fields`);
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: username, posts (array of {id, likes, comments, reposts})',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    // Obtener Apify token del header o query
    const apifyToken = req.headers['x-apify-token'] as string || 
                       req.query.apify_token as string || 
                       process.env.APIFY_API_TOKEN || '';

    if (!apifyToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing Apify token. Provide via header "x-apify-token"',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    console.log(`\n📊 Request: Update metrics for ${posts.length} posts from ${username}`);

    // Comparar métricas para ver qué posts cambiaron
    const comparison = apifyService.comparePostMetrics(posts);
    
    console.log(`   Posts with changes: ${comparison.changed.length}`);
    console.log(`   Posts unchanged: ${comparison.unchanged.length}`);

    // Si no hay cambios, retornar vacío
    if (comparison.changed.length === 0) {
      console.log(`✅ No metrics changes detected, skipping Apify call`);
      return res.json({
        success: true,
        data: {
          updatedPosts: [],
          totalUpdated: 0,
          comparison,
          message: 'No metrics changes detected',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<any>);
    }

    // Obtener métricas actualizadas solo para posts que cambiaron
    const updatedPosts = await apifyService.updatePostMetrics(
      apifyToken,
      username,
      comparison.changed
    );

    const responseSize = JSON.stringify(updatedPosts).length;
    const sizeKB = (responseSize / 1024).toFixed(2);

    console.log(`✅ Response size: ${sizeKB} KB`);

    res.json({
      success: true,
      data: {
        updatedPosts,
        totalUpdated: updatedPosts.length,
        comparison,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

// Refresh metrics (always scrapes, no cache comparison) - RECOMMENDED FOR CLAY
app.post('/api/posts/refresh-metrics', async (req: Request, res: Response) => {
  try {
    console.log(`\n🔄 Received refresh-metrics request`);
    
    const { username, postIds } = req.body;

    if (!username || !postIds || !Array.isArray(postIds)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: username, postIds (array of post IDs)',
        example: {
          username: 'profilename',
          postIds: ['7382355485938597888', '7382356837129666561']
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    // Obtener Apify token del header o query
    const apifyToken = req.headers['x-apify-token'] as string || 
                       req.query.apify_token as string || 
                       process.env.APIFY_API_TOKEN || '';

    if (!apifyToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing Apify token. Provide via header "x-apify-token"',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    console.log(`\n📊 Request: Refresh metrics for ${postIds.length} posts from ${username}`);

    // Siempre hacer scraping, sin comparación con cache
    const updatedPosts = await apifyService.updatePostMetrics(
      apifyToken,
      username,
      postIds
    );

    const responseSize = JSON.stringify(updatedPosts).length;
    const sizeKB = (responseSize / 1024).toFixed(2);

    console.log(`✅ Response size: ${sizeKB} KB`);
    console.log(`✅ Refreshed ${updatedPosts.length} posts`);

    res.json({
      success: true,
      data: {
        posts: updatedPosts,
        totalRefreshed: updatedPosts.length,
        scrapedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

// Get interactions for a specific post (simplified - just pass post ID)
app.get('/api/interactions/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const username = req.query.username as string || 'gabrielmartinezes';

    // Obtener Apify token del header o query
    const apifyToken = req.headers['x-apify-token'] as string || 
                       req.query.apify_token as string || 
                       process.env.APIFY_API_TOKEN || '';

    if (!apifyToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing Apify token. Provide via header "x-apify-token" or query param "apify_token"',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    console.log(`\n📊 Request: Get interactions for post ${postId}`);

    // Primero obtener las métricas actuales del post
    console.log(`   Step 1: Fetching current metrics...`);
    const posts = await apifyService.updatePostMetrics(apifyToken, username, [postId]);
    
    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Post ${postId} not found`,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    const post = posts[0];
    const currentLikes = post.metrics.likes;
    const currentComments = post.metrics.comments;
    const currentReposts = post.metrics.reposts;

    console.log(`   Current metrics: ${currentLikes} likes, ${currentComments} comments, ${currentReposts} reposts`);

    // Luego obtener las interacciones
    console.log(`   Step 2: Fetching interactions...`);
    const interactions = await apifyService.getPostInteractions(apifyToken, postId, {
      likes: currentLikes,
      comments: currentComments,
    });

    const responseSize = JSON.stringify(interactions).length;
    const sizeKB = (responseSize / 1024).toFixed(2);

    console.log(`✅ Response size: ${sizeKB} KB`);
    console.log(`✅ Found ${interactions.length} interactions`);

    res.json({
      success: true,
      data: {
        postId,
        postUrl: post.url,
        metrics: {
          likes: currentLikes,
          comments: currentComments,
          reposts: currentReposts,
        },
        interactions,
        totalInteractions: interactions.length,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

// Webhook management
app.post('/webhook/subscribe', (req: Request, res: Response) => {
  const { url, events } = req.body;

  if (!url || !events) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: url, events',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }

  webhookManager.subscribe(url, events);

  res.json({
    success: true,
    data: {
      message: 'Webhook subscribed successfully',
      url,
      events,
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse<any>);
});

app.post('/webhook/unsubscribe', (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: url',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }

  const removed = webhookManager.unsubscribe(url);

  res.json({
    success: true,
    data: {
      message: removed ? 'Webhook unsubscribed' : 'Webhook not found',
      removed,
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse<any>);
});

app.get('/webhook/list', (req: Request, res: Response) => {
  const subscriptions = webhookManager.getSubscriptions();

  res.json({
    success: true,
    data: {
      subscriptions,
      total: subscriptions.length,
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse<any>);
});

// Cache management
app.post('/cache/clear', (req: Request, res: Response) => {
  apifyService.clearExpiredCache();

  res.json({
    success: true,
    data: {
      message: 'Cache cleared',
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse<any>);
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  } as ApiResponse<null>);
});

// Start server
app.listen(PORT, () => {
  console.log('\n🎯 ===================================');
  console.log('💰 APIFY MODE - COST OPTIMIZED');
  console.log('🎯 ===================================\n');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Apify Token: Pass via header "x-apify-token" or query "apify_token"`);
  console.log(`👤 Target profile: ${process.env.TARGET_PROFILE_USERNAME || 'Pass via "username" param'}`);
  console.log(`💾 Cache TTL: ${process.env.CACHE_TTL_HOURS || 24}h`);
  console.log('\n✅ Ready to receive requests!\n');
  console.log('📌 Endpoints:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/check-new-posts?username=USER`);
  console.log(`   GET  http://localhost:${PORT}/api/posts?username=USER`);
  console.log(`   POST http://localhost:${PORT}/api/posts/update-metrics (with cache)`);
  console.log(`   POST http://localhost:${PORT}/api/posts/refresh-metrics (no cache) ⭐`);
  console.log(`   GET  http://localhost:${PORT}/api/interactions/:postId`);
  console.log('\n💡 All endpoints require Apify token via header "x-apify-token"\n');
  console.log('⭐ Use /refresh-metrics for Clay - simpler and no cache issues\n');

  // Limpiar cache expirado cada 6 horas
  setInterval(() => {
    apifyService.clearExpiredCache();
  }, 6 * 60 * 60 * 1000);
});
