# PowerShell script to test the Digital Pavti Pustak API

Write-Host "Testing Digital Pavti Pustak API..." -ForegroundColor Green

# Test health endpoint
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET
    Write-Host "✅ Health Check: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "   Service: $($healthResponse.service)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test admin login
Write-Host "`n2. Testing Admin Login..." -ForegroundColor Yellow
try {
    $adminLoginBody = @{
        name = "System_Administrator"
        password = "admin123"
    } | ConvertTo-Json

    $adminResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $adminLoginBody
    Write-Host "✅ Admin Login: Success" -ForegroundColor Green
    Write-Host "   Full Name: $($adminResponse.fullName)" -ForegroundColor Cyan
    Write-Host "   First Name: $($adminResponse.firstName)" -ForegroundColor Cyan
    Write-Host "   Last Name: $($adminResponse.lastName)" -ForegroundColor Cyan
    Write-Host "   Role: $($adminResponse.role)" -ForegroundColor Cyan
    Write-Host "   Redirect To: $($adminResponse.redirectTo)" -ForegroundColor Cyan
    $adminToken = $adminResponse.token
} catch {
    Write-Host "❌ Admin Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test user login
Write-Host "`n3. Testing User Login..." -ForegroundColor Yellow
try {
    $userLoginBody = @{
        name = "Regular_User"
        password = "user123"
    } | ConvertTo-Json

    $userResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $userLoginBody
    Write-Host "✅ User Login: Success" -ForegroundColor Green
    Write-Host "   Full Name: $($userResponse.fullName)" -ForegroundColor Cyan
    Write-Host "   First Name: $($userResponse.firstName)" -ForegroundColor Cyan
    Write-Host "   Last Name: $($userResponse.lastName)" -ForegroundColor Cyan
    Write-Host "   Role: $($userResponse.role)" -ForegroundColor Cyan
    Write-Host "   Redirect To: $($userResponse.redirectTo)" -ForegroundColor Cyan
    $userToken = $userResponse.token
} catch {
    Write-Host "❌ User Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test token validation
if ($adminToken) {
    Write-Host "`n4. Testing Token Validation..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $adminToken"
        }
        $validateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/validate" -Method POST -Headers $headers
        Write-Host "✅ Token Validation: Success" -ForegroundColor Green
        Write-Host "   Valid: $($validateResponse.valid)" -ForegroundColor Cyan
        Write-Host "   Role: $($validateResponse.role)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Token Validation Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test invalid login
Write-Host "`n5. Testing Invalid Login..." -ForegroundColor Yellow
try {
    $invalidLoginBody = @{
        name = "Invalid_User"
        password = "invalid"
    } | ConvertTo-Json

    $invalidResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $invalidLoginBody
    Write-Host "❌ Invalid Login: Should have failed but didn't" -ForegroundColor Red
} catch {
    Write-Host "✅ Invalid Login: Correctly rejected" -ForegroundColor Green
}

# Test invalid name format
Write-Host "`n6. Testing Invalid Name Format..." -ForegroundColor Yellow
try {
    $invalidFormatBody = @{
        name = "InvalidFormat"
        password = "password"
    } | ConvertTo-Json

    $invalidFormatResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $invalidFormatBody
    Write-Host "❌ Invalid Format: Should have failed but didn't" -ForegroundColor Red
} catch {
    Write-Host "✅ Invalid Format: Correctly rejected" -ForegroundColor Green
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "`nDefault Users:" -ForegroundColor Yellow
Write-Host "  Admin: System_Administrator/admin123 → HomePage" -ForegroundColor Cyan
Write-Host "  User: Regular_User/user123 → DonationsPage" -ForegroundColor Cyan
Write-Host "  Demo Admin: Demo_Admin/demo123 → HomePage" -ForegroundColor Cyan
Write-Host "  Demo User: Demo_User/demo123 → DonationsPage" -ForegroundColor Cyan
