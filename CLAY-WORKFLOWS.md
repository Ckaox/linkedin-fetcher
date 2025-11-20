# Clay Workflows - LinkedIn Post Fetcher

## 📋 Configuración Inicial

### Secrets en Clay
```
APIFY_TOKEN: tu-token-de-apify
SERVER_URL: https://tu-app.onrender.com
```

---

## 🔄 Workflow 1: Carga Inicial de Posts Nuevos

### Paso 1: Verificar si hay posts nuevos
- **Acción**: HTTP API
- **Método**: GET
- **URL**: `{{secrets.SERVER_URL}}/api/check-new-posts?username=gabrielmartinezes`
- **Headers**:
  - `x-apify-token: {{secrets.APIFY_TOKEN}}`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "hasNewPosts": true,
    "username": "gabrielmartinezes",
    "checkedAt": "2025-11-20T10:00:00Z"
  }
}
```

### Paso 2: Si hay posts nuevos, traerlos
- **Condición**: Si `hasNewPosts == true`
- **Acción**: HTTP API
- **Método**: GET
- **URL**: `{{secrets.SERVER_URL}}/api/posts?username=gabrielmartinezes&max_posts=10`
- **Headers**:
  - `x-apify-token: {{secrets.APIFY_TOKEN}}`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "urn:li:activity:7265432198765432100",
        "url": "https://linkedin.com/feed/update/...",
        "content": "Contenido del post...",
        "metrics": {
          "likes": 150,
          "comments": 25,
          "reposts": 10
        }
      }
    ]
  }
}
```

### Paso 3: Agregar a tabla de Clay
Mapear campos:
- `Post ID` → `{{data.posts[0].id}}`
- `URL` → `{{data.posts[0].url}}`
- `Likes` → `{{data.posts[0].metrics.likes}}`
- `Comments` → `{{data.posts[0].metrics.comments}}`
- `Reposts` → `{{data.posts[0].metrics.reposts}}`

---

## 🔄 Workflow 2: Actualizar Métricas de Posts Existentes (DIARIO)

**Este es el workflow principal que resuelve tu problema**

### Paso 1: Preparar datos de posts existentes
En tu tabla de Clay, tienes columnas:
- `post_id`
- `current_likes`
- `current_comments`
- `current_reposts`

### Paso 2: Llamar al endpoint de actualización
- **Acción**: HTTP API
- **Método**: POST
- **URL**: `{{secrets.SERVER_URL}}/api/posts/update-metrics`
- **Headers**:
  - `x-apify-token: {{secrets.APIFY_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "username": "gabrielmartinezes",
  "posts": [
    {
      "id": "{{post_id}}",
      "likes": {{current_likes}},
      "comments": {{current_comments}},
      "reposts": {{current_reposts}}
    }
  ]
}
```

**Respuesta si hay cambios**:
```json
{
  "success": true,
  "data": {
    "updatedPosts": [
      {
        "id": "urn:li:activity:7265432198765432100",
        "metrics": {
          "likes": 175,  // ← Era 150, ahora 175 (+25)
          "comments": 30, // ← Era 25, ahora 30 (+5)
          "reposts": 12   // ← Era 10, ahora 12 (+2)
        }
      }
    ],
    "comparison": {
      "changed": ["urn:li:activity:7265432198765432100"],
      "unchanged": [],
      "details": [
        {
          "id": "urn:li:activity:7265432198765432100",
          "changes": {
            "likes": 25,      // ← Nuevos likes
            "comments": 5,    // ← Nuevos comentarios
            "reposts": 2      // ← Nuevos reposts
          }
        }
      ]
    }
  }
}
```

**Respuesta si NO hay cambios**:
```json
{
  "success": true,
  "data": {
    "updatedPosts": [],
    "comparison": {
      "changed": [],
      "unchanged": ["urn:li:activity:7265432198765432100"],
      "details": []
    },
    "message": "No metrics changes detected"
  }
}
```

### Paso 3: Actualizar tabla de Clay
Solo si `updatedPosts.length > 0`:
- `Likes` → `{{data.updatedPosts[0].metrics.likes}}`
- `Comments` → `{{data.updatedPosts[0].metrics.comments}}`
- `Reposts` → `{{data.updatedPosts[0].metrics.reposts}}`
- `Last Updated` → `{{timestamp}}`

---

## 👥 Workflow 3: Obtener Nuevas Interacciones

**Solo ejecutar para posts que tuvieron cambios en métricas**

### Condición
Si en el Workflow 2 detectaste cambios:
- `{{data.comparison.changed.length}} > 0`

### Paso 1: Obtener interacciones nuevas
- **Acción**: HTTP API
- **Método**: GET
- **URL**: `{{secrets.SERVER_URL}}/api/interactions/{{post_id}}?current_likes={{new_likes}}&current_comments={{new_comments}}`
- **Headers**:
  - `x-apify-token: {{secrets.APIFY_TOKEN}}`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "postId": "7265432198765432100",
    "interactions": [
      {
        "type": "like",
        "userName": "Juan Pérez",
        "userUrl": "https://linkedin.com/in/juanperez",
        "userHeadline": "CEO at TechCorp",
        "timestamp": "2025-11-20T09:00:00Z"
      },
      {
        "type": "comment",
        "userName": "María García",
        "userUrl": "https://linkedin.com/in/mariagarcia",
        "userHeadline": "Marketing Director",
        "commentText": "Excelente post!",
        "timestamp": "2025-11-20T09:30:00Z"
      }
    ],
    "total": 2
  }
}
```

### Paso 2: Agregar interacciones a tabla separada
Crear fila por cada interacción:
- `Post ID` → `{{postId}}`
- `Type` → `{{interactions[i].type}}`
- `User Name` → `{{interactions[i].userName}}`
- `User URL` → `{{interactions[i].userUrl}}`
- `Headline` → `{{interactions[i].userHeadline}}`
- `Comment` → `{{interactions[i].commentText}}`

---

## ⏰ Automatización Recomendada

### Setup Diario (1 vez al día - 8:00 AM)

```
┌─────────────────────────────────────────┐
│ 1. CHECK NEW POSTS                      │
│    GET /api/check-new-posts             │
│    Costo: ~$0.005                       │
└─────────────────────────────────────────┘
                │
                ▼
         ┌──────────────┐
         │ ¿Hay nuevos? │
         └──────────────┘
          │            │
      NO  │            │ SÍ
          │            ▼
          │   ┌─────────────────────────────┐
          │   │ 2. FETCH NEW POSTS          │
          │   │    GET /api/posts           │
          │   │    Costo: ~$0.05            │
          │   └─────────────────────────────┘
          │            │
          │            ▼
          │   ┌─────────────────────────────┐
          │   │ 3. ADD TO CLAY TABLE        │
          │   └─────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│ 4. UPDATE EXISTING POSTS                │
│    POST /api/posts/update-metrics       │
│    (Enviar todos los posts de la tabla) │
│    Costo: $0 si no hay cambios          │
│           ~$0.10 si hay cambios         │
└─────────────────────────────────────────┘
                │
                ▼
         ┌──────────────┐
         │ ¿Hay cambios?│
         └──────────────┘
          │            │
      NO  │            │ SÍ
          │            ▼
          │   ┌─────────────────────────────┐
          │   │ 5. UPDATE METRICS IN TABLE  │
          │   └─────────────────────────────┘
          │            │
          │            ▼
          │   ┌─────────────────────────────┐
          │   │ 6. FETCH NEW INTERACTIONS   │
          │   │    GET /api/interactions    │
          │   │    (Solo posts con cambios) │
          │   │    Costo: ~$0.35 por post   │
          │   └─────────────────────────────┘
          │            │
          │            ▼
          │   ┌─────────────────────────────┐
          │   │ 7. ADD PEOPLE TO TABLE      │
          │   └─────────────────────────────┘
          ▼
┌─────────────────────────────────────────┐
│ DONE ✅                                  │
└─────────────────────────────────────────┘
```

---

## 💰 Estimación de Costos

### Escenario: 10 posts en tabla, 1 nuevo post por día

**Diario**:
- Check new posts: $0.005
- Fetch 1 new post: $0.05
- Update 10 posts: $0.00 (si no cambiaron) o $0.10 (si cambiaron)
- Fetch interactions (2 posts cambiaron): $0.70

**Total día activo**: ~$0.855
**Total mes (30 días)**: ~$25

### Escenario: 10 posts en tabla, NO hay posts nuevos

**Diario**:
- Check new posts: $0.005
- Update 10 posts: $0.00 (sin cambios) o $0.10 (con cambios)
- Fetch interactions (1 post cambió): $0.35

**Total día sin posts nuevos**: ~$0.355
**Total mes (30 días)**: ~$10.65

---

## 🎯 Tips de Optimización

1. **Actualizar métricas cada 12-24 horas** en lugar de cada hora
2. **Batch requests**: Enviar todos los posts en una sola llamada a `/update-metrics`
3. **Solo traer interacciones de posts "hot"**: Posts con > 50 likes o < 7 días
4. **Usar Clay's conditional logic**: Solo ejecutar fetches si hay cambios

---

## 🐛 Troubleshooting

### Error: "No metrics changes detected"
✅ **Normal**: Significa que ningún post tuvo cambios. No se cobra nada.

### Error: "Missing Apify token"
❌ Verificar que el secret `APIFY_TOKEN` esté configurado correctamente en Clay.

### Response vacío en update-metrics
✅ **Normal si no hay cambios**: El sistema detectó que las métricas son iguales.

### Costo muy alto
⚠️ Revisar frecuencia de actualizaciones y cantidad de posts que realmente necesitan update.
