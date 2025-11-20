# 🎯 Guía Completa: Setup en Clay

## 📋 FLUJO COMPLETO (3 Pasos)

```
1. POST FETCHER → Trae IDs de posts nuevos
         ↓
2. REFRESH METRICS → Obtiene métricas actuales (likes, comments, reposts)
         ↓
3. GET NEW INTERACTIONS → Solo trae personas nuevas que interactuaron
```

---

## 🏗️ ESTRUCTURA DE TABLAS EN CLAY

### Tabla 1: LinkedIn Posts

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `post_id` | Text | ID del post (del endpoint 1) |
| `post_url` | Text | URL del post |
| `content` | Text | Contenido del post |
| `published_at` | Date | Fecha de publicación |
| `likes` | Number | Likes actuales (del endpoint 2) |
| `comments` | Number | Comentarios actuales (del endpoint 2) |
| `reposts` | Number | Reposts actuales (del endpoint 2) |
| `likes_previous` | Number | Likes del día anterior |
| `comments_previous` | Number | Comentarios del día anterior |
| `reposts_previous` | Number | Reposts del día anterior |
| `last_checked` | Date | Última vez que se verificó |

### Tabla 2: LinkedIn Interactions (Personas)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `post_id` | Text | ID del post relacionado |
| `interaction_type` | Text | like / comment / repost |
| `user_name` | Text | Nombre de la persona |
| `user_url` | Text | URL del perfil |
| `user_headline` | Text | Headline del perfil |
| `comment_text` | Text | Texto del comentario (si aplica) |
| `fetched_at` | Date | Cuándo se obtuvo |

---

## 🔄 ENDPOINT 1: TRAER POSTS NUEVOS (Solo IDs)

**Frecuencia**: 1x al día o cada vez que quieras buscar posts nuevos

### Configuración en Clay:

```
Method: GET
URL: https://linkedin-fetcher.onrender.com/api/posts?username=gabrielmartinezes&max_posts=10

Headers:
  x-apify-token: {{secrets.APIFY_TOKEN}}
```

### Response:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "7382355485938597888",
        "url": "https://www.linkedin.com/feed/update/...",
        "content": "El proceso que te funciona al principio...",
        "publishedAt": "2025-10-10T16:00:05Z",
        "authorName": "Gabriel Martínez",
        "authorUrl": "https://linkedin.com/in/gabrielmartinezes"
      }
    ],
    "totalPosts": 1,
    "note": "Use /api/posts/refresh-metrics to get current metrics"
  }
}
```

### Mapeo en Clay (Agregar a tabla):
- `post_id` → `{{data.posts[0].id}}`
- `post_url` → `{{data.posts[0].url}}`
- `content` → `{{data.posts[0].content}}`
- `published_at` → `{{data.posts[0].publishedAt}}`
- `likes` → 0 (inicial)
- `comments` → 0 (inicial)
- `reposts` → 0 (inicial)
- `likes_previous` → 0
- `comments_previous` → 0
- `reposts_previous` → 0

**Costo**: ~$0.05 si hay posts nuevos, $0.005 si no hay

---

## 🔄 ENDPOINT 2: OBTENER MÉTRICAS ACTUALES

**Frecuencia**: 1x al día (automatizado)

### Configuración en Clay:

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
    "{{post_id}}"
  ]
}
```

**💡 Para múltiples posts**: Agrupa en un array todos los `post_id` de tu tabla

### Response:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "7382355485938597888",
        "url": "https://...",
        "metrics": {
          "likes": 28,
          "comments": 30,
          "reposts": 3
        },
        "content": "...",
        "publishedAt": "..."
      }
    ],
    "totalRefreshed": 1,
    "scrapedAt": "2025-11-20T12:00:00Z"
  }
}
```

### Mapeo en Clay (Actualizar tabla):

**Antes de actualizar, COPIAR valores actuales a "previous":**
1. `likes_previous` ← valor actual de `likes`
2. `comments_previous` ← valor actual de `comments`
3. `reposts_previous` ← valor actual de `reposts`

**Luego actualizar con nuevos valores:**
- `likes` → `{{data.posts[0].metrics.likes}}`
- `comments` → `{{data.posts[0].metrics.comments}}`
- `reposts` → `{{data.posts[0].metrics.reposts}}`
- `last_checked` → `{{now}}`

**Costo**: ~$0.10 por cada 20 posts

---

## 🔄 ENDPOINT 3: TRAER PERSONAS NUEVAS QUE INTERACTUARON

**Frecuencia**: Solo después del Endpoint 2, si detectas cambios

### Condición en Clay:
```
Ejecutar solo si:
  likes > likes_previous
  O
  comments > comments_previous
```

### Configuración en Clay:

```
Method: GET
URL: https://linkedin-fetcher.onrender.com/api/interactions/{{post_id}}?current_likes={{likes}}&current_comments={{comments}}&previous_likes={{likes_previous}}&previous_comments={{comments_previous}}

Headers:
  x-apify-token: {{secrets.APIFY_TOKEN}}
```

### Response:
```json
{
  "success": true,
  "data": {
    "postId": "7382355485938597888",
    "interactions": [
      {
        "type": "like",
        "userName": "Juan Pérez",
        "userUrl": "https://linkedin.com/in/juanperez",
        "userHeadline": "CEO at TechCorp"
      },
      {
        "type": "comment",
        "userName": "María García",
        "userUrl": "https://linkedin.com/in/mariagarcia",
        "userHeadline": "Marketing Director",
        "commentText": "Excelente post!"
      }
    ],
    "total": 2,
    "newLikes": 5,
    "newComments": 2
  }
}
```

### Si no hay cambios:
```json
{
  "success": true,
  "data": {
    "postId": "7382355485938597888",
    "interactions": [],
    "total": 0,
    "message": "No new interactions since last check"
  }
}
```

### Mapeo en Clay (Agregar a Tabla 2):

Por cada interacción en `interactions[]`:
- `post_id` → `{{postId}}`
- `interaction_type` → `{{interactions[i].type}}`
- `user_name` → `{{interactions[i].userName}}`
- `user_url` → `{{interactions[i].userUrl}}`
- `user_headline` → `{{interactions[i].userHeadline}}`
- `comment_text` → `{{interactions[i].commentText}}`
- `fetched_at` → `{{now}}`

**Costo**: ~$0.35 por post (solo si hay cambios), $0 si no hay

---

## 📅 WORKFLOW DIARIO AUTOMATIZADO

### 🌅 OPCIÓN A: Setup Inicial (1 sola vez)

```
1. GET /api/posts
   → Agrega posts nuevos a tabla
   
2. POST /api/posts/refresh-metrics (todos los posts)
   → Actualiza métricas iniciales
   
3. GET /api/interactions/:postId (todos los posts)
   → Trae todas las personas que han interactuado
```

**Costo inicial**: ~$5-10 dependiendo de cuántos posts tengas

---

### 🔄 OPCIÓN B: Actualización Diaria (Automatizar)

**Ejecutar cada día a las 8:00 AM:**

```
PASO 1: Buscar posts nuevos
┌─────────────────────────────────────────┐
│ GET /api/posts?username=USER            │
│ Si hay posts: Agregar a tabla           │
│ Costo: $0.005 (si no hay) o $0.05      │
└─────────────────────────────────────────┘
                │
                ▼
PASO 2: Actualizar métricas de TODOS los posts
┌─────────────────────────────────────────┐
│ Antes: Copiar likes→likes_previous      │
│        Copiar comments→comments_previous│
│        Copiar reposts→reposts_previous  │
│                                         │
│ POST /api/posts/refresh-metrics         │
│ Body: {"postIds": [todos los IDs]}     │
│                                         │
│ Después: Actualizar con nuevos valores │
│ Costo: ~$0.10 por cada 20 posts        │
└─────────────────────────────────────────┘
                │
                ▼
PASO 3: Traer personas nuevas (SOLO posts con cambios)
┌─────────────────────────────────────────┐
│ FILTRAR: likes > likes_previous         │
│       O  comments > comments_previous   │
│                                         │
│ Para cada post con cambios:             │
│   GET /api/interactions/:postId         │
│   → Agregar personas a Tabla 2          │
│                                         │
│ Costo: ~$0.35 por post con cambios     │
│        $0 para posts sin cambios        │
└─────────────────────────────────────────┘
```

---

## 💰 ESTIMACIÓN DE COSTOS

### Escenario 1: 10 posts, 2 con cambios diarios
```
Paso 1: Check new posts       = $0.005
Paso 2: Refresh 10 posts       = $0.10
Paso 3: Fetch interactions (2) = $0.70

Total/día = $0.805
Total/mes = $24.15
```

### Escenario 2: 20 posts, 5 con cambios diarios
```
Paso 1: Check new posts       = $0.005
Paso 2: Refresh 20 posts       = $0.20
Paso 3: Fetch interactions (5) = $1.75

Total/día = $1.955
Total/mes = $58.65
```

### Escenario 3: 10 posts, sin cambios
```
Paso 1: Check new posts       = $0.005
Paso 2: Refresh 10 posts       = $0.10
Paso 3: No interactions        = $0

Total/día = $0.105
Total/mes = $3.15
```

---

## 🎯 TIPS DE OPTIMIZACIÓN

### 1. **Priorizar posts recientes**
Solo actualiza métricas de posts < 30 días. Posts viejos raramente cambian.

### 2. **Batch requests**
Envía múltiples `postIds` en una sola llamada al Endpoint 2.

### 3. **Skip posts sin actividad**
Si un post tuvo 0 cambios durante 7 días seguidos, deja de monitorearlo.

### 4. **Horarios estratégicos**
Ejecuta a las 8 AM (después del pico de actividad matutino).

### 5. **Límite de posts activos**
Mantén máximo 20-30 posts activos siendo monitoreados.

---

## 🧪 PROBAR EL FLUJO COMPLETO

### Test Manual:

```bash
# 1. Traer posts nuevos
curl -H "x-apify-token: TOKEN" \
  "https://linkedin-fetcher.onrender.com/api/posts?username=gabrielmartinezes"

# 2. Obtener métricas actuales
curl -X POST \
  -H "x-apify-token: TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"gabrielmartinezes","postIds":["7382355485938597888"]}' \
  "https://linkedin-fetcher.onrender.com/api/posts/refresh-metrics"

# 3. Traer personas nuevas
curl -H "x-apify-token: TOKEN" \
  "https://linkedin-fetcher.onrender.com/api/interactions/7382355485938597888?current_likes=28&current_comments=30&previous_likes=25&previous_comments=28"
```

---

## 🚨 TROUBLESHOOTING

### Problema: "No new interactions" pero sé que hay nuevas
**Solución**: Verifica que `current_likes` > `previous_likes`. Si son iguales, el endpoint no scrapeará.

### Problema: Personas duplicadas en Tabla 2
**Solución**: El sistema ya maneja esto internamente. Si ves duplicados, verifica que estás usando `previous_likes` correctamente.

### Problema: Costo muy alto
**Solución**: 
1. Reduce frecuencia de actualización (cada 2 días en vez de diario)
2. Solo monitorea posts < 14 días
3. Limita a 10-15 posts activos

### Problema: 404 en endpoints
**Solución**: Haz Manual Deploy en Render para actualizar el servidor.

---

## ✅ CHECKLIST ANTES DE EMPEZAR

- [ ] Servidor desplegado en Render
- [ ] Secret `APIFY_TOKEN` configurado en Clay
- [ ] Tabla 1 (Posts) creada con todas las columnas
- [ ] Tabla 2 (Interactions) creada
- [ ] Endpoint 1 probado manualmente
- [ ] Endpoint 2 probado manualmente
- [ ] Endpoint 3 probado manualmente
- [ ] Workflow diario configurado en Clay
- [ ] Fórmulas para copiar `previous` values antes de actualizar

---

¡Listo para producción! 🚀
