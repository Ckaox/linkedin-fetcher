# 🧪 Guía de Pruebas y Configuración

## ✅ Prueba exitosa realizada

El servidor está funcionando en modo TEST con datos simulados (mock).

---

## 🔐 **Respuestas a tus preguntas:**

### 1. ¿Email/password del perfil a scrapear?
**NO** ❌ — Son **TUS credenciales personales** de LinkedIn, NO las del perfil target.

**Funcionamiento:**
- Login con TU cuenta → Navegas al perfil de Gabriel → Scrapes su contenido público

### 2. ¿Puede afectar la cuenta?
**SÍ** ⚠️ — Riesgos:
- Scraping viola los TOS de LinkedIn
- Posible ban/suspensión de cuenta
- LinkedIn tiene detección anti-bot

**Mitigaciones incluidas:**
- puppeteer-stealth (evasión de detección)
- Delays aleatorios
- User-Agent real

**RECOMENDACIÓN:** Usa una cuenta secundaria de LinkedIn, NO tu cuenta principal.

### 3. ¿Es inseguro subir credenciales a GitHub?
**SÍ** ❌ — Por eso:
- `.env` está en `.gitignore` (NO se sube)
- `.env.example` se sube sin datos reales
- En Render: usa Environment Variables

### 4. ¿Cuál es mi API Key?
**La que TÚ inventes** — Es un secreto para proteger tu API.

**Ejemplo actual (en `.env`):**
```
API_KEY=test-api-key-12345
```

**Para producción, cambiala a algo más seguro:**
```
API_KEY=miClave_Secreta_2024_XYZ789!
```

---

## 🎯 **Endpoints disponibles (TEST MODE):**

### 1. Health Check
```bash
GET http://localhost:3000/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "mode": "TEST MODE - MOCK DATA",
  "timestamp": "2025-10-18T01:07:33.000Z",
  "version": "1.0.0"
}
```

### 2. Obtener Posts (con datos simulados)
```bash
GET http://localhost:3000/api/posts?api_key=test-api-key-12345
```

**Headers alternativos:**
```
X-API-Key: test-api-key-12345
```

**Respuesta (ejemplo):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "mock_post_1",
        "url": "https://www.linkedin.com/feed/update/urn:li:activity:123456",
        "authorName": "Gabriel Martínez",
        "authorUrl": "https://www.linkedin.com/in/gabrielmartinezes/",
        "authorHeadline": "CEO en Empresa Example",
        "content": "Este es un post de ejemplo...",
        "publishedAt": "2025-10-18T01:00:00.000Z",
        "mediaUrls": [],
        "metrics": {
          "likes": 45,
          "comments": 12,
          "reposts": 3
        },
        "interactions": [
          {
            "type": "like",
            "userUrl": "https://www.linkedin.com/in/usuario1/",
            "userName": "Usuario Ejemplo 1",
            "userHeadline": "Developer"
          }
        ]
      }
    ],
    "totalPosts": 2,
    "scrapedAt": "2025-10-18T01:07:33.000Z",
    "profileUrl": "https://www.linkedin.com/in/gabrielmartinezes/"
  },
  "timestamp": "2025-10-18T01:07:33.000Z"
}
```

### 3. Suscribir Webhook
```bash
POST http://localhost:3000/webhook/subscribe?api_key=test-api-key-12345
Content-Type: application/json

{
  "url": "https://hooks.clay.com/your-webhook-id",
  "events": ["new_post", "new_interaction"]
}
```

---

## 📋 **Configuración en Clay:**

### Opción 1: HTTP API (Polling 1x/día)

1. **En Clay**, crea una nueva tabla/workflow
2. Agrega acción **"HTTP API Request"**
3. Configura:
   - **Method:** GET
   - **URL:** `http://localhost:3000/api/posts` (o tu URL de Render cuando despliegues)
   - **Query Parameters:**
     - `api_key`: `test-api-key-12345`
   - **Schedule:** Daily at 7:00 AM

4. **Mapea los campos:**
   - `data.posts[].authorName` → Nombre del autor
   - `data.posts[].content` → Contenido del post
   - `data.posts[].metrics.likes` → Likes
   - `data.posts[].interactions[]` → Lista de interacciones

### Opción 2: Webhook (Push cuando hay nuevo post)

1. **En Clay**, crea un webhook endpoint
2. Copia la URL (ej: `https://hooks.clay.com/abc123`)
3. **Registra el webhook:**
   ```bash
   curl -X POST http://localhost:3000/webhook/subscribe?api_key=test-api-key-12345 \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://hooks.clay.com/abc123",
       "events": ["new_post"]
     }'
   ```

---

## 🚀 **Comandos disponibles:**

```powershell
# Modo TEST (datos simulados, sin LinkedIn real)
npm run test-mode

# Modo PRODUCCIÓN (scraping real de LinkedIn)
npm run dev

# Compilar
npm run build

# Ejecutar compilado
npm start
```

---

## 🔒 **Antes de usar scraping REAL:**

1. **Configura `.env` con TU cuenta de LinkedIn:**
   ```env
   LINKEDIN_EMAIL=tu-email-secundario@example.com
   LINKEDIN_PASSWORD=tu-password
   API_KEY=cambiaEstoPorAlgoMasSeguro123!
   TARGET_PROFILE_URL=https://www.linkedin.com/in/gabrielmartinezes/
   ```

2. **Usa una cuenta secundaria** (no tu cuenta principal)

3. **Límites recomendados:**
   - Max 1 scraping cada 6-12 horas
   - Max 50 posts por scrape
   - Usa `HEADLESS_MODE=true` en producción

4. **Deploy a Render:**
   - Las credenciales van en **Environment Variables**
   - NUNCA las subas a GitHub

---

## 📞 **Testing con cURL (PowerShell):**

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3000/health"

# Get posts
Invoke-RestMethod -Uri "http://localhost:3000/api/posts?api_key=test-api-key-12345"

# Subscribe webhook
$body = @{
    url = "https://hooks.clay.com/your-id"
    events = @("new_post", "new_interaction")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/webhook/subscribe?api_key=test-api-key-12345" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## ⚠️ **Disclaimer Legal:**

Este proyecto es solo para fines educativos. El scraping de LinkedIn viola sus Términos de Servicio. Úsalo bajo tu propio riesgo. El autor no se hace responsable por cuentas baneadas o acciones legales.

**Alternativas legales:**
- LinkedIn Official API (requiere partnership)
- Phantombuster (servicio pago con proxy)
- Datos públicos con consentimiento
