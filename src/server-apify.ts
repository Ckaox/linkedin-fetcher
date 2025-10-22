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

// Get posts (CON CACHE - solo scrape si hay nuevos)
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

    console.log(`\n📊 Request: Get posts for ${username} (max: ${maxPosts}, force: ${forceRefresh})`);

    // Si no es force refresh, intentar cache primero
    if (!forceRefresh) {
      // Verificar si hay posts nuevos antes de scrapear
      const hasNew = await apifyService.hasNewPosts(apifyToken, username);
      
      if (!hasNew) {
        console.log(`ℹ️ No new posts detected, skipping expensive scraping`);
      }
    }

    // Obtener posts (usa cache si está disponible)
    const posts = await apifyService.getProfilePosts(apifyToken, username, maxPosts);

    // Calcular tamaño del response
    const responseSize = JSON.stringify(posts).length;
    const sizeKB = (responseSize / 1024).toFixed(2);

    console.log(`✅ Response size: ${sizeKB} KB (Clay limit: 200 KB)`);

    if (responseSize > 200 * 1024) {
      console.warn(`⚠️ Response exceeds Clay limit! Consider reducing max_posts`);
    }

    const response: ApiResponse<PostsResponse> = {
      success: true,
      data: {
        posts,
        totalPosts: posts.length,
        scrapedAt: new Date().toISOString(),
        profileUrl: `https://www.linkedin.com/in/${username}/`,
      },
      timestamp: new Date().toISOString(),
    };

    // Notificar webhooks si hay posts nuevos
    if (posts.length > 0) {
      webhookManager.notify('new_post', posts[0]);
    }

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

// Get interactions for a specific post
app.get('/api/interactions/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const currentLikes = parseInt(req.query.current_likes as string) || 0;
    const currentComments = parseInt(req.query.current_comments as string) || 0;

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
    console.log(`   Current stats: ${currentLikes} likes, ${currentComments} comments`);

    const interactions = await apifyService.getPostInteractions(apifyToken, postId, {
      likes: currentLikes,
      comments: currentComments,
    });

    const responseSize = JSON.stringify(interactions).length;
    const sizeKB = (responseSize / 1024).toFixed(2);

    console.log(`✅ Response size: ${sizeKB} KB`);

    res.json({
      success: true,
      data: {
        postId,
        interactions,
        total: interactions.length,
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
  console.log(`   GET  http://localhost:${PORT}/api/interactions/:postId`);
  console.log('\n💡 All endpoints require Apify token via header "x-apify-token"\n');

  // Limpiar cache expirado cada 6 horas
  setInterval(() => {
    apifyService.clearExpiredCache();
  }, 6 * 60 * 60 * 1000);
});
