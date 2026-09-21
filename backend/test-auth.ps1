$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "=== TEST 1: Valid Login as Owner ==="
$loginPayload = @{
    email = "owner@jaymalhar.com"
    password = "DemoPass1234!"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json" -WebSession $session
Write-Host "Login succeeded! User: $($loginRes.user.name), Role: $($loginRes.user.role)"

Write-Host "`n=== TEST 2: Verify Protected Session /api/auth/me via httpOnly Cookie ==="
$meRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get -WebSession $session
Write-Host "Session verified! Authenticated as: $($meRes.user.email), Role: $($meRes.user.role)"

Write-Host "`n=== TEST 3: Invalid Credentials Login (Expect 401 Generic Error) ==="
try {
    $badPayload = @{
        email = "owner@jaymalhar.com"
        password = "WrongPassword999!"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $badPayload -ContentType "application/json"
    Write-Host "ERROR: Bad login unexpectedly succeeded!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Caught expected error: Status $statusCode -> $responseBody"
}

Write-Host "`n=== TEST 4: Unauthenticated Request to /api/auth/me (Expect 401) ==="
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get
    Write-Host "ERROR: Unauthenticated request unexpectedly succeeded!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Caught expected 401 Unauthorized for unauthenticated request (Status: $statusCode)"
}

Write-Host "`n=== TEST 5: Manager RBAC Check on Owner-Only /api/auth/register (Expect 403) ==="
$managerSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$managerLogin = @{
    email = "manager@jaymalhar.com"
    password = "DemoPass1234!"
} | ConvertTo-Json
$managerRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $managerLogin -ContentType "application/json" -WebSession $managerSession
Write-Host "Logged in as Manager: $($managerRes.user.name)"

try {
    $newUserPayload = @{
        email = "unauthorized@test.com"
        password = "ValidPassword10Char!"
        name = "Test User"
        roleId = "any"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $newUserPayload -ContentType "application/json" -WebSession $managerSession
    Write-Host "ERROR: Manager unexpectedly allowed to register users!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Caught expected 403 Forbidden for Manager attempting user creation (Status: $statusCode -> $responseBody)"
}

Write-Host "`n=== TEST 6: Logout Verification ==="
$logoutRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/logout" -Method Post -WebSession $session
Write-Host "Logout succeeded: $($logoutRes.message)"
