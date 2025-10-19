# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Apify account (free tier includes $5/month credits)

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd linkedin-clay-integration

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your API_KEY
# Note: APIFY_API_TOKEN is optional - can be sent from Clay requests
```

## Configuration

1. **Get Apify Token** (optional but recommended):
   - Sign up at https://apify.com
   - Go to Settings → Integrations → API Tokens
   - Copy your token

2. **Edit `.env` file**:
   ```env
   PORT=3000
   API_KEY=your-secure-api-key-here
   APIFY_API_TOKEN=apify_api_your_token_here  # Optional
   TARGET_PROFILE_USERNAME=gabrielmartinezes
   ```

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Check for New Posts
```bash
GET /api/check-new-posts?username=gabrielmartinezes
Headers:
  x-api-key: your-api-key
  x-apify-token: your-apify-token
```

### Get Posts
```bash
GET /api/posts?username=gabrielmartinezes&max_posts=10
Headers:
  x-api-key: your-api-key
  x-apify-token: your-apify-token
```

### Get Post Interactions
```bash
GET /api/interactions/:postId
Headers:
  x-api-key: your-api-key
  x-apify-token: your-apify-token
```

## Clay.com Integration

See [CLAY-DYNAMIC-TOKEN.md](./CLAY-DYNAMIC-TOKEN.md) for complete Clay configuration guide.

**Quick Setup:**
1. Store secrets in Clay:
   - `SERVER_API_KEY` = your API key
   - `APIFY_TOKEN` = your Apify token

2. Create HTTP API Request:
   ```
   URL: https://your-server.com/api/check-new-posts?username=gabrielmartinezes
   Headers:
     x-api-key: {{secrets.SERVER_API_KEY}}
     x-apify-token: {{secrets.APIFY_TOKEN}}
   ```

## Deployment

### Render.com (Recommended)
1. Push to GitHub
2. Connect to Render
3. Add environment variable: `API_KEY`
4. Deploy!

**Note**: Apify token comes from Clay requests, so you don't need to configure it in Render.

## Documentation

- [README.md](./README.md) - Complete documentation
- [APIFY-CLAY-FLOW.md](./APIFY-CLAY-FLOW.md) - Workflow architecture
- [COST-OPTIMIZATION.md](./COST-OPTIMIZATION.md) - Cost analysis
- [CLAY-DYNAMIC-TOKEN.md](./CLAY-DYNAMIC-TOKEN.md) - Dynamic token configuration
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Testing instructions

## Cost Estimates

- **Without optimization**: ~$150/month
- **With intelligent caching**: ~$9/month (94% savings)
- **Apify free tier**: $5/month included

## Support

For issues or questions, please open a GitHub issue.
