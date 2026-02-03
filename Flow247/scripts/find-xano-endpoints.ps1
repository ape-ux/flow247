# Script to find Xano endpoint IDs in API Group 75 (Dashboard)
#
# Usage: .\scripts\find-xano-endpoints.ps1 -Token "your_xano_token_here"
#
# To get your token:
# 1. Go to your Xano dashboard
# 2. Click your profile → Account Settings → API Tokens
# 3. Create a token with Management API access

param(
    [Parameter(Mandatory=$false)]
    [string]$Token = $env:XANO_API_TOKEN,

    [Parameter(Mandatory=$false)]
    [int]$WorkspaceId = 1,

    [Parameter(Mandatory=$false)]
    [int]$ApiGroupId = 75
)

$XANO_BASE = "https://xjlt-4ifj-k7qu.n7e.xano.io"

if (-not $Token) {
    Write-Host "Error: Xano API token not provided" -ForegroundColor Red
    Write-Host ""
    Write-Host "To get your token:" -ForegroundColor Yellow
    Write-Host "1. Go to your Xano dashboard"
    Write-Host "2. Click your profile → Account Settings → API Tokens"
    Write-Host "3. Create a token with Management API access"
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\find-xano-endpoints.ps1 -Token 'your_token_here'"
    Write-Host "  OR set env variable: `$env:XANO_API_TOKEN = 'your_token_here'"
    exit 1
}

Write-Host ""
Write-Host "Searching for endpoints in API Group $ApiGroupId..." -ForegroundColor Cyan
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }

    $url = "$XANO_BASE/api:admin/workspaces/$WorkspaceId/api_groups/$ApiGroupId/endpoints"

    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get

    # Filter for the endpoints we need
    $shipments = $response | Where-Object { $_.path -eq "/shipments" -or $_.path -like "*shipments*" }
    $stats = $response | Where-Object { $_.path -eq "/dashboard/stats" -or $_.path -like "*stats*" }

    Write-Host "Found endpoints:" -ForegroundColor Green
    Write-Host ""

    if ($shipments) {
        Write-Host "✓ /shipments endpoint:" -ForegroundColor Green
        Write-Host "  - ID: $($shipments.id)"
        Write-Host "  - Path: $($shipments.path)"
        Write-Host "  - Method: $($shipments.method)"
        Write-Host "  - Full URL: $XANO_BASE/api:I5SJFe7I$($shipments.path)"
        Write-Host ""
    } else {
        Write-Host "✗ /shipments endpoint not found" -ForegroundColor Yellow
        Write-Host ""
    }

    if ($stats) {
        Write-Host "✓ /dashboard/stats endpoint:" -ForegroundColor Green
        Write-Host "  - ID: $($stats.id)"
        Write-Host "  - Path: $($stats.path)"
        Write-Host "  - Method: $($stats.method)"
        Write-Host "  - Full URL: $XANO_BASE/api:I5SJFe7I$($stats.path)"
        Write-Host ""
    } else {
        Write-Host "✗ /dashboard/stats endpoint not found" -ForegroundColor Yellow
        Write-Host ""
    }

    # Show all endpoints for reference
    Write-Host ""
    Write-Host "All endpoints in Dashboard API Group (75):" -ForegroundColor Cyan
    Write-Host ("=" * 60)

    $response | ForEach-Object {
        Write-Host "- [$($_.method)] $($_.path) (ID: $($_.id))"
    }

} catch {
    Write-Host "Error fetching endpoints: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Verify your API token has Management API access"
    Write-Host "2. Check that workspace ID ($WorkspaceId) and API group ID ($ApiGroupId) are correct"
    Write-Host "3. Ensure your token hasn't expired"
    Write-Host ""
    Write-Host "Full error:" -ForegroundColor Red
    Write-Host $_.Exception
}
