# Command Center Connection Test Script
# Run this from Windows PowerShell

Write-Host "🔍 Testing Command Center Connection..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test 1: Basic connectivity
$serverIP = "10.0.0.229"
$port = 3001

Write-Host "`n✅ Test 1: Network Connectivity to $serverIP`:$port" -ForegroundColor Yellow
try {
    $tcpTest = Test-NetConnection -ComputerName $serverIP -Port $port -WarningAction SilentlyContinue
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "   🟢 SUCCESS: Port $port is open on $serverIP" -ForegroundColor Green
    } else {
        Write-Host "   🔴 FAILED: Cannot connect to $serverIP`:$port" -ForegroundColor Red
        Write-Host "   ℹ️  Check if server is running on Ubuntu" -ForegroundColor Gray
    }
} catch {
    Write-Host "   🔴 ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: HTTP API health check
Write-Host "`n✅ Test 2: HTTP API Health Check" -ForegroundColor Yellow
$healthUrl = "http://${serverIP}:${port}/api/health"
try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5
    Write-Host "   🟢 SUCCESS: API is responding" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Message: $($response.message)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "   🔴 FAILED: API not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Web interface
Write-Host "`n✅ Test 3: Web Interface" -ForegroundColor Yellow
$webUrl = "http://${serverIP}:${port}/"
try {
    $webResponse = Invoke-WebRequest -Uri $webUrl -Method Get -TimeoutSec 5
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "   🟢 SUCCESS: Web interface is loading" -ForegroundColor Green
        Write-Host "   Title: $($webResponse.ParsedHtml.title)" -ForegroundColor Gray
        
        # Check for key elements
        $htmlContent = $webResponse.Content
        if ($htmlContent -match "Command Center") {
            Write-Host "   ✓ Contains 'Command Center'" -ForegroundColor Green
        }
        if ($htmlContent -match "Prospyr") {
            Write-Host "   ✓ Contains 'Prospyr' agent" -ForegroundColor Green
        }
        if ($htmlContent -match "chat") {
            Write-Host "   ✓ Contains chat interface" -ForegroundColor Green
        }
    } else {
        Write-Host "   🔴 FAILED: HTTP $($webResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   🔴 FAILED: Cannot load web interface" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Chat functionality
Write-Host "`n✅ Test 4: Chat API Test" -ForegroundColor Yellow
$chatUrl = "http://${serverIP}:${port}/api/chat"
$chatBody = @{
    message = "Test connection from Windows"
    brainId = "deepseek"
    agentId = "prospyr"
} | ConvertTo-Json

try {
    $chatResponse = Invoke-RestMethod -Uri $chatUrl -Method Post -Body $chatBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "   🟢 SUCCESS: Chat is working!" -ForegroundColor Green
    Write-Host "   Response preview: $($chatResponse.response.Substring(0, [Math]::Min(100, $chatResponse.response.Length)))..." -ForegroundColor Gray
    Write-Host "   Agent: $($chatResponse.agentId)" -ForegroundColor Gray
    Write-Host "   Brain: $($chatResponse.brainId)" -ForegroundColor Gray
} catch {
    Write-Host "   🔴 FAILED: Chat API error" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Server: $serverIP`:$port" -ForegroundColor Gray
Write-Host "Web Interface: http://${serverIP}:${port}/" -ForegroundColor Gray
Write-Host "API Health: http://${serverIP}:${port}/api/health" -ForegroundColor Gray
Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Open browser to: http://${serverIP}:${port}/" -ForegroundColor Yellow
Write-Host "2. Try chatting with Prospyr about OmniMind deployment" -ForegroundColor Yellow
Write-Host "3. Switch agents and brains using the left sidebar" -ForegroundColor Yellow
Write-Host "4. Check deployment tasks in right sidebar" -ForegroundColor Yellow

Write-Host "`n💡 TIP: If tests fail, ensure:" -ForegroundColor Magenta
Write-Host "   • Server is running on Ubuntu (prospyerity)" -ForegroundColor Gray
Write-Host "   • Firewall allows port 3001 (sudo ufw allow 3001)" -ForegroundColor Gray
Write-Host "   • You're on the same network as the server" -ForegroundColor Gray

Write-Host "`n🚀 Command Center is ready for OmniMind deployment coordination!" -ForegroundColor Green