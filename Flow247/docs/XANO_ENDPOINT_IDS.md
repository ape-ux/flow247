# Xano Endpoint ID Reference

## Dashboard API Group (ID: 75)

### Known Endpoints

Based on `src/lib/xano.ts`, these endpoints are in use:

| Endpoint Path | Method | Purpose | Used in Code (Line) |
|--------------|--------|---------|---------------------|
| `/shipments` | GET | Fetch shipments with pagination | Line 484 (getShipments) |
| `/dashboard/stats` | GET | Get dashboard statistics | Line 560 (getDashboardStats) |
| `/dashboard/activity` | GET | Get recent activity logs | Line 591 (getRecentActivity) |
| `/cfs/containers` | GET | Get CFS containers | Line 914 (getCfsContainers) |
| `/cfs/tasks` | GET | Get CFS tasks | Line 948 (getCfsTasks) |

### Base URL
```
https://xjlt-4ifj-k7qu.n7e.xano.io/api:I5SJFe7I
```

## How to Find Endpoint IDs

### Method 1: Xano Dashboard (Easiest)
1. Go to: https://xjlt-4ifj-k7qu.n7e.xano.io
2. Navigate to **API** → **API Groups** → **Dashboard (75)**
3. Click on the endpoint you need
4. The endpoint ID will be visible in:
   - The URL bar (e.g., `.../endpoints/[ID]`)
   - The endpoint settings panel

### Method 2: Use the PowerShell Script
```powershell
# Get your Xano Management API token first
$env:XANO_API_TOKEN = "your_token_here"

# Run the script
.\scripts\find-xano-endpoints.ps1
```

### Method 3: Use the Node.js Script
```bash
# Set environment variable
set XANO_API_TOKEN=your_token_here

# Run the script
node scripts/find-xano-endpoints.js
```

### Method 4: Direct API Call with cURL
```bash
curl -X GET "https://xjlt-4ifj-k7qu.n7e.xano.io/api:admin/workspaces/1/api_groups/75/endpoints" \
  -H "Authorization: Bearer YOUR_XANO_TOKEN" \
  -H "Content-Type: application/json"
```

## Getting Your Xano Management API Token

1. Log into Xano: https://xjlt-4ifj-k7qu.n7e.xano.io
2. Click your profile picture (top right)
3. Select **Account Settings**
4. Navigate to **API Tokens**
5. Click **Create Token**
6. Name it: "Management API Access"
7. Grant it **Management API** permissions
8. Copy the token (you'll only see it once!)

## Why You Need Endpoint IDs

Endpoint IDs are required for:
- MCP (Model Context Protocol) server integration
- Direct API management operations
- Automated deployment scripts
- API documentation generation
- Programmatic endpoint updates

## Expected Format

Once you find them, the endpoint IDs will likely look like:
```json
{
  "shipments": 12345,
  "dashboard_stats": 12346
}
```

These are internal Xano database IDs that uniquely identify each API endpoint.

## Workspace & API Group Info

- **Workspace ID**: 1
- **API Group ID**: 75 (Dashboard)
- **API Group Name**: Dashboard
- **Base URL Key**: `I5SJFe7I`

## Related Files

- Frontend integration: `C:\Users\HP\Ape Global\Flow247\src\lib\xano.ts`
- MCP config: `C:\Users\HP\Ape Global\Flow247\.mcp.json`
- Helper scripts: `C:\Users\HP\Ape Global\Flow247\scripts\find-xano-endpoints.*`

## Next Steps

1. Get your Xano Management API token
2. Run one of the helper scripts above
3. Document the endpoint IDs here once found
4. Update your MCP configuration if needed

---

**Last Updated**: 2026-02-02
