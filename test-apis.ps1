# Khata API Test Suite - Simplified Version
$baseUrl = "http://localhost:3001"

Write-Host "`n=== KHATA API TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl`n" -ForegroundColor Gray

# Test counter
$total = 0
$passed = 0

function Test-API {
    param([string]$name, [string]$url, [string]$expected = "401|404|200|307")
    $script:total++
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -ErrorAction Stop
        $status = $response.StatusCode
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if (!$status) { $status = "ERR" }
    }
    
    if ($status -match $expected) { 
        $script:passed++
        Write-Host "✓" -ForegroundColor Green -NoNewline 
    } else { 
        Write-Host "✗" -ForegroundColor Red -NoNewline 
    }
    Write-Host " $name [$status]"
}

# Authentication
Write-Host "`n[AUTH]" -ForegroundColor Cyan
Test-API "Session" "$baseUrl/api/auth/session"
Test-API "Providers" "$baseUrl/api/auth/providers"

# Organizations
Write-Host "`n[ORGANIZATIONS]" -ForegroundColor Cyan
Test-API "List Orgs" "$baseUrl/api/organizations"
Test-API "Get Org" "$baseUrl/api/organizations/test-id"

# Businesses
Write-Host "`n[BUSINESSES]" -ForegroundColor Cyan
Test-API "Get Business" "$baseUrl/api/businesses/test-id"
Test-API "List Branches" "$baseUrl/api/businesses/test-id/branches"

# Customers (with pagination)
Write-Host "`n[CUSTOMERS]" -ForegroundColor Cyan
Test-API "List Customers" "$baseUrl/api/businesses/test-id/customers"
Test-API "Customers Page 1" "$baseUrl/api/businesses/test-id/customers?page=1&limit=20"
Test-API "Search Customers" "$baseUrl/api/businesses/test-id/customers?search=ahmad"
Test-API "Customers Pagination" "$baseUrl/api/businesses/test-id/customers?page=2&limit=10"

# Transactions
Write-Host "`n[TRANSACTIONS]" -ForegroundColor Cyan
Test-API "List Transactions" "$baseUrl/api/businesses/test-id/transactions"
Test-API "Transactions Paginated" "$baseUrl/api/businesses/test-id/transactions?page=1&limit=20"
Test-API "Search Transactions" "$baseUrl/api/businesses/test-id/transactions?search=test"

# Products
Write-Host "`n[PRODUCTS]" -ForegroundColor Cyan
Test-API "List Products" "$baseUrl/api/businesses/test-id/products"

# Expenses
Write-Host "`n[EXPENSES]" -ForegroundColor Cyan
Test-API "List Expenses" "$baseUrl/api/businesses/test-id/expenses"

# Branch APIs
Write-Host "`n[BRANCHES]" -ForegroundColor Cyan
Test-API "Branch Inventory" "$baseUrl/api/branches/test-id/inventory"
Test-API "Branch Invoices" "$baseUrl/api/branches/test-id/invoices"
Test-API "Branch Transactions" "$baseUrl/api/branches/test-id/transactions"

# Frontend Pages
Write-Host "`n[FRONTEND]" -ForegroundColor Cyan
Test-API "Home Page" "$baseUrl/"
Test-API "Login Page" "$baseUrl/login"
Test-API "Dashboard" "$baseUrl/dashboard"

# Summary
$rate = [math]::Round(($passed / $total) * 100, 1)
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total:   $total"
Write-Host "Passed:  " -NoNewline
Write-Host "$passed" -ForegroundColor Green
Write-Host "Failed:  " -NoNewline
Write-Host "$($total - $passed)" -ForegroundColor $(if($total -eq $passed){"Green"}else{"Yellow"})
Write-Host "Rate:    $rate%`n"
