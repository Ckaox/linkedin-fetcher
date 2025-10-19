# 🧪 Script de Testing - LinkedIn Clay Integration

## Variables de configuración
$SERVER_URL = "http://localhost:3000"
$API_KEY = "test-api-key-12345"
$APIFY_TOKEN = "apify_api_YOUR_TOKEN_HERE"  # Reemplaza con tu token real
$USERNAME = "gabrielmartinezes"

Write-Host "`n🚀 LinkedIn → Clay Integration - Test Suite`n" -ForegroundColor Cyan

## Test 1: Health Check
Write-Host "📊 Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$SERVER_URL/health" -Method Get
    Write-Host "✅ Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Mode: $($health.mode)" -ForegroundColor Gray
    Write-Host "   Cache entries: $($health.cache.entries)" -ForegroundColor Gray
    Write-Host "   Cache size: $($health.cache.size)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

## Test 2: Sin token de Apify (debe fallar)
Write-Host "📊 Test 2: Request sin Apify Token (debe fallar)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$SERVER_URL/api/check-new-posts?api_key=$API_KEY" -Method Get
    Write-Host "❌ No debería haber funcionado!`n" -ForegroundColor Red
} catch {
    Write-Host "✅ Falló correctamente: Missing Apify token`n" -ForegroundColor Green
}

## Test 3: Check nuevos posts (con token en header)
Write-Host "📊 Test 3: Check Posts Nuevos (con token)" -ForegroundColor Yellow
try {
    $headers = @{
        "x-api-key" = $API_KEY
        "x-apify-token" = $APIFY_TOKEN
    }
    
    $check = Invoke-RestMethod -Uri "$SERVER_URL/api/check-new-posts?username=$USERNAME" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Has new posts: $($check.data.hasNewPosts)" -ForegroundColor Gray
    Write-Host "   Username: $($check.data.username)" -ForegroundColor Gray
    Write-Host "   Checked at: $($check.data.checkedAt)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

## Test 4: Obtener posts (con token en query)
Write-Host "📊 Test 4: Obtener Posts (token en query)" -ForegroundColor Yellow
try {
    $posts = Invoke-RestMethod -Uri "$SERVER_URL/api/posts?api_key=$API_KEY&apify_token=$APIFY_TOKEN&username=$USERNAME&max_posts=5" `
        -Method Get
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Total posts: $($posts.data.totalPosts)" -ForegroundColor Gray
    Write-Host "   Scraped at: $($posts.data.scrapedAt)" -ForegroundColor Gray
    
    if ($posts.data.posts.Count -gt 0) {
        Write-Host "`n   Primer post:" -ForegroundColor Cyan
        Write-Host "   - ID: $($posts.data.posts[0].id)" -ForegroundColor Gray
        Write-Host "   - Autor: $($posts.data.posts[0].authorName)" -ForegroundColor Gray
        Write-Host "   - Likes: $($posts.data.posts[0].metrics.likes)" -ForegroundColor Gray
        Write-Host "   - Comments: $($posts.data.posts[0].metrics.comments)" -ForegroundColor Gray
        Write-Host "   - Content: $($posts.data.posts[0].content.Substring(0, [Math]::Min(100, $posts.data.posts[0].content.Length)))..." -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

## Test 5: Cache stats
Write-Host "📊 Test 5: Cache Statistics" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$SERVER_URL/health" -Method Get
    Write-Host "✅ Cache Stats:" -ForegroundColor Green
    Write-Host "   Entries: $($health.cache.entries)" -ForegroundColor Gray
    Write-Host "   Size: $($health.cache.size)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "🎉 Tests completados!" -ForegroundColor Cyan
Write-Host "`n💡 Para testing real, reemplaza APIFY_TOKEN con tu token de https://apify.com`n" -ForegroundColor Yellow
