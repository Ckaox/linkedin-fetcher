# 🎯 LinkedIn to Clay - Workflow Definitivo

## 📋 RESUMEN

Sistema para actualizar automáticamente posts de LinkedIn y traer personas nuevas que interactúan.

---

## 🏗️ TABLAS EN CLAY

### Tabla 1: `LinkedIn_Posts`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `post_id` | Text | ID numérico del post |
| `post_url` | Text | URL completa |
| `content` | Text | Contenido |
| `published_at` | Date | Fecha publicación |
| `likes` | Number | Likes actuales |
| `comments` | Number | Comentarios actuales |
| `reposts` | Number | Reposts actuales |
| `last_updated` | Date | Última actualización |

### Tabla 2: `LinkedIn_People_Likes`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `post_id` | Text | ID del post |
| `user_name` | Text | Nombre |
| `user_url` | Text | Perfil LinkedIn |
| `user_headline` | Text | Headline |
| `fetched_at` | Date | Cuándo se obtuvo |

### Tabla 3: `LinkedIn_People_Comments`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `post_id` | Text | ID del post |
| `user_name` | Text | Nombre |
| `user_url` | Text | Perfil LinkedIn |
| `user_headline` | Text | Headline |
| `comment_text` | Text | Comentario |
| `fetched_at` | Date | Cuándo se obtuvo |

---

## 🔄 WORKFLOW COMPLETO

### ⚙️ SETUP INICIAL (1 sola vez)

**Paso 1: Traer todos los posts**
```
Method: GET
URL: https://linkedin-fetcher.onrender.com/api/posts?username=gabrielmartinezes&max_posts=50

Headers:
  x-apify-token: {{secrets.APIFY_TOKEN}}
```

**Response:**
```json
{
  "posts": [
    {
      "id": "7395838079359520768",
      "url": "https://...",
      "content": "...",
      "publishedAt": "2025-11-15T10:00:00Z"
    }
  ]
}
```

**En Clay:** Agrega cada post a `LinkedIn_Posts` (sin métricas iniciales)

---

### 🔁 ACTUALIZACIÓN DIARIA (Automatizar)

**Ejecutar cada día a las 8:00 AM**

#### PASO 1: Actualizar métricas de todos los posts

```
Method: POST
URL: https://linkedin-fetcher.onrender.com/api/posts/refresh-metrics

Headers:
  x-apify-token: {{secrets.APIFY_TOKEN}}
  Content-Type: application/json

Body:
{
  "username": "gabrielmartinezes",
  "postIds": [
    "7395838079359520768",
    "7382414625293643776",
    "7380956773691024642"
  ]
}
```

**💡 En Clay:** Envía TODOS los `post_id` de tu tabla en un array

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "7395838079359520768",
        "metrics": {
          "likes": 28,
          "comments": 30,
          "reposts": 3
        }
      }
    ],
    "totalRefreshed": 1,
    "scrapedAt": "2025-11-20T08:00:00Z"
  }
}
```

**En Clay:** 
- Actualiza columnas `likes`, `comments`, `reposts` en `LinkedIn_Posts`
- Actualiza `last_updated` con fecha actual

**Costo:** ~$0.10 por cada 20 posts

---

#### PASO 2: Identificar posts con nuevas interacciones

**En Clay (Fórmula):**
```
IF(
  likes > 0 OR comments > 0,
  "fetch_people",
  "skip"
)
```

---

#### PASO 3A: Traer personas que dieron LIKE

**Solo para posts con `likes > 0`**

```
Method: GET
URL: https://linkedin-fetcher.onrender.com/api/posts/{{post_id}}/likes?max={{likes}}

Headers:
  x-apify-token: {{secrets.APIFY_TOKEN}}
```

**Response:**
```json
{
  "postId": "7395838079359520768",
  "likes": [
    {
      "userName": "Juan Pérez",
      "userUrl": "https://linkedin.com/in/juanperez",
      "userHeadline": "CEO at TechCorp"
    }
  ],
  "totalLikes": 1
}
```

**En Clay:** 
- Por cada persona en `likes[]`, agregar a `LinkedIn_People_Likes`
- Clay automáticamente evita duplicados si usas `userUrl` como ID único

**Costo:** ~$0.15 por post

---

#### PASO 3B: Traer personas que COMENTARON

**Solo para posts con `comments > 0`**

```
Method: GET
URL: https://linkedin-fetcher.onrender.com/api/posts/{{post_id}}/comments?max={{comments}}

Headers:
  x-apify-token: {{secrets.APIFY_TOKEN}}
```

**Response:**
```json
{
  "postId": "7395838079359520768",
  "comments": [
    {
      "userName": "María García",
      "userUrl": "https://linkedin.com/in/mariagarcia",
      "userHeadline": "Marketing Director",
      "commentText": "Excelente post!"
    }
  ],
  "totalComments": 1
}
```

**En Clay:** 
- Por cada persona en `comments[]`, agregar a `LinkedIn_People_Comments`

**Costo:** ~$0.20 por post

---

## 💰 CÁLCULO DE COSTOS

### Escenario 1: 10 posts, 3 con actividad nueva diaria

```
Paso 1: Refresh metrics (10 posts)     = $0.10
Paso 2: Fetch likes (3 posts)          = $0.45
Paso 3: Fetch comments (3 posts)       = $0.60

Total día = $1.15
Total mes = $34.50
```

### Escenario 2: 20 posts, 5 con actividad nueva diaria

```
Paso 1: Refresh metrics (20 posts)     = $0.20
Paso 2: Fetch likes (5 posts)          = $0.75
Paso 3: Fetch comments (5 posts)       = $1.00

Total día = $1.95
Total mes = $58.50
```

### Escenario 3: 10 posts, ninguno con actividad

```
Paso 1: Refresh metrics (10 posts)     = $0.10
Paso 2: Skip (no likes)                = $0
Paso 3: Skip (no comments)             = $0

Total día = $0.10
Total mes = $3.00
```

---

## 🎯 OPTIMIZACIONES

### 1. Priorizar posts recientes
```
Solo actualizar posts de últimos 30 días
→ Ahorro: 50-70%
```

### 2. Reducir frecuencia para posts viejos
```
Posts < 7 días: 2x/día
Posts 7-30 días: 1x/día
Posts > 30 días: 1x/semana
→ Ahorro: 60-80%
```

### 3. Límite de personas por post
```
Solo traer primeros 50 likes
Solo traer primeros 30 comments
→ Ahorro: Variable según actividad
```

### 4. Skip posts sin actividad por X días
```
Si post no tuvo cambios en 7 días consecutivos → Pausar
→ Ahorro: 30-50%
```

---

## 📊 CONFIGURACIÓN EN CLAY

### Automation 1: Actualización Diaria (8:00 AM)

1. **Run Rows** en tabla `LinkedIn_Posts`
2. **HTTP API** → POST `/refresh-metrics`
   - Body: Enviar array con todos los `post_id`
3. **Parse Response** → Actualizar métricas en tabla
4. **Filter** → Solo rows donde `likes > 0` o `comments > 0`
5. **HTTP API** → GET `/likes` (para filtrados)
6. **HTTP API** → GET `/comments` (para filtrados)
7. **Add Rows** → Agregar personas a tablas correspondientes

### Automation 2: Buscar Posts Nuevos (1x/día)

1. **HTTP API** → GET `/api/posts`
2. **Filter** → Solo posts que NO existen en tabla
3. **Add Rows** → Agregar a `LinkedIn_Posts`

---

## 🧪 TESTING

### Test 1: Refresh metrics
```bash
curl -X POST \
  -H "x-apify-token: TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"gabrielmartinezes",
    "postIds":["7395838079359520768"]
  }' \
  "https://linkedin-fetcher.onrender.com/api/posts/refresh-metrics"
```

### Test 2: Get likes
```bash
curl -H "x-apify-token: TOKEN" \
  "https://linkedin-fetcher.onrender.com/api/posts/7395838079359520768/likes?max=50"
```

### Test 3: Get comments
```bash
curl -H "x-apify-token: TOKEN" \
  "https://linkedin-fetcher.onrender.com/api/posts/7395838079359520768/comments?max=30"
```

---

## 🔑 ENDPOINTS FINALES

| Endpoint | Cuándo usar | Costo |
|----------|-------------|-------|
| `GET /api/posts` | Setup inicial + buscar nuevos | $0.05 |
| `POST /api/posts/refresh-metrics` | Actualizar métricas (diario) | $0.10/20 posts |
| `GET /api/posts/:id/likes` | Traer personas likes | $0.15/post |
| `GET /api/posts/:id/comments` | Traer personas comments | $0.20/post |

---

## ✅ CHECKLIST

- [ ] Servidor deployed en Render
- [ ] Secret `APIFY_TOKEN` en Clay
- [ ] Tabla `LinkedIn_Posts` creada
- [ ] Tabla `LinkedIn_People_Likes` creada
- [ ] Tabla `LinkedIn_People_Comments` creada
- [ ] Setup inicial ejecutado (traer posts)
- [ ] Automation diaria configurada
- [ ] Probado manualmente con curl
- [ ] Verificar costos después de 1 semana

---

## 🚀 TODO LISTO!

Ahora tienes un sistema completo que:
✅ Actualiza métricas automáticamente
✅ Solo trae personas nuevas
✅ Optimizado en costos
✅ Escalable a cientos de posts

¿Dudas? Revisa los logs en Render Dashboard para debugging.
