# 💰 Estrategia de Optimización de Costos con Apify

## 🎯 Objetivo: Gastar lo MÍNIMO posible

---

## 🧠 Lógica Inteligente Implementada

### 1. **Check rápido antes de scrapear** ⚡
```
┌─────────────────────────────────────────────┐
│  GET /api/check-new-posts                   │
│  Costo: ~$0.005 (1 post)                    │
│                                              │
│  ¿Hay posts nuevos?                          │
│    ├─ NO  → Usar cache (GRATIS) ✅           │
│    └─ SÍ  → Scrapear posts ($$$)            │
└─────────────────────────────────────────────┘
```

**Beneficio:** Evitas scraping innecesario el 90% del tiempo

---

### 2. **Cache de 24 horas** 💾

```typescript
// Primera request (10:00 AM)
GET /api/posts  →  Scrape Apify  →  $0.05  →  Cache por 24h

// Requests siguientes en el mismo día
GET /api/posts  →  Cache hit  →  $0.00  →  GRATIS ✅
GET /api/posts  →  Cache hit  →  $0.00  →  GRATIS ✅

// Al día siguiente (10:00 AM del día 2)
GET /api/posts  →  Check si hay nuevos → 
  ├─ No hay nuevos → Cache hit → $0.005
  └─ Hay nuevos → Scrape → $0.05
```

**Beneficio:** Reduces costos en 95% si consultas múltiples veces al día

---

### 3. **Scraping de interacciones solo si cambiaron** 🔄

```typescript
// Post tiene 50 likes, 10 comments
GET /api/interactions/123?current_likes=50&current_comments=10
  → Hash: "50-10"
  → Cache hit → GRATIS ✅

// Al día siguiente, post tiene 55 likes, 12 comments
GET /api/interactions/123?current_likes=55&current_comments=12
  → Hash: "55-12" (DIFERENTE!)
  → Scrape interacciones → $0.35
  → Guardar nuevo cache
```

**Beneficio:** Solo scrapes interacciones cuando hay actividad real

---

## 💸 Comparativa de Costos

### ❌ **Sin optimización (scraping cada request):**

| Acción | Frecuencia | Costo Unitario | Costo Mensual |
|--------|-----------|---------------|---------------|
| Scrape posts | 30x/día | $0.05 | **$45/mes** |
| Scrape interactions (por post) | 10 posts × 30 días | $0.35 | **$105/mes** |
| **TOTAL** | | | **$150/mes** ❌ |

---

### ✅ **Con optimización (tu implementación):**

| Acción | Frecuencia | Costo Unitario | Costo Mensual |
|--------|-----------|---------------|---------------|
| Check nuevos posts | 30x/día | $0.005 | **$0.15** |
| Scrape posts | 5x/mes (solo nuevos) | $0.05 | **$0.25** |
| Scrape interactions | 5 posts × 5 días | $0.35 | **$8.75** |
| **TOTAL** | | | **$9.15/mes** ✅ |

**🎉 Ahorro: $140.85/mes (94% menos!)**

---

## 📊 Flujo Optimizado para Clay

### **Workflow diario en Clay:**

```
┌────────────────────────────────────────────────────────┐
│ 7:00 AM - Clay Schedule Trigger                        │
└────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ PASO 1: Check si hay posts nuevos                      │
│ GET /api/check-new-posts?api_key=XXX                   │
│ Costo: $0.005                                           │
│                                                          │
│ Response: { "hasNewPosts": true/false }                │
└────────────────────────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │         │
              hasNewPosts?    │
                 │            │
         SÍ ─────┘            └───── NO → STOP (GRATIS) ✅
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ PASO 2: Obtener posts                                  │
│ GET /api/posts?api_key=XXX&max_posts=10                │
│ Costo: $0.05                                            │
│                                                          │
│ Guarda en Tabla "Posts" de Clay                        │
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ PASO 3: Loop por cada post                             │
│ Para cada post en Tabla "Posts":                       │
│                                                          │
│   GET /api/interactions/{{post_id}}                    │
│       ?current_likes={{likes}}                          │
│       &current_comments={{comments}}                    │
│       &api_key=XXX                                      │
│                                                          │
│   Si las stats cambiaron → Scrape ($0.35)              │
│   Si no cambiaron → Cache (GRATIS) ✅                   │
│                                                          │
│ Guarda en Tabla "Interactions"                         │
└────────────────────────────────────────────────────────┘
```

---

## 🎛️ Variables de control de costos

En tu `.env`:

```env
# Control de cantidad
MAX_POSTS_PER_SCRAPE=10  # Menos posts = menos costo

# Control de tiempo
CACHE_TTL_HOURS=24  # Más horas = más ahorro

# Control de lógica
ENABLE_SMART_SCRAPING=true  # Siempre en true para ahorrar
```

---

## 📈 Casos de uso y costos

### **Caso 1: Perfil con 2 posts/semana**
```
Mes típico:
- 8 posts nuevos
- Check diario: 30 × $0.005 = $0.15
- Scrape posts: 8 × $0.05 = $0.40
- Scrape interactions: 8 posts × 3 días × $0.35 = $8.40
TOTAL: $8.95/mes ✅
```

### **Caso 2: Perfil con 1 post/día**
```
Mes típico:
- 30 posts nuevos
- Check diario: 30 × $0.005 = $0.15
- Scrape posts: 30 × $0.05 = $1.50
- Scrape interactions: 30 posts × 2 días × $0.35 = $21.00
TOTAL: $22.65/mes ✅
```

### **Caso 3: Perfil inactivo (0 posts nuevos)**
```
Mes típico:
- 0 posts nuevos
- Check diario: 30 × $0.005 = $0.15
- Scrape posts: 0
- Scrape interactions: 0
TOTAL: $0.15/mes 🎉
```

---

## 🛡️ Protecciones anti-desperdicio

### 1. **Límite de tamaño de response**
```typescript
// Si el response excede 200KB, avisar
if (responseSize > 200 * 1024) {
  console.warn(`⚠️ Response too large for Clay!`);
  // Sugerir reducir max_posts
}
```

### 2. **Limpieza automática de cache**
```typescript
// Cada 6 horas, elimina cache expirado
setInterval(() => {
  apifyService.clearExpiredCache();
}, 6 * 60 * 60 * 1000);
```

### 3. **Rate limiting**
```typescript
// Máximo 100 requests cada 15 minutos
// Evita loops infinitos en Clay
```

---

## 🎯 Configuración en Clay

### **Tabla 1: Posts**
| Campo | Source | Tamaño |
|-------|--------|--------|
| post_id | `{{posts[].id}}` | 20B |
| url | `{{posts[].url}}` | 100B |
| content | `{{posts[].content}}` | 5KB |
| likes | `{{posts[].metrics.likes}}` | 10B |
| comments | `{{posts[].metrics.comments}}` | 10B |
| **Total por fila** | | **~5KB** |
| **Filas en 200KB** | | **~40 posts** |

### **Tabla 2: Interactions**
| Campo | Source | Tamaño |
|-------|--------|--------|
| post_id | `{{interactions[].post_id}}` | 20B |
| user_name | `{{interactions[].user_name}}` | 100B |
| user_url | `{{interactions[].user_url}}` | 150B |
| type | `{{interactions[].type}}` | 20B |
| **Total por fila** | | **~300B** |
| **Filas en 200KB** | | **~650 interactions** |

---

## 💡 Recomendaciones finales

### ✅ **DO:**
- Ejecutar Clay workflow **1x al día** (7:00 AM)
- Usar `check-new-posts` antes de scrapear
- Limitar a **10 posts** por request
- Scrape interactions **solo para posts activos** (< 7 días)

### ❌ **DON'T:**
- Ejecutar Clay cada hora (innecesario + caro)
- Usar `force_refresh=true` (ignora cache)
- Scrapear más de 50 posts de una vez
- Scrapear interactions de posts antiguos (> 30 días)

---

## 📞 Comandos útiles

```powershell
# Iniciar servidor optimizado
npm run dev:apify

# Ver health + stats de cache
Invoke-RestMethod -Uri "http://localhost:3000/health"

# Check si hay posts nuevos (barato)
Invoke-RestMethod -Uri "http://localhost:3000/api/check-new-posts?api_key=test-api-key-12345"

# Obtener posts (usa cache si puede)
Invoke-RestMethod -Uri "http://localhost:3000/api/posts?api_key=test-api-key-12345"

# Force refresh (ignora cache - usa con cuidado)
Invoke-RestMethod -Uri "http://localhost:3000/api/posts?api_key=test-api-key-12345&force_refresh=true"

# Limpiar cache manualmente
Invoke-RestMethod -Uri "http://localhost:3000/cache/clear?api_key=test-api-key-12345" -Method POST
```

---

## 🎉 Resultado Final

Con esta implementación:
- ✅ Pagas solo por datos **realmente nuevos**
- ✅ Cache inteligente reduce costos en **95%**
- ✅ Clay funciona perfecto con límite de 200KB
- ✅ Webhooks notifican cambios en tiempo real
- ✅ Costo estimado: **$5-15/mes** (vs $150/mes sin optimización)

---

**💰 Ahorro total: ~$135/mes** 🎊
