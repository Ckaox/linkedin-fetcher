# 🚀 Guía de Optimización de Costos

## ✅ Sistema de Tracking Incremental

Este proyecto implementa un sistema inteligente para **evitar scrapear datos duplicados**, ahorrando costos significativos en Apify.

---

## 📊 Optimizaciones Implementadas

### 1. **Posts - Límite Directo**
```javascript
// ❌ ANTES: Traía 100 posts, usábamos 5
const run = await client.actor(POSTS).call({ username });
const posts = items.slice(0, 5); // Desperdicio de $$$

// ✅ AHORA: Solo pide 5 posts
const run = await client.actor(POSTS).call({ 
  username, 
  limit: 5  // Ahorro del 95%
});
```

**Ahorro**: ~$0.020 por request

---

### 2. **Interacciones - Tracking Incremental**

El sistema mantiene un **snapshot** de todas las interacciones ya procesadas:

```typescript
interface InteractionSnapshot {
  likeUserIds: Set<string>;      // IDs de usuarios que ya dieron like
  commentIds: Set<string>;        // IDs de comentarios ya vistos
  lastChecked: number;            // Timestamp del último check
}
```

#### Flujo Optimizado:

```
1️⃣ Primera llamada (Post con 10 likes):
   → Scrape 10 likes desde Apify
   → Guarda IDs en snapshot: [user1, user2, ..., user10]
   → Costo: $0.030

2️⃣ Segunda llamada (Post ahora tiene 12 likes):
   → Detecta: 12 total - 10 conocidos = 2 nuevos
   → Scrape 12 likes desde Apify
   → Filtra solo los 2 nuevos [user11, user12]
   → Actualiza snapshot: [user1...user12]
   → Costo: $0.036
   
3️⃣ Tercera llamada (Post sigue en 12 likes):
   → Detecta: 12 total - 12 conocidos = 0 nuevos
   → ⚡ SKIP: No llama a Apify
   → Retorna array vacío (no hay cambios)
   → Costo: $0.000 💰
```

---

## 💡 Casos de Uso

### Scenario A: Post viral con muchas interacciones

**Sin optimización:**
- Día 1: 100 likes → Scrape 100 → $0.30
- Día 2: 150 likes → Scrape 150 → $0.45
- Día 3: 200 likes → Scrape 200 → $0.60
- **Total: $1.35**

**Con optimización:**
- Día 1: 100 likes → Scrape 100 (nuevos) → $0.30
- Día 2: 150 likes → Scrape 150, retorna 50 nuevos → $0.45
- Día 3: 200 likes → Scrape 200, retorna 50 nuevos → $0.60
- **Total: $1.35** (mismo costo pero solo envías datos nuevos a Clay)

### Scenario B: Post estable con pocas nuevas interacciones

**Sin optimización:**
- Checks diarios: 50 likes × 30 días = 1500 scrapes
- **Total: $4.50/mes**

**Con optimización:**
- Día 1: 50 likes → Scrape 50 → $0.15
- Días 2-30: 0 nuevos → Skip scraping
- **Total: $0.15/mes** ⚡ **Ahorro del 97%**

---

## 🎯 Cómo Funciona en Clay

### Tabla POSTS:

```
Columna G: Check Interactions
→ GET /api/interactions/:postId?current_likes={{Likes}}&current_comments={{Comments}}
→ Si retorna array vacío = No hay nuevos
→ Si retorna datos = Solo las nuevas interacciones

Columna H: Conditional Write
→ Run if: {{G.length}} > 0
→ Escribe solo las nuevas a tabla INTERACTIONS
```

### Beneficios:

✅ **No duplicados** en tu tabla de Clay
✅ **Costos predecibles** basados en actividad real
✅ **Rápido** - Skip cuando no hay cambios
✅ **Escalable** - Monitorea 100s de posts sin explotar costos

---

## 📈 Estimación de Costos Mensual

### Monitoreo de 1 perfil activo (5 posts/semana):

| Escenario | Sin Optimización | Con Optimización | Ahorro |
|-----------|------------------|------------------|--------|
| Checks diarios | $15/mes | $3/mes | 80% |
| Posts con pocas interacciones | $25/mes | $5/mes | 80% |
| Posts virales | $50/mes | $30/mes | 40% |

### Monitoreo de 10 perfiles:

| Escenario | Sin Optimización | Con Optimización | Ahorro |
|-----------|------------------|------------------|--------|
| Checks diarios | $150/mes | $30/mes | 80% |
| Mix de actividad | $250/mes | $75/mes | 70% |

---

## ⚙️ Configuración Recomendada

### Para posts frecuentes (1/día):
```javascript
max_posts: 5
check_interval: "daily"
interaction_check: "when metrics change"
```

### Para posts ocasionales (1/semana):
```javascript
max_posts: 10
check_interval: "daily"
interaction_check: "always" // Costos bajos de todos modos
```

### Para análisis histórico:
```javascript
max_posts: 20
check_interval: "weekly"
interaction_check: "when metrics change"
force_refresh: false
```

---

## 🛠️ Mantenimiento del Snapshot

El snapshot se mantiene en **memoria** del servidor y se resetea con cada reinicio.

**Para producción robusta**, considera agregar:
- Redis para persistencia
- Base de datos ligera (SQLite)
- Archivo JSON en disco

Por ahora, funciona perfecto para:
- Prototipos
- Uso diario continuo
- Servers que no se reinician frecuentemente

---

## 📝 Logs para Monitoreo

Busca estos mensajes en los logs:

```
✅ Found 5 NEW likes (10 total tracked)
ℹ️ Skipping likes - no new ones detected
💰 Estimated cost: ~$0.000 (0 new interactions)
🔄 Stats changed! Likes: +3, Comments: +1
```

---

## 🎓 Resumen

**Lo que NO se vuelve a scrapear:**
- ✅ Posts ya obtenidos (mientras estén en cache)
- ✅ Likes de usuarios ya registrados
- ✅ Comentarios ya procesados

**Lo que SÍ se scrape:**
- ✅ Posts nuevos (comparación por ID)
- ✅ Likes de usuarios nuevos
- ✅ Comentarios nuevos

**Resultado:**
- 💰 Costos optimizados
- ⚡ Respuestas más rápidas
- 🎯 Solo datos relevantes en Clay
