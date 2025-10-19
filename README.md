# LinkedIn Post Fetcher# LinkedIn to Clay Integration# 🎯 LinkedIn → Clay Integration (Apify + Token Dinámico)# 🎯 LinkedIn → Clay Integration (Apify Optimizado)# LinkedIn to Clay Integration 🔗



API service for scraping LinkedIn posts and interactions, designed to integrate with automation platforms like Clay.com. Uses Apify actors for reliable data extraction with intelligent caching to minimize costs.



## Quick StartREST API service that scrapes LinkedIn posts and interactions on-demand, designed to integrate with Clay.com workflows. Built with Node.js, TypeScript, and Apify for reliable data extraction.



Install dependencies:

```bash

npm install## FeaturesSistema inteligente para scrapear posts e interacciones de LinkedIn y exponerlos vía API REST para Clay.com con **optimización extrema de costos** usando Apify.

```



Configure environment variables:

```bash- Scrape LinkedIn posts from any public profile

cp .env.example .env

```- Extract engagement metrics (likes, comments, reposts)



Edit `.env` with your settings:- Intelligent caching to minimize costs (24-hour TTL)## 🌟 Características PrincipalesSistema inteligente para scrapear posts e interacciones de LinkedIn y exponerlos vía API REST para Clay.com con **optimización extrema de costos** usando Apify.**API REST + Webhooks** para scrapear posts de LinkedIn y enviar datos automáticamente a Clay.com.

```env

PORT=3000- Dynamic Apify token support (sent from Clay per request)

API_KEY=your-secret-key

TARGET_PROFILE_USERNAME=target-linkedin-username- Webhook notifications for new posts

```

- Change detection to avoid unnecessary scraping

Start the server:

```bash- Ready to deploy on Render free tier✅ **Token dinámico desde Clay** - No hardcodees credenciales  

npm run dev:apify

```



Server runs at `http://localhost:3000`## Cost Optimization✅ **Sin riesgo de ban** - Usa Apify (sin cookies/login)  



## API Reference



All endpoints require authentication via `x-api-key` header or `api_key` query parameter.The system uses intelligent caching and change detection to reduce scraping costs:✅ **Ultra optimizado** - Cache inteligente, ~94% menos costo  ---## 🎯 Características



### Health Check



```- Without optimization: ~$150/month✅ **Costo mínimo** - ~$5-15/mes (vs $150/mes)  

GET /health

```- With optimization: ~$9/month (94% savings)



Returns server status and cache statistics.- Quick checks before expensive operations (~$0.005 vs $0.05)✅ **Compatible con Clay** - Respuestas < 200KB  



### Check for New Posts- Only scrape interactions when metrics change



```✅ **Multi-tenant** - Múltiples usuarios, cada uno con su token  

GET /api/check-new-posts?username=profilename

## Requirements

Headers:

  x-api-key: YOUR_KEY## 🌟 Características- ✅ Scraping de posts de perfil LinkedIn (sin base de datos)

  x-apify-token: YOUR_APIFY_TOKEN

```- Node.js 18+



Quick check if profile has new posts. Cost: ~$0.005- Apify account (free tier includes $5/month credits)---



Response:- Clay.com account

```json

{- ✅ Extracción de interacciones (likes, comments, reposts)

  "success": true,

  "data": {## Installation

    "hasNewPosts": true,

    "username": "profilename",## 💰 Ahorro de Costos

    "checkedAt": "2025-10-19T10:00:00Z"

  }```bash

}

```npm install✅ **Sin riesgo de ban** - Usa Apify (sin cookies/login)  - ✅ API REST para consultas on-demand desde Clay



### Get Postscp .env.example .env



``````| Sin Optimización | Con Optimización | Ahorro |

GET /api/posts?username=profilename&max_posts=10



Headers:

  x-api-key: YOUR_KEYEdit `.env` with your configuration:|-----------------|------------------|--------|✅ **Ultra optimizado** - Cache inteligente, scraping solo cuando hay cambios  - ✅ Sistema de webhooks para notificaciones

  x-apify-token: YOUR_APIFY_TOKEN

```



Returns posts with caching. Cost: Free if cached, ~$0.05 if scraping needed.```env| $150/mes | $9/mes | **94%** 🎉 |



Response:PORT=3000

```json

{API_KEY=your-server-api-key✅ **Costo mínimo** - ~$5-15/mes (vs $150/mes sin optimización)  - ✅ Autenticación con API Key

  "success": true,

  "data": {TARGET_PROFILE_USERNAME=gabrielmartinezes

    "posts": [

      {MAX_POSTS_PER_SCRAPE=10📖 Ver: [`COST-OPTIMIZATION.md`](COST-OPTIMIZATION.md)

        "id": "post-id",

        "url": "post-url",CACHE_TTL_HOURS=24

        "authorName": "Author Name",

        "content": "Post content...",```✅ **Compatible con Clay** - Respuestas < 200KB  - ✅ Rate limiting y seguridad

        "publishedAt": "2025-10-15T14:30:00Z",

        "metrics": {

          "likes": 45,

          "comments": 12,Note: The Apify token should be sent from Clay in each request, not stored in `.env`.---

          "reposts": 5

        }

      }

    ],## Usage✅ **Webhooks** - Notificaciones automáticas  - ✅ Listo para deploy en Render (free tier)

    "totalPosts": 10,

    "scrapedAt": "2025-10-19T10:00:00Z"

  }

}Start the server:## 🚀 Quick Start

```



### Get Post Interactions

```bash✅ **API REST** - Fácil integración  

```

GET /api/interactions/:postId?current_likes=120&current_comments=15npm run dev:apify



Headers:```### 1. Instalar

  x-api-key: YOUR_KEY

  x-apify-token: YOUR_APIFY_TOKEN

```

The API will be available at `http://localhost:3000````powershell---

Returns interactions only if metrics changed. Cost: Free if unchanged, ~$0.35 if scraping needed.



## Deployment

## API Endpointsnpm install

### Deploy to Render



1. Push code to GitHub

2. Create new Web Service on Render.com### Health Check```---

3. Connect your repository

4. Configure:```http

   - Build Command: `npm install && npm run build`

   - Start Command: `npm start`GET /health

5. Add environment variable: `API_KEY=your-secret-key`

6. Deploy```



Your API will be at: `https://your-service.onrender.com`### 2. Configurar `.env`## 📋 Requisitos



### Deploy to Other Platforms### Check for New Posts (Quick & Cheap)



Works on any Node.js hosting platform (Heroku, Railway, Fly.io, etc.):```http```env



1. Ensure Node.js 18+ is availableGET /api/check-new-posts

2. Set `API_KEY` environment variable

3. Build: `npm run build`Headers:# Tu API Key (invéntala)## 💰 Ahorro de Costos

4. Start: `npm start`

  x-api-key: YOUR_API_KEY

## Integration with Clay.com

  x-apify-token: YOUR_APIFY_TOKENAPI_KEY=tu-clave-servidor-123

### Store Credentials

Query:

In Clay, go to Settings > Secrets and add:

- `SERVER_API_KEY`: Your API server key  ?username=profileusername- Node.js 18+ 

- `APIFY_TOKEN`: Your Apify API token

```

### HTTP Request Setup

# Configuración básica

Create HTTP API column with:

- Method: GETCost: ~$0.005 per check

- URL: `https://your-server.com/api/check-new-posts?username=targetuser`

- Headers:PORT=3000| Sin Optimización | Con Optimización | Ahorro |- Cuenta de LinkedIn (opcional pero recomendado)

  - `x-api-key: {{secrets.SERVER_API_KEY}}`

  - `x-apify-token: {{secrets.APIFY_TOKEN}}`### Get Posts



### Recommended Workflow```httpTARGET_PROFILE_USERNAME=gabrielmartinezes



Run daily (1x per day):GET /api/posts



1. Check for new posts (cheap, ~$0.005)Headers:MAX_POSTS_PER_SCRAPE=10|-----------------|------------------|--------|- Cuenta de Render.com (o cualquier hosting Node.js)

2. If no new posts, stop

3. If new posts exist, scrape full data  x-api-key: YOUR_API_KEY

4. Store posts in Clay table

5. For each post, check if interactions changed  x-apify-token: YOUR_APIFY_TOKEN```

6. Scrape interactions only if metrics changed

Query:

This approach minimizes costs by avoiding unnecessary scraping.

  ?username=profileusername&max_posts=10| $150/mes | $9/mes | **94%** 🎉 |- Cuenta de Clay.com

## Authentication Options

```

### Option 1: Header (Recommended)

```**🔑 Nota:** El token de Apify lo envía **Clay en cada request**, no va en `.env`

Headers:

  x-api-key: your-api-keyCost: Free if cached, $0.05 if scraping needed

  x-apify-token: your-apify-token

```



### Option 2: Query Parameters### Get Interactions

```

?api_key=your-api-key&apify_token=your-apify-token```http### 3. Iniciar

```

GET /api/interactions/:postId

## Cost Optimization

Headers:```powershell**Estrategias implementadas:**---

The system implements several strategies to reduce API costs:

  x-api-key: YOUR_API_KEY

- 24-hour cache for posts

- Quick checks before expensive operations  x-apify-token: YOUR_APIFY_TOKENnpm run dev:apify

- Change detection for interactions (only scrape if metrics changed)

- Smart hash comparison to avoid redundant requestsQuery:



Estimated monthly costs with daily scraping:  ?current_likes=120&current_comments=15```- ✅ Check rápido antes de scrapear ($0.005 vs $0.05)

- Profile with no new posts: ~$0.15/month

- Profile with 2 posts/week: ~$9/month```

- Profile with 1 post/day: ~$22/month



Without optimization: ~$150/month (94% savings)

Cost: Free if no changes detected, $0.35 if scraping needed

## Configuration

---- ✅ Cache de 24h (evita scraping repetido)## 🚀 Instalación Local

Available environment variables:

## Clay Integration

```env

PORT=3000

API_KEY=your-api-key

TARGET_PROFILE_USERNAME=default-username### Setup in Clay

MAX_POSTS_PER_SCRAPE=10

CACHE_TTL_HOURS=24## 📡 Cómo Clay envía el token- ✅ Solo scrape interactions si stats cambiaron

```

1. Store credentials in Clay Secrets:

Note: Apify token should be sent in each request from your automation platform, not stored in `.env`.

   - `SERVER_API_KEY`: Your server API key

## Requirements

   - `APIFY_TOKEN`: Your Apify API token

- Node.js 18 or higher

- Apify account (free tier includes $5/month credits)### **Método 1: Header (RECOMENDADO)**- ✅ Detección inteligente de posts nuevos### 1. Clonar e instalar dependencias

- Valid API key for authentication

2. Create HTTP API Request action:

## Scripts

   - URL: `https://your-server.com/api/check-new-posts?username=profileusername````http

- `npm run dev:apify` - Development server

- `npm run build` - Compile TypeScript   - Headers:

- `npm start` - Production server

     - `x-api-key: {{secrets.SERVER_API_KEY}}`GET /api/posts

## License

     - `x-apify-token: {{secrets.APIFY_TOKEN}}`

MIT

Headers:

3. Optimal workflow (runs 1x/day):

   - Check for new posts → If none → Stop (saves money)  x-api-key: tu-clave-servidor-123📖 Ver: [`COST-OPTIMIZATION.md`](COST-OPTIMIZATION.md) para detalles completos```bash

   - If new posts exist → Scrape posts → Store in "Posts" table

   - For each post → Check if interactions changed → Scrape if needed → Store in "Interactions" table  x-apify-token: apify_api_xxxxxxxxxx



## Deployment to Render```npm install



1. Push code to GitHub

2. Create new Web Service in Render.com

3. Connect your repository### **Método 2: Query Parameter**---```

4. Add environment variable: `API_KEY=your-api-key`

5. Deploy```http



Render free tier specifications:GET /api/posts?api_key=tu-clave-servidor-123&apify_token=apify_api_xxx

- 750 hours/month (sufficient for daily scraping)

- Sleeps after 15 minutes of inactivity```

- First request after sleep takes ~1 minute

## 🚀 Quick Start### 2. Configurar variables de entorno

## Dynamic Token Architecture

📖 Ver: [`CLAY-DYNAMIC-TOKEN.md`](CLAY-DYNAMIC-TOKEN.md) para guía completa

The Apify token is sent from Clay in each request rather than being hardcoded in the server. This provides:



- Better security (no credentials in code)

- Multi-tenant support (multiple Clay users can use the same server)---

- Easy credential rotation without redeployment

### 1. **Instalar dependencias**Crea un archivo `.env` basado en `.env.example`:

### Token Methods

## 📡 Endpoints

**Option 1: Header (Recommended)**

```http

Headers:

  x-apify-token: apify_api_xxxxxxxxxxxx### **Check Posts Nuevos** ⚡

```

```http```powershell```bash

**Option 2: Query Parameter**

```httpGET /api/check-new-posts

?apify_token=apify_api_xxxxxxxxxxxx

```Headers:npm installcp .env.example .env



## Project Structure  x-api-key: YOUR_KEY



```  x-apify-token: APIFY_TOKEN``````

.

├── src/Query:

│   ├── apify-service.ts    # Core Apify integration with caching

│   ├── server-apify.ts     # Express API server  ?username=gabrielmartinezes

│   ├── types.ts            # TypeScript interfaces

│   └── webhook.ts          # Webhook management```

├── .env.example            # Environment variables template

├── package.jsonCosto: ~$0.005 | Retorna: `{hasNewPosts: true/false}`### 2. **Configurar credenciales**Edita `.env` con tus credenciales:

├── tsconfig.json

└── README.md

```

### **Obtener Posts** 💾

## Scripts

```http

- `npm run dev:apify` - Start development server with Apify integration

- `npm run build` - Compile TypeScript to JavaScriptGET /api/postsCrea archivo `.env` (copia de `.env.example`):```env

- `npm start` - Run production server

Headers:

## License

  x-api-key: YOUR_KEYPORT=3000

MIT License

  x-apify-token: APIFY_TOKEN

Query:```envNODE_ENV=development

  ?username=gabrielmartinezes&max_posts=10

```# API Key (la que tú inventes)

Costo: GRATIS (cache) o $0.05 (scrape)

API_KEY=tu-clave-secreta-12345# Genera una API key segura (usa: openssl rand -hex 32)

### **Obtener Interacciones** 👥

```httpAPI_KEY=tu-api-key-super-secreta

GET /api/interactions/:postId

Headers:# Apify Token (obtén uno gratis en https://apify.com)

  x-api-key: YOUR_KEY

  x-apify-token: APIFY_TOKENAPIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxx# LinkedIn credentials (OPCIONAL pero recomendado para evitar límites)

Query:

  ?current_likes=120&current_comments=15LINKEDIN_EMAIL=tu-email@example.com

```

Costo: GRATIS (sin cambios) o $0.35 (scrape)# Perfil a scrapearLINKEDIN_PASSWORD=tu-password



---TARGET_PROFILE_USERNAME=gabrielmartinezes



## 🎨 Configuración en Clay# Perfil objetivo (el que querés scrapear)



### **1. Guardar tokens en Clay Secrets**# ConfiguraciónTARGET_PROFILE_URL=https://www.linkedin.com/in/gabrielmartinezes/

```

Settings → Secrets:MAX_POSTS_PER_SCRAPE=10

  SERVER_API_KEY = tu-clave-servidor-123

  APIFY_TOKEN = apify_api_xxxxxxxxxxCACHE_TTL_HOURS=24# Configuración de scraping

```

```MAX_POSTS_PER_SCRAPE=50

### **2. HTTP API Request**

```HEADLESS_MODE=true

URL: https://tu-servidor.com/api/posts

Headers:### 3. **Obtener API Token de Apify**SCRAPING_TIMEOUT=120000

  x-api-key: {{secrets.SERVER_API_KEY}}

  x-apify-token: {{secrets.APIFY_TOKEN}}

Query:

  username=gabrielmartinezes&max_posts=101. Regístrate en https://apify.com (plan gratuito: $5/mes)# Webhooks

```

2. Ve a Settings → Integrations → API TokensWEBHOOK_TIMEOUT=10000

### **3. Workflow Optimizado**

```3. Copia el token y pégalo en `.env`WEBHOOK_MAX_RETRIES=3

1. Check nuevos → Si no hay → STOP (ahorra $$$)

2. Scrapear posts → Tabla "Posts"```

3. Loop interactions → Tabla "Interactions"

```### 4. **Iniciar servidor**



📖 Guía completa: [`APIFY-CLAY-FLOW.md`](APIFY-CLAY-FLOW.md)### 3. Ejecutar en desarrollo



---```powershell



## 💡 Ventajas del Token Dinámiconpm run dev:apify```bash



### ✅ **Para el servidor**```npm run dev

- No expones tu Apify token

- Múltiples clientes pueden usar el servidor```

- Cada cliente usa su propio token

Tu API estará en http://localhost:3000 🚀

### ✅ **Para Clay**

- Control total de credencialesEl servidor estará corriendo en `http://localhost:3000`

- Cambiar token sin reiniciar servidor

- No depende de configuración del servidor---



### ✅ **Seguridad**### 4. Build para producción

- Tokens nunca en código fuente

- Clay Secrets encripta los tokens## 📡 Endpoints Principales

- Fácil rotación de credenciales

```bash

---

### **Check Posts Nuevos** (Ligero - casi gratis)npm run build

## 🧪 Testing

```httpnpm start

### **Sin token (debe fallar)**

```powershellGET /api/check-new-posts?api_key=YOUR_KEY```

Invoke-RestMethod -Uri "http://localhost:3000/api/posts?api_key=test-api-key-12345"

``````



### **Con token en header**Costo: ~$0.005 | Uso: Ejecuta PRIMERO antes de scrapear---

```powershell

$headers = @{

    "x-api-key" = "test-api-key-12345"

    "x-apify-token" = "apify_api_xxxxxxxxxx"### **Obtener Posts** (Con cache inteligente)## 📡 Endpoints API

}

```http

Invoke-RestMethod -Uri "http://localhost:3000/api/posts?username=gabrielmartinezes" -Headers $headers

```GET /api/posts?api_key=YOUR_KEY&max_posts=10### Base URL



---``````



## 💸 Costos por EscenarioCosto: GRATIS si usa cache, $0.05 si scrapehttp://localhost:3000



| Escenario | Posts/mes | Costo |```

|-----------|-----------|-------|

| Perfil inactivo | 0 | $0.15 |### **Obtener Interacciones**

| 2 posts/semana | 8 | $9 |

| 1 post/día | 30 | $22 |```http### Autenticación



📊 Ver: [`COST-OPTIMIZATION.md`](COST-OPTIMIZATION.md)GET /api/interactions/:postId?current_likes=120&current_comments=15&api_key=YOUR_KEY



---```Todos los endpoints (excepto `/health`) requieren API Key:



## 🚀 Deploy a Render (Gratis)Costo: GRATIS si no hay cambios, $0.35 si scrape



1. Push a GitHub**Opción 1: Header**

2. Conectar en Render.com

3. Agregar **solo** `API_KEY` en Environment Variables---```

4. Deploy automático

X-API-Key: tu-api-key

✅ Render Free tier es perfecto para este caso

## 🎯 Workflow en Clay (1x/día)```

---



## 📚 Documentación Completa

```**Opción 2: Query param**

- 🔐 [`CLAY-DYNAMIC-TOKEN.md`](CLAY-DYNAMIC-TOKEN.md) - **Uso con token dinámico**

- 📖 [`APIFY-CLAY-FLOW.md`](APIFY-CLAY-FLOW.md) - Configuración completa en Clay1. Check nuevos posts → Si no hay → STOP (ahorra $$$)```

- 💰 [`COST-OPTIMIZATION.md`](COST-OPTIMIZATION.md) - Estrategias de ahorro

- 🧪 [`TESTING-GUIDE.md`](TESTING-GUIDE.md) - Guía de pruebas                      → Si hay → Continuar?api_key=tu-api-key



---2. Scrapear posts → Guardar en Tabla "Posts"```



## 🎉 ¡Listo!3. Loop por cada post → Scrapear interactions → Tabla "Interactions"



```powershell```---

npm run dev:apify

```



Tu API estará en http://localhost:3000📖 Ver: [`APIFY-CLAY-FLOW.md`](APIFY-CLAY-FLOW.md) para configuración completa en Clay### 1️⃣ Health Check



**Siguiente:** Configura Clay → [`CLAY-DYNAMIC-TOKEN.md`](CLAY-DYNAMIC-TOKEN.md) 🚀


---```http

GET /health

## 💸 Costos Estimados```



| Escenario | Costo/mes |**Response:**

|-----------|-----------|```json

| Perfil inactivo (0 posts nuevos) | $0.15 |{

| 2 posts/semana | $9 |  "success": true,

| 1 post/día | $22 |  "data": {

| Sin optimización | $150 ❌ |    "status": "healthy",

    "uptime": 123.45,

---    "timestamp": "2025-10-18T10:30:00.000Z"

  }

## 📚 Documentación}

```

- 📖 [`APIFY-CLAY-FLOW.md`](APIFY-CLAY-FLOW.md) - Configuración completa de Clay

- 💰 [`COST-OPTIMIZATION.md`](COST-OPTIMIZATION.md) - Estrategias de ahorro detalladas---

- 🧪 [`TESTING-GUIDE.md`](TESTING-GUIDE.md) - Guía de testing

### 2️⃣ Obtener Posts (Principal)

---

```http

## 🚀 Deploy a Render (Gratis)GET /api/posts

```

1. Push a GitHub

2. Conectar en Render.com**Query params opcionales:**

3. Agregar variables de entorno- `include_interactions=true` - Incluir likes/comments (más lento)

4. Deploy automático

**Response:**

Render Free: Perfecto para este caso ✅```json

{

---  "success": true,

  "data": {

## 📞 Testing Rápido    "posts": [

      {

```powershell        "id": "7123456789012345678",

# Health        "url": "https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678",

Invoke-RestMethod -Uri "http://localhost:3000/health"        "authorName": "Gabriel Martinez",

        "authorUrl": "https://www.linkedin.com/in/gabrielmartinezes/",

# Check nuevos        "authorHeadline": "CEO at Company",

Invoke-RestMethod -Uri "http://localhost:3000/api/check-new-posts?api_key=test-api-key-12345"        "content": "Post content here...",

        "publishedAt": "2025-10-15T14:30:00.000Z",

# Posts        "mediaUrls": ["https://media.licdn.com/..."],

Invoke-RestMethod -Uri "http://localhost:3000/api/posts?api_key=test-api-key-12345"        "metrics": {

```          "likes": 45,

          "comments": 12,

---          "reposts": 5

        },

**¡Listo para ahorrar dinero! 💰**        "interactions": []

      }

Siguiente: Configura tu token de Apify y ejecuta `npm run dev:apify`    ],

    "totalPosts": 25,
    "scrapedAt": "2025-10-18T10:30:00.000Z",
    "profileUrl": "https://www.linkedin.com/in/gabrielmartinezes/"
  },
  "timestamp": "2025-10-18T10:30:00.000Z"
}
```

---

### 3️⃣ Obtener Interacciones de un Post

```http
GET /api/posts/:postUrl/interactions
```

**Ejemplo:**
```http
GET /api/posts/https%3A%2F%2Fwww.linkedin.com%2Ffeed%2Fupdate%2Furn%3Ali%3Aactivity%3A7123456789012345678/interactions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "postUrl": "https://www.linkedin.com/feed/update/...",
    "interactions": [
      {
        "type": "like",
        "userName": "John Doe",
        "userUrl": "https://www.linkedin.com/in/johndoe/",
        "userHeadline": "Software Engineer at Tech Co",
        "userProfilePicture": "https://media.licdn.com/..."
      },
      {
        "type": "comment",
        "userName": "Jane Smith",
        "userUrl": "https://www.linkedin.com/in/janesmith/",
        "userHeadline": "Product Manager",
        "commentText": "Great post!",
        "timestamp": "2025-10-15T15:00:00.000Z"
      }
    ],
    "totalInteractions": 57,
    "scrapedAt": "2025-10-18T10:35:00.000Z"
  }
}
```

---

### 4️⃣ Suscribir Webhook

```http
POST /api/webhooks/subscribe
```

**Body:**
```json
{
  "url": "https://hooks.clay.com/your-webhook-url",
  "events": ["new_post"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Webhook subscribed successfully",
    "url": "https://hooks.clay.com/your-webhook-url",
    "events": ["new_post"]
  }
}
```

---

### 5️⃣ Listar Webhooks

```http
GET /api/webhooks
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "url": "https://hooks.clay.com/webhook1",
        "events": ["new_post"],
        "createdAt": "2025-10-18T09:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

### 6️⃣ Desuscribir Webhook

```http
DELETE /api/webhooks/unsubscribe
```

**Body:**
```json
{
  "url": "https://hooks.clay.com/your-webhook-url"
}
```

---

## 🎨 Integración con Clay

### Opción 1: HTTP API (Recomendado)

1. **En Clay, crea una nueva tabla**
2. **Agrega columna "HTTP API"**:
   - Method: `GET`
   - URL: `https://tu-server.render.com/api/posts`
   - Headers:
     ```
     X-API-Key: tu-api-key
     ```
3. **Configura trigger:**
   - Frequency: Daily (o custom schedule)
4. **Procesa la respuesta:**
   - Usa "Parse JSON" para extraer `data.posts`
   - Expande arrays para crear filas por cada post

### Opción 2: Webhook Push

1. **En Clay, obtén tu webhook URL** (Settings → Integrations → Webhooks)
2. **Suscribe el webhook:**
   ```bash
   curl -X POST https://tu-server.render.com/api/webhooks/subscribe \
     -H "X-API-Key: tu-api-key" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://hooks.clay.com/tu-webhook","events":["new_post"]}'
   ```
3. **Clay recibirá datos automáticamente** cada vez que se ejecute el scraping

---

## 🌐 Deploy en Render (Free)

### 1. Crear cuenta en Render.com

Visita [render.com](https://render.com) y crea una cuenta gratuita.

### 2. Crear Web Service

1. Click **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name:** `linkedin-clay-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

### 3. Variables de entorno

En Render, ve a **Environment** y agrega:

```
NODE_ENV=production
PORT=3000
API_KEY=tu-api-key-segura
LINKEDIN_EMAIL=tu-email@example.com
LINKEDIN_PASSWORD=tu-password
TARGET_PROFILE_URL=https://www.linkedin.com/in/gabrielmartinezes/
MAX_POSTS_PER_SCRAPE=50
HEADLESS_MODE=true
SCRAPING_TIMEOUT=120000
WEBHOOK_TIMEOUT=10000
WEBHOOK_MAX_RETRIES=3
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Deploy

Click **"Create Web Service"** — Render desplegará automáticamente.

Tu API estará en: `https://linkedin-clay-api.onrender.com`

---

## ⚠️ Consideraciones Importantes

### 1. LinkedIn Rate Limits

- **Sin login:** ~40 requests/hora
- **Con login:** ~100 requests/hora
- **Recomendación:** Scrapea 1 vez al día máximo

### 2. Render Free Tier

- ✅ **Gratis forever**
- ⚠️ **Se duerme después de 15 min inactivo** (primer request tardará ~1 min)
- ⚠️ **750 horas/mes gratis** (suficiente para 1x/día)
- 💡 **Solución:** Usa un cron externo (ej. cron-job.org) para hacer ping cada 10 min

### 3. Privacidad y Legales

- ⚠️ **LinkedIn TOS:** El scraping automatizado puede violar términos de servicio
- 🔐 **Uso responsable:** Solo scrapea perfiles públicos
- 📝 **Recomendación:** Usa la API oficial de LinkedIn cuando esté disponible

---

## 🛠️ Troubleshooting

### Error: "Cannot find module 'puppeteer'"

```bash
npm install
```

### Error: "Login failed"

- Verifica credenciales en `.env`
- LinkedIn puede requerir verificación 2FA (usa navegador manual primero)

### Error: "No posts found"

- El perfil puede ser privado
- Intenta con login activado
- Verifica que la URL del perfil sea correcta

### Render: "Application failed to respond"

- Aumenta `SCRAPING_TIMEOUT` en variables de entorno
- Verifica logs en Render dashboard

---

## 📚 Estructura del Proyecto

```
linkedin-clay-integration/
├── src/
│   ├── types.ts          # TypeScript interfaces
│   ├── scraper.ts        # LinkedIn scraper con Puppeteer
│   ├── webhook.ts        # Webhook manager
│   └── server.ts         # Express API server
├── dist/                 # Compiled JavaScript (generado)
├── .env.example          # Plantilla de variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤝 Soporte

¿Problemas? Abre un issue en GitHub o contacta al equipo.

---

## 📄 Licencia

MIT License - Uso libre con atribución.
