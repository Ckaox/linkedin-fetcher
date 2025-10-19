# 🎯 LinkedIn → Clay Integration (Apify + Token Dinámico)# 🎯 LinkedIn → Clay Integration (Apify Optimizado)# LinkedIn to Clay Integration 🔗



Sistema inteligente para scrapear posts e interacciones de LinkedIn y exponerlos vía API REST para Clay.com con **optimización extrema de costos** usando Apify.



## 🌟 Características PrincipalesSistema inteligente para scrapear posts e interacciones de LinkedIn y exponerlos vía API REST para Clay.com con **optimización extrema de costos** usando Apify.**API REST + Webhooks** para scrapear posts de LinkedIn y enviar datos automáticamente a Clay.com.



✅ **Token dinámico desde Clay** - No hardcodees credenciales  

✅ **Sin riesgo de ban** - Usa Apify (sin cookies/login)  

✅ **Ultra optimizado** - Cache inteligente, ~94% menos costo  ---## 🎯 Características

✅ **Costo mínimo** - ~$5-15/mes (vs $150/mes)  

✅ **Compatible con Clay** - Respuestas < 200KB  

✅ **Multi-tenant** - Múltiples usuarios, cada uno con su token  

## 🌟 Características- ✅ Scraping de posts de perfil LinkedIn (sin base de datos)

---

- ✅ Extracción de interacciones (likes, comments, reposts)

## 💰 Ahorro de Costos

✅ **Sin riesgo de ban** - Usa Apify (sin cookies/login)  - ✅ API REST para consultas on-demand desde Clay

| Sin Optimización | Con Optimización | Ahorro |

|-----------------|------------------|--------|✅ **Ultra optimizado** - Cache inteligente, scraping solo cuando hay cambios  - ✅ Sistema de webhooks para notificaciones

| $150/mes | $9/mes | **94%** 🎉 |

✅ **Costo mínimo** - ~$5-15/mes (vs $150/mes sin optimización)  - ✅ Autenticación con API Key

📖 Ver: [`COST-OPTIMIZATION.md`](COST-OPTIMIZATION.md)

✅ **Compatible con Clay** - Respuestas < 200KB  - ✅ Rate limiting y seguridad

---

✅ **Webhooks** - Notificaciones automáticas  - ✅ Listo para deploy en Render (free tier)

## 🚀 Quick Start

✅ **API REST** - Fácil integración  

### 1. Instalar

```powershell---

npm install

```---



### 2. Configurar `.env`## 📋 Requisitos

```env

# Tu API Key (invéntala)## 💰 Ahorro de Costos

API_KEY=tu-clave-servidor-123

- Node.js 18+ 

# Configuración básica

PORT=3000| Sin Optimización | Con Optimización | Ahorro |- Cuenta de LinkedIn (opcional pero recomendado)

TARGET_PROFILE_USERNAME=gabrielmartinezes

MAX_POSTS_PER_SCRAPE=10|-----------------|------------------|--------|- Cuenta de Render.com (o cualquier hosting Node.js)

```

| $150/mes | $9/mes | **94%** 🎉 |- Cuenta de Clay.com

**🔑 Nota:** El token de Apify lo envía **Clay en cada request**, no va en `.env`



### 3. Iniciar

```powershell**Estrategias implementadas:**---

npm run dev:apify

```- ✅ Check rápido antes de scrapear ($0.005 vs $0.05)



---- ✅ Cache de 24h (evita scraping repetido)## 🚀 Instalación Local



## 📡 Cómo Clay envía el token- ✅ Solo scrape interactions si stats cambiaron



### **Método 1: Header (RECOMENDADO)**- ✅ Detección inteligente de posts nuevos### 1. Clonar e instalar dependencias

```http

GET /api/posts

Headers:

  x-api-key: tu-clave-servidor-123📖 Ver: [`COST-OPTIMIZATION.md`](COST-OPTIMIZATION.md) para detalles completos```bash

  x-apify-token: apify_api_xxxxxxxxxx

```npm install



### **Método 2: Query Parameter**---```

```http

GET /api/posts?api_key=tu-clave-servidor-123&apify_token=apify_api_xxx

```

## 🚀 Quick Start### 2. Configurar variables de entorno

📖 Ver: [`CLAY-DYNAMIC-TOKEN.md`](CLAY-DYNAMIC-TOKEN.md) para guía completa



---

### 1. **Instalar dependencias**Crea un archivo `.env` basado en `.env.example`:

## 📡 Endpoints



### **Check Posts Nuevos** ⚡

```http```powershell```bash

GET /api/check-new-posts

Headers:npm installcp .env.example .env

  x-api-key: YOUR_KEY

  x-apify-token: APIFY_TOKEN``````

Query:

  ?username=gabrielmartinezes

```

Costo: ~$0.005 | Retorna: `{hasNewPosts: true/false}`### 2. **Configurar credenciales**Edita `.env` con tus credenciales:



### **Obtener Posts** 💾

```http

GET /api/postsCrea archivo `.env` (copia de `.env.example`):```env

Headers:

  x-api-key: YOUR_KEYPORT=3000

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
