# 🎯 Flujo Optimizado con Apify para Clay

## 📊 Resumen de Actores Seleccionados

### 1️⃣ **LinkedIn Profile Posts Scraper** 
- **ID:** `apimaestro/linkedin-profile-posts` (`LQQIXN9Othf8f7R5n`)
- **Precio:** $5 / 1,000 posts
- **Límite:** 100 posts por página
- **Output:** Posts con contenido, stats, media, author

### 2️⃣ **LinkedIn Profile Reactions Scraper**
- **ID:** `apimaestro/linkedin-profile-reactions` (`J9UfswnR3Kae4O6vm`)
- **Precio:** $5 / 1,000 reactions  
- **Límite:** 100 reactions por página
- **Output:** Reactions del usuario (qué posts le dio like)

### 3️⃣ **LinkedIn Profile Comments Scraper**
- **ID:** `apimaestro/linkedin-profile-comments` (`7TNcROe1C2CQDO3wl`)
- **Precio:** $5 / 1,000 comments
- **Límite:** 100 comments por página
- **Output:** Comentarios del usuario con post content

---

## 🔄 Flujo Estratégico para Clay (Límite 200KB por celda)

### **Problema:** Clay tiene límite de 200KB por celda
### **Solución:** Dividir datos en múltiples celdas/tablas

---

## 📋 **Arquitectura Recomendada:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    TU API (Render Free)                          │
│  - Llama a Apify Actors                                          │
│  - Normaliza datos                                               │
│  - Divide en chunks < 200KB                                      │
│  - Expone endpoints para Clay                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Apify Actors                              │
│  1. Posts Scraper  → Obtiene posts del perfil                   │
│  2. Reactions Scraper → Quién reaccionó a cada post             │
│  3. Comments Scraper → Quién comentó en cada post               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Clay.com (3 Tablas)                           │
│                                                                  │
│  📄 Tabla 1: POSTS                                               │
│    - post_id, url, content, author, stats, published_at         │
│    - Una fila por post (~5-10KB por fila)                       │
│                                                                  │
│  👥 Tabla 2: INTERACTIONS                                        │
│    - post_id, user_name, user_url, interaction_type, timestamp  │
│    - Una fila por interacción (~2-3KB por fila)                 │
│                                                                  │
│  💬 Tabla 3: COMMENTS (Opcional - solo si necesitas)            │
│    - post_id, comment_id, user_name, text, timestamp            │
│    - Una fila por comentario (~3-5KB por fila)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Endpoints de tu API para Clay:**

### **1. GET `/api/posts`**
**Descripción:** Obtiene todos los posts del perfil

**Input (Query Params):**
```
profile_username: gabrielmartinezes
max_posts: 10  # Limitar cantidad para no exceder 200KB
api_key: tu-api-key
```

**Output (JSON):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "7123456789012345678",
        "url": "https://www.linkedin.com/posts/...",
        "content": "Post text...",
        "published_at": "2025-10-15T10:30:00Z",
        "author": {
          "name": "Gabriel Martínez",
          "url": "https://www.linkedin.com/in/gabrielmartinezes/"
        },
        "stats": {
          "likes": 120,
          "comments": 15,
          "reposts": 8
        }
      }
    ],
    "total": 10,
    "size_kb": 45
  }
}
```

**Uso en Clay:**
- HTTP API Request → Mapea a Tabla "Posts"
- Una fila = un post

---

### **2. GET `/api/interactions/:post_id`**
**Descripción:** Obtiene TODAS las interacciones de un post específico

**Input:**
```
post_id: 7123456789012345678
types: likes,comments  # Filtrar tipos
limit: 50  # Máximo por request
api_key: tu-api-key
```

**Output:**
```json
{
  "success": true,
  "data": {
    "post_id": "7123456789012345678",
    "interactions": [
      {
        "type": "like",
        "user_name": "Juan Pérez",
        "user_url": "https://www.linkedin.com/in/juanperez/",
        "user_headline": "CEO en Company",
        "timestamp": "2025-10-16T08:15:00Z"
      },
      {
        "type": "comment",
        "user_name": "María López",
        "user_url": "https://www.linkedin.com/in/marialopez/",
        "comment_text": "Excelente post!",
        "timestamp": "2025-10-16T09:00:00Z"
      }
    ],
    "total": 135,
    "returned": 50,
    "has_more": true,
    "next_page": 2
  }
}
```

**Uso en Clay:**
- Loop por cada post_id de Tabla 1
- HTTP API Request → Mapea a Tabla "Interactions"
- Una fila = una interacción

---

### **3. GET `/api/profile/:username/activity`**
**Descripción:** Actividad del perfil (qué posts le gustó, comentó)

**Input:**
```
username: gabrielmartinezes
activity_type: reactions,comments
limit: 20
api_key: tu-api-key
```

**Output:**
```json
{
  "success": true,
  "data": {
    "reactions": [
      {
        "post_url": "https://www.linkedin.com/posts/...",
        "post_author": "John Doe",
        "reaction_type": "like",
        "reacted_at": "2025-10-15T12:00:00Z"
      }
    ],
    "comments": [
      {
        "post_url": "https://www.linkedin.com/posts/...",
        "comment_text": "Great insight!",
        "commented_at": "2025-10-14T15:30:00Z"
      }
    ]
  }
}
```

---

## 🔧 **Flujo en Clay (Paso a Paso):**

### **Flujo Diario Automatizado:**

```
┌────────────────────────────────────────────────────────────┐
│ PASO 1: Obtener Posts (1x/día a las 7:00 AM)              │
├────────────────────────────────────────────────────────────┤
│ • HTTP API Request: GET /api/posts?username=gabriel...    │
│ • Guardar en Tabla: "Posts"                               │
│ • Mapeo:                                                   │
│   - Column A: post_id                                      │
│   - Column B: url                                          │
│   - Column C: content                                      │
│   - Column D: likes_count                                  │
│   - Column E: comments_count                               │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│ PASO 2: Por cada post, obtener interacciones              │
├────────────────────────────────────────────────────────────┤
│ • Loop: Para cada fila en Tabla "Posts"                   │
│ • HTTP API Request: GET /api/interactions/{{post_id}}     │
│ • Guardar en Tabla: "Interactions"                        │
│ • Mapeo:                                                   │
│   - Column A: post_id (foreign key)                       │
│   - Column B: user_name                                    │
│   - Column C: user_url                                     │
│   - Column D: interaction_type                             │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│ PASO 3: Enriquecer perfiles de usuarios (Opcional)        │
├────────────────────────────────────────────────────────────┤
│ • Clay Enrichment: Por cada user_url                       │
│   - Clearbit / Hunter / Apollo                             │
│   - Obtener email, company, role                           │
│ • Guardar en columnas adicionales                          │
└────────────────────────────────────────────────────────────┘
```

---

## 💰 **Estimación de Costos:**

**Escenario: 10 posts/día con promedio de 50 interacciones cada uno**

| Actor | Uso Mensual | Costo |
|-------|------------|-------|
| Posts Scraper | 10 posts/día × 30 = 300 posts | $1.50 |
| Reactions Scraper | 500 reacciones/día × 30 = 15,000 | $75 |
| Comments Scraper | Solo si necesitas | $0 - $25 |
| **TOTAL** | | **~$76.50 - $101.50/mes** |

**💡 Optimización:**
- Solo scrape interactions para posts nuevos o con cambios
- Usa cache de 24h para posts antiguos
- Limita a top 20 posts más recientes

---

## 📦 **Tamaño de Datos vs. Límite de 200KB:**

### **Análisis de tamaño:**

| Tipo de Dato | Tamaño Promedio | Registros en 200KB |
|--------------|-----------------|-------------------|
| 1 Post completo | ~8 KB | **25 posts** |
| 1 Interacción | ~2 KB | **100 interacciones** |
| 1 Comentario | ~4 KB | **50 comentarios** |

### **Estrategia para no exceder 200KB:**

1. **Opción A: Paginación por request**
   ```
   GET /api/posts?limit=20&page=1  → 160KB ✅
   GET /api/posts?limit=20&page=2  → 160KB ✅
   ```

2. **Opción B: Dividir por endpoints**
   ```
   GET /api/posts                    → Solo metadata (sin content largo)
   GET /api/posts/:id/full           → Post completo individual
   GET /api/posts/:id/interactions   → Interactions separadas
   ```

3. **Opción C: Comprimir texto largo**
   ```json
   {
     "content": "First 200 chars...",
     "content_truncated": true,
     "full_content_url": "/api/posts/123/content"
   }
   ```

---

## 🚀 **Siguiente Paso:**

¿Quieres que implemente el código completo con:
1. ✅ Integración de los 3 actores de Apify
2. ✅ Endpoints optimizados para Clay (< 200KB)
3. ✅ Sistema de paginación automática
4. ✅ Cache para reducir costos
5. ✅ Webhook cuando hay nuevos posts

**Confirma y empiezo la implementación** 🚀
