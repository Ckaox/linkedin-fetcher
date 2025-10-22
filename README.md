# LinkedIn Post Fetcher

REST API to scrape LinkedIn posts and interactions using Apify actors. Built for automation tools like Clay.com.

## Setup

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Configure your settings in `.env`:
```
PORT=3000
TARGET_PROFILE_USERNAME=username  # Optional fallback
CACHE_TTL_HOURS=24
```
⚠️ **Note**: Apify token is passed from Clay via header, not stored in .env

Start the server:
```bash
npm run dev:apify
```

API available at: http://localhost:3000

## Endpoints

### Health Status
```
GET /health
```

### Check for New Posts
```
GET /api/check-new-posts?username=profile-name
Headers:
  x-apify-token: YOUR_APIFY_TOKEN
```

Returns whether profile has new posts. Cost: ~$0.005

### Fetch Posts
```
GET /api/posts?username=profile-name&max_posts=10
Headers:
  x-apify-token: YOUR_APIFY_TOKEN
```

Returns post data with caching. Cost: Free if cached, ~$0.05 if scraping

### Fetch Interactions
```
GET /api/interactions/:postId?current_likes=100&current_comments=20
Headers:
  x-apify-token: YOUR_APIFY_TOKEN
```

Returns interactions if metrics changed. Cost: Free if unchanged, ~$0.35 if changed

## Deployment

### On Render
1. Push code to GitHub
2. Create Web Service on Render.com
3. Connect repository
4. Set build: `npm install && npm run build`
5. Set start: `npm start`
6. No environment variables needed! (Apify token comes from Clay)

### On Other Hosts
Works on any Node.js platform (Heroku, Railway, Fly.io):
- Ensure Node.js 18+
- No environment variables required
- Run `npm run build` then `npm start`

## Clay Integration

Store in Clay Secrets:
- `APIFY_TOKEN` - Your Apify token
- `SERVER_URL` - Your Render URL (https://your-app.onrender.com)

Create HTTP API request:
- URL: `{{secrets.SERVER_URL}}/api/check-new-posts?username=target`
- Add header:
  - `x-apify-token: {{secrets.APIFY_TOKEN}}`

Daily workflow:
1. Check for new posts (cheap)
2. If none, stop
3. If new posts, fetch data
4. Check interaction changes
5. Fetch interactions only if changed

## Authentication

Pass Apify token via header:
```
x-apify-token: your-token
```

Or via query param:
```
?apify_token=your-token
```

Username via query param:
```
?username=profile-username
```

## Cost Estimates

With daily scraping:
- No new posts: ~$0.15/month
- 2 posts/week: ~$9/month
- 1 post/day: ~$22/month

Without optimization: ~$150/month

## Requirements

- Node.js 18 or higher
- Apify account (free tier available)

## Commands

- `npm run dev:apify` - Run development server
- `npm run build` - Build for production
- `npm start` - Start production server

## License

MIT
