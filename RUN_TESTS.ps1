#!/usr/bin/env pwsh
# BEL-EDIDAP Quick Start Testing Script
# This script runs all automated tests for the project

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         BEL-EDIDAP Automated Testing Suite                  ║" -ForegroundColor Cyan
Write-Host "║    Testing Backend API, Smart Contracts, and Services       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend API Unit Tests
Write-Host "📋 TEST 1: Backend API Security & RBAC Tests" -ForegroundColor Yellow
Write-Host "Location: apps/api/test/security_and_rbac.test.ts" -ForegroundColor Gray
Write-Host ""
Push-Location "apps/api"
npm run test
$apiTestResult = $LASTEXITCODE
Pop-Location
Write-Host ""

# Test 2: Backend TypeScript Compilation
Write-Host "📋 TEST 2: Backend TypeScript Compilation" -ForegroundColor Yellow
Write-Host "Location: apps/api/src" -ForegroundColor Gray
Write-Host ""
Push-Location "apps/api"
npm run build
$backendBuildResult = $LASTEXITCODE
Pop-Location
Write-Host ""

# Test 3: Smart Contract Compilation
Write-Host "📋 TEST 3: Smart Contract Solidity Compilation" -ForegroundColor Yellow
Write-Host "Location: packages/contracts/contracts" -ForegroundColor Gray
Write-Host ""
Push-Location "packages/contracts"
npm run compile
$contractCompileResult = $LASTEXITCODE
Pop-Location
Write-Host ""

# Test 4: Smart Contract Unit Tests
Write-Host "📋 TEST 4: Smart Contract Unit Tests" -ForegroundColor Yellow
Write-Host "Location: packages/contracts/test" -ForegroundColor Gray
Write-Host ""
Push-Location "packages/contracts"
npm run test
$contractTestResult = $LASTEXITCODE
Pop-Location
Write-Host ""

# Summary
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                     TEST SUMMARY REPORT                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$resultsTable = @(
    @{Test = "Backend API Tests (Jest)"; Result = if($apiTestResult -eq 0) { "✅ PASS" } else { "❌ FAIL" } },
    @{Test = "Backend TypeScript Build"; Result = if($backendBuildResult -eq 0) { "✅ PASS" } else { "❌ FAIL" } },
    @{Test = "Contract Solidity Compile"; Result = if($contractCompileResult -eq 0) { "✅ PASS" } else { "❌ FAIL" } },
    @{Test = "Contract Unit Tests"; Result = if($contractTestResult -eq 0) { "✅ PASS" } else { "❌ FAIL" } }
)

$resultsTable | Format-Table -AutoSize

$allPassed = ($apiTestResult -eq 0) -and ($backendBuildResult -eq 0) -and ($contractCompileResult -eq 0) -and ($contractTestResult -eq 0)

Write-Host ""
if ($allPassed) {
    Write-Host "🎉 ALL TESTS PASSED! Project is ready for deployment." -ForegroundColor Green
    Write-Host "📖 See TESTING_GUIDE.md for comprehensive documentation" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please review the output above." -ForegroundColor Red
}
Write-Host ""
