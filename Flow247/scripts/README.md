# Xano Endpoint Finder Scripts

These scripts help you find Xano endpoint IDs in your workspace.

## Quick Start

### PowerShell (Recommended for Windows)

```powershell
# 1. Set your Xano Management API token
$env:XANO_API_TOKEN = "your_token_here"

# 2. Run the script
.\scripts\find-xano-endpoints.ps1
```

### Node.js

```bash
# 1. Set your Xano Management API token
set XANO_API_TOKEN=your_token_here

# 2. Run the script
node scripts/find-xano-endpoints.js
```

## What This Does

The scripts will:
1. Connect to your Xano workspace
2. List all endpoints in API Group 75 (Dashboard)
3. Highlight the `/shipments` and `/dashboard/stats` endpoints
4. Show their endpoint IDs

## Example Output

```
Searching for endpoints in API Group 75...

Found endpoints:

✓ /shipments endpoint:
  - ID: 12345
  - Path: /shipments
  - Method: GET
  - Full URL: https://xjlt-4ifj-k7qu.n7e.xano.io/api:I5SJFe7I/shipments

✓ /dashboard/stats endpoint:
  - ID: 12346
  - Path: /dashboard/stats
  - Method: GET
  - Full URL: https://xjlt-4ifj-k7qu.n7e.xano.io/api:I5SJFe7I/dashboard/stats

All endpoints in Dashboard API Group (75):
============================================================
- [GET] /shipments (ID: 12345)
- [GET] /dashboard/stats (ID: 12346)
- [GET] /dashboard/activity (ID: 12347)
- [GET] /cfs/containers (ID: 12348)
...
```

## Getting Your API Token

1. Go to: https://xjlt-4ifj-k7qu.n7e.xano.io
2. Click your profile → **Account Settings**
3. Navigate to **API Tokens**
4. Click **Create Token**
5. Give it a name: "Management API"
6. Grant **Management API** permissions
7. Copy the token (shown only once!)

## Troubleshooting

### "Error: Xano API token not provided"
- Make sure you set the environment variable: `$env:XANO_API_TOKEN = "your_token"`
- Or pass it directly: `.\find-xano-endpoints.ps1 -Token "your_token"`

### "API request failed: 401 Unauthorized"
- Your token is invalid or expired
- Create a new token with Management API permissions

### "API request failed: 404 Not Found"
- Workspace ID or API Group ID is incorrect
- Verify in Xano dashboard: Settings → Workspace Info

### "Endpoint not found"
- The endpoint might not exist yet
- Check Xano dashboard → API Groups → Dashboard (75)
- Verify the endpoint path matches exactly

## Custom Usage

### Different API Group
```powershell
.\find-xano-endpoints.ps1 -ApiGroupId 23 -Token "your_token"
```

### Different Workspace
```powershell
.\find-xano-endpoints.ps1 -WorkspaceId 2 -Token "your_token"
```

## Files

- `find-xano-endpoints.ps1` - PowerShell version (Windows)
- `find-xano-endpoints.js` - Node.js version (cross-platform)
- `remove-endpoint-auth.js` - Remove authentication from specific endpoints

## Additional Scripts

### Remove Endpoint Authentication

If your endpoints return 401 Unauthorized errors due to `auth = "user"` in their XanoScript, use the removal script:

```bash
# 1. Set your Xano Management API token
set XANO_API_TOKEN=your_token_here

# 2. Run the removal script
node scripts/remove-endpoint-auth.js
```

This will automatically:
- Find `/shipments` and `/dashboard/stats` endpoints
- Remove the `auth = "user"` line from XanoScript
- Disable authentication requirement
- Make endpoints publicly accessible

See `docs/REMOVE_ENDPOINT_AUTH.md` for detailed instructions including manual UI steps.

## Next Steps

Once you have the endpoint IDs:
1. Document them in `docs/XANO_ENDPOINT_IDS.md`
2. Use them in your MCP server configuration
3. Reference them in API management scripts
