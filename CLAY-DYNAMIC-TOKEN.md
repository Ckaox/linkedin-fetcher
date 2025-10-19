# 🔐 Uso con Token Dinámico desde Clay

## 🎯 Concepto

En vez de tener el **Apify Token hardcodeado** en el servidor, Clay lo envía en **cada request**. Esto permite:

✅ **Múltiples usuarios** pueden usar el mismo servidor con sus propios tokens  
✅ **Más seguro** - El token no está en el código ni en variables de entorno públicas  
✅ **Flexible** - Cada cliente de Clay puede usar diferentes tokens/configuraciones  
✅ **Sin restart** - Cambias de token sin reiniciar el servidor  

---

## 📡 Cómo enviar el token desde Clay

### **Opción 1: Header HTTP (RECOMENDADO)**

```http
GET /api/posts
Headers:
  x-api-key: tu-clave-servidor-123
  x-apify-token: apify_api_xxxxxxxxxxxxxxxxx
```

### **Opción 2: Query Parameter**

```http
GET /api/posts?api_key=tu-clave-servidor-123&apify_token=apify_api_xxxxxxxxxx
```

---

## 🎯 Endpoints Actualizados

### **1. Check Posts Nuevos**

```http
GET /api/check-new-posts

Headers:
  x-api-key: YOUR_SERVER_API_KEY
  x-apify-token: YOUR_APIFY_TOKEN

Query Params (opcionales):
  username: gabrielmartinezes
```

**Request desde PowerShell:**
```powershell
$headers = @{
    "x-api-key" = "test-api-key-12345"
    "x-apify-token" = "apify_api_xxxxxxxxxx"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/check-new-posts?username=gabrielmartinezes" `
    -Headers $headers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasNewPosts": true,
    "username": "gabrielmartinezes",
    "checkedAt": "2025-10-19T10:00:00Z"
  }
}
```

---

### **2. Obtener Posts**

```http
GET /api/posts

Headers:
  x-api-key: YOUR_SERVER_API_KEY
  x-apify-token: YOUR_APIFY_TOKEN

Query Params (opcionales):
  username: gabrielmartinezes
  max_posts: 10
  force_refresh: false
```

**Request desde PowerShell:**
```powershell
$headers = @{
    "x-api-key" = "test-api-key-12345"
    "x-apify-token" = "apify_api_xxxxxxxxxx"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/posts?username=gabrielmartinezes&max_posts=5" `
    -Headers $headers | ConvertTo-Json -Depth 10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "totalPosts": 5,
    "scrapedAt": "2025-10-19T10:00:00Z",
    "profileUrl": "https://www.linkedin.com/in/gabrielmartinezes/"
  }
}
```

---

### **3. Obtener Interacciones**

```http
GET /api/interactions/:postId

Headers:
  x-api-key: YOUR_SERVER_API_KEY
  x-apify-token: YOUR_APIFY_TOKEN

Query Params:
  current_likes: 120
  current_comments: 15
```

---

## 🎨 Configuración en Clay

### **HTTP API Request en Clay**

#### **Paso 1: Configurar Headers**

En Clay → HTTP API Action → Headers:

```json
{
  "x-api-key": "{{secrets.SERVER_API_KEY}}",
  "x-apify-token": "{{secrets.APIFY_TOKEN}}"
}
```

#### **Paso 2: Configurar URL**

```
https://tu-servidor.onrender.com/api/posts?username=gabrielmartinezes&max_posts=10
```

#### **Paso 3: Guardar tokens en Clay Secrets**

1. En Clay → Settings → Secrets
2. Agregar:
   - `SERVER_API_KEY` = tu-clave-servidor-123
   - `APIFY_TOKEN` = apify_api_xxxxxxxxxx

---

## 🔒 Diferencia entre los 2 tokens

| Token | Propósito | Dónde se genera | Quién lo guarda |
|-------|-----------|-----------------|-----------------|
| **Server API Key** | Autenticar requests a TU servidor | Lo inventas tú | En `.env` del servidor |
| **Apify Token** | Autenticar con Apify.com | Apify.com dashboard | Clay lo envía en cada request |

### **Flujo de autenticación:**

```
Clay Request
    ↓
[Header: x-api-key] → Valida que puedas usar MI servidor ✅
    ↓
[Header: x-apify-token] → Se usa para llamar a Apify ✅
    ↓
Apify API
    ↓
Response
```

---

## 🚀 Ejemplo Completo desde Clay

### **Workflow en Clay:**

```
┌────────────────────────────────────────────┐
│ PASO 1: Check nuevos posts                 │
├────────────────────────────────────────────┤
│ HTTP API Request                           │
│ Method: GET                                │
│ URL: https://tu-api.com/api/check-new-posts│
│ Headers:                                   │
│   x-api-key: {{secrets.SERVER_API_KEY}}   │
│   x-apify-token: {{secrets.APIFY_TOKEN}}  │
│ Query:                                     │
│   username: gabrielmartinezes              │
│                                            │
│ Response → {{hasNewPosts}}                │
└────────────────────────────────────────────┘
                    │
          If {{hasNewPosts}} = true
                    ↓
┌────────────────────────────────────────────┐
│ PASO 2: Obtener posts                      │
├────────────────────────────────────────────┤
│ HTTP API Request                           │
│ Method: GET                                │
│ URL: https://tu-api.com/api/posts         │
│ Headers:                                   │
│   x-api-key: {{secrets.SERVER_API_KEY}}   │
│   x-apify-token: {{secrets.APIFY_TOKEN}}  │
│ Query:                                     │
│   username: gabrielmartinezes              │
│   max_posts: 10                            │
│                                            │
│ Response → Guardar en Tabla "Posts"       │
└────────────────────────────────────────────┘
                    │
                    ↓
┌────────────────────────────────────────────┐
│ PASO 3: Loop - Obtener interactions       │
├────────────────────────────────────────────┤
│ Para cada fila en Tabla "Posts":          │
│                                            │
│ HTTP API Request                           │
│ Method: GET                                │
│ URL: https://tu-api.com/api/interactions/ │
│      {{posts.id}}                          │
│ Headers:                                   │
│   x-api-key: {{secrets.SERVER_API_KEY}}   │
│   x-apify-token: {{secrets.APIFY_TOKEN}}  │
│ Query:                                     │
│   current_likes: {{posts.metrics.likes}}  │
│   current_comments: {{posts.comments}}    │
│                                            │
│ Response → Guardar en Tabla "Interactions"│
└────────────────────────────────────────────┘
```

---

## 💡 Ventajas de este enfoque

### **✅ Para ti (servidor)**
- No necesitas exponer tu Apify token en variables de entorno
- Puedes tener múltiples clientes (cada uno con su token)
- Más fácil de escalar

### **✅ Para Clay (cliente)**
- Control total de sus credenciales
- Pueden cambiar de token sin avisarte
- No dependen de tu configuración

### **✅ Seguridad**
- Tokens nunca en el código fuente
- Clay Secrets encripta los tokens
- Render Environment Variables protege tu API key

---

## 🧪 Testing

### **Test 1: Sin token de Apify (debe fallar)**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/posts?api_key=test-api-key-12345"
```

**Expected:**
```json
{
  "success": false,
  "error": "Missing Apify token. Provide via header 'x-apify-token' or query param 'apify_token'"
}
```

### **Test 2: Con token en header (debe funcionar)**

```powershell
$headers = @{
    "x-api-key" = "test-api-key-12345"
    "x-apify-token" = "apify_api_xxxxxxxxxx"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/posts?username=gabrielmartinezes" `
    -Headers $headers
```

### **Test 3: Con token en query (debe funcionar)**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/posts?api_key=test-api-key-12345&apify_token=apify_api_xxx&username=gabrielmartinezes"
```

---

## 📋 Checklist para Clay

- [ ] Obtén tu Apify Token en https://apify.com
- [ ] Guarda el token en Clay Secrets como `APIFY_TOKEN`
- [ ] Guarda la API key del servidor en Clay Secrets como `SERVER_API_KEY`
- [ ] Configura HTTP API Request con headers:
  - `x-api-key: {{secrets.SERVER_API_KEY}}`
  - `x-apify-token: {{secrets.APIFY_TOKEN}}`
- [ ] Prueba el endpoint `/api/check-new-posts`
- [ ] Configura workflow completo

---

## 🔧 Variables de entorno en el servidor

Tu `.env` ahora es más simple:

```env
# Server API Key (para autenticar requests a tu servidor)
API_KEY=tu-clave-servidor-123

# Target profile (opcional, puede venir del query)
TARGET_PROFILE_USERNAME=gabrielmartinezes

# Configuración
PORT=3000
MAX_POSTS_PER_SCRAPE=10
CACHE_TTL_HOURS=24

# Apify Token (OPCIONAL - solo fallback si Clay no lo envía)
APIFY_API_TOKEN=apify_api_fallback_xxx
```

**Nota:** El `APIFY_API_TOKEN` en `.env` es **opcional** y solo se usa como fallback si Clay no envía uno.

---

## 🎉 Resultado

Ahora Clay tiene **control total** de las credenciales y puede:
- ✅ Cambiar de token sin reiniciar el servidor
- ✅ Usar múltiples tokens para diferentes workflows
- ✅ Mantener tokens seguros en Clay Secrets
- ✅ No depender de tu configuración del servidor

**¡Mucho más flexible y seguro!** 🔒
