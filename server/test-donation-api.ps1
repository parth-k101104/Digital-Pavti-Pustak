# Digital Pavti Pustak - Donation API Test Script
# This script tests the donation management system with role-based access control

Write-Host "=== Digital Pavti Pustak - Donation API Testing ===" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:8080/api"
$adminToken = ""
$userToken = ""

# Function to make HTTP requests with error handling
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [string]$Token = $null,
        [string]$Description = ""
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = $Body
        }
        
        Write-Host "Testing: $Description" -ForegroundColor Yellow
        Write-Host "  URL: $Method $Url"
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✅ Success: $($response.message)" -ForegroundColor Green
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        if ($statusCode -eq 401) {
            Write-Host "  ❌ Unauthorized (401): Authentication required" -ForegroundColor Red
        }
        elseif ($statusCode -eq 403) {
            Write-Host "  ❌ Forbidden (403): Access denied" -ForegroundColor Red
        }
        elseif ($statusCode -eq 400) {
            Write-Host "  ❌ Bad Request (400): Invalid data" -ForegroundColor Red
        }
        else {
            Write-Host "  ❌ Error ($statusCode): $errorMessage" -ForegroundColor Red
        }
        return $null
    }
}

# Step 1: Test Health Endpoints
Write-Host "1. Testing Health Endpoints..." -ForegroundColor Cyan
Write-Host ""

$healthResult = Invoke-ApiRequest -Url "$baseUrl/health" -Description "General Health Check"
$donationHealthResult = Invoke-ApiRequest -Url "$baseUrl/donations/health" -Description "Donation Service Health Check"

Write-Host ""

# Step 2: Authenticate Users
Write-Host "2. Authenticating Users..." -ForegroundColor Cyan
Write-Host ""

# Admin login
$adminLoginData = @{
    name = "System_Administrator"
    password = "admin123"
} | ConvertTo-Json

$adminLoginResult = Invoke-ApiRequest -Url "$baseUrl/auth/login" -Method "POST" -Body $adminLoginData -Description "Admin Login"

if ($adminLoginResult -and $adminLoginResult.success) {
    $adminToken = $adminLoginResult.token
    Write-Host "  Admin token obtained successfully" -ForegroundColor Green
}

# User login
$userLoginData = @{
    name = "Regular_User"
    password = "user123"
} | ConvertTo-Json

$userLoginResult = Invoke-ApiRequest -Url "$baseUrl/auth/login" -Method "POST" -Body $userLoginData -Description "User Login"

if ($userLoginResult -and $userLoginResult.success) {
    $userToken = $userLoginResult.token
    Write-Host "  User token obtained successfully" -ForegroundColor Green
}

Write-Host ""

# Step 3: Test Donation Creation
Write-Host "3. Testing Donation Creation..." -ForegroundColor Cyan
Write-Host ""

$donationData = @{
    donorName = "Test Donor"
    donorAddress = "123 Test Street, Test City"
    donorPhone = "1234567890"
    donationAmount = 1000.50
    donationType = "Cash"
    notes = "Test donation via API"
} | ConvertTo-Json

# Test as User
$userDonationResult = Invoke-ApiRequest -Url "$baseUrl/donations" -Method "POST" -Body $donationData -Token $userToken -Description "Create Donation as User"

# Test as Admin
$adminDonationResult = Invoke-ApiRequest -Url "$baseUrl/donations" -Method "POST" -Body $donationData -Token $adminToken -Description "Create Donation as Admin"

# Test without authentication
$unauthDonationResult = Invoke-ApiRequest -Url "$baseUrl/donations" -Method "POST" -Body $donationData -Description "Create Donation without Authentication"

Write-Host ""

# Step 4: Test Donation Retrieval
Write-Host "4. Testing Donation Retrieval..." -ForegroundColor Cyan
Write-Host ""

$currentYear = (Get-Date).Year

# Test getting donations by year as User
$userYearResult = Invoke-ApiRequest -Url "$baseUrl/donations/$currentYear" -Token $userToken -Description "Get Current Year Donations as User"

# Test getting donations by year as Admin
$adminYearResult = Invoke-ApiRequest -Url "$baseUrl/donations/$currentYear" -Token $adminToken -Description "Get Current Year Donations as Admin"

# Test getting all donations as Admin
$adminAllResult = Invoke-ApiRequest -Url "$baseUrl/donations/all" -Token $adminToken -Description "Get All Donations as Admin"

# Test getting all donations as User (should fail)
$userAllResult = Invoke-ApiRequest -Url "$baseUrl/donations/all" -Token $userToken -Description "Get All Donations as User (should fail)"

Write-Host ""

# Step 5: Test Available Years and Statistics
Write-Host "5. Testing Years and Statistics..." -ForegroundColor Cyan
Write-Host ""

# Test getting available years
$yearsResult = Invoke-ApiRequest -Url "$baseUrl/donations/years" -Token $userToken -Description "Get Available Years"

# Test getting year statistics
$statsResult = Invoke-ApiRequest -Url "$baseUrl/donations/$currentYear/stats" -Token $userToken -Description "Get Current Year Statistics"

Write-Host ""

# Step 6: Test Admin-Only Operations
Write-Host "6. Testing Admin-Only Operations..." -ForegroundColor Cyan
Write-Host ""

# Test update donation as User (should fail)
$updateData = @{
    donorName = "Updated Donor Name"
    donorAddress = "Updated Address"
    donorPhone = "9876543210"
    donationAmount = 2000.00
    donationType = "Cheque"
    notes = "Updated notes"
} | ConvertTo-Json

$userUpdateResult = Invoke-ApiRequest -Url "$baseUrl/donations/$currentYear/1" -Method "PUT" -Body $updateData -Token $userToken -Description "Update Donation as User (should fail)"

# Test update donation as Admin
$adminUpdateResult = Invoke-ApiRequest -Url "$baseUrl/donations/$currentYear/1" -Method "PUT" -Body $updateData -Token $adminToken -Description "Update Donation as Admin"

# Test delete donation as User (should fail)
$userDeleteResult = Invoke-ApiRequest -Url "$baseUrl/donations/$currentYear/1" -Method "DELETE" -Token $userToken -Description "Delete Donation as User (should fail)"

Write-Host ""

# Step 7: Test Input Validation
Write-Host "7. Testing Input Validation..." -ForegroundColor Cyan
Write-Host ""

# Test with invalid data
$invalidDonationData = @{
    donorName = ""  # Invalid: empty name
    donorAddress = "Test"  # Invalid: too short
    donorPhone = "123"  # Invalid: too short
    donationAmount = -100  # Invalid: negative amount
    donationType = "Cash"
} | ConvertTo-Json

$invalidDataResult = Invoke-ApiRequest -Url "$baseUrl/donations" -Method "POST" -Body $invalidDonationData -Token $userToken -Description "Create Donation with Invalid Data"

# Test with invalid year
$invalidYearResult = Invoke-ApiRequest -Url "$baseUrl/donations/1999" -Token $userToken -Description "Get Donations for Invalid Year"

Write-Host ""

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Green
Write-Host ""

$totalTests = 0
$passedTests = 0

$testResults = @(
    @{ Name = "Health Check"; Result = $healthResult -ne $null }
    @{ Name = "Donation Health Check"; Result = $donationHealthResult -ne $null }
    @{ Name = "Admin Login"; Result = $adminLoginResult -ne $null -and $adminLoginResult.success }
    @{ Name = "User Login"; Result = $userLoginResult -ne $null -and $userLoginResult.success }
    @{ Name = "User Create Donation"; Result = $userDonationResult -ne $null -and $userDonationResult.success }
    @{ Name = "Admin Create Donation"; Result = $adminDonationResult -ne $null -and $adminDonationResult.success }
    @{ Name = "Unauthorized Create (should fail)"; Result = $unauthDonationResult -eq $null }
    @{ Name = "User Get Year Donations"; Result = $userYearResult -ne $null -and $userYearResult.success }
    @{ Name = "Admin Get Year Donations"; Result = $adminYearResult -ne $null -and $adminYearResult.success }
    @{ Name = "Admin Get All Donations"; Result = $adminAllResult -ne $null -and $adminAllResult.success }
    @{ Name = "User Get All (should fail)"; Result = $userAllResult -eq $null }
    @{ Name = "Get Available Years"; Result = $yearsResult -ne $null -and $yearsResult.success }
    @{ Name = "Get Year Statistics"; Result = $statsResult -ne $null -and $statsResult.success }
    @{ Name = "User Update (should fail)"; Result = $userUpdateResult -eq $null }
    @{ Name = "User Delete (should fail)"; Result = $userDeleteResult -eq $null }
    @{ Name = "Invalid Data (should fail)"; Result = $invalidDataResult -eq $null }
    @{ Name = "Invalid Year (should fail)"; Result = $invalidYearResult -eq $null }
)

foreach ($test in $testResults) {
    $totalTests++
    if ($test.Result) {
        $passedTests++
        Write-Host "✅ $($test.Name)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($test.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Results: $passedTests/$totalTests tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 All tests passed! Donation management system is working correctly." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please check the backend server and try again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== End of Testing ===" -ForegroundColor Green
