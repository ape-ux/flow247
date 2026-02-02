# Xano CORS Configuration Guide

## Problem
Your Xano API is rejecting requests from `http://localhost:4000` due to missing CORS headers.

## Solution: Configure CORS in Xano

### Step 1: Access Xano Settings
1. Log into your Xano workspace: https://xjlt-4ifj-k7qu.n7e.xano.io
2. Navigate to **Settings** → **API Settings** or **Workspace Settings**

### Step 2: Add CORS Origins

Add these allowed origins:

**Development:**
```
http://localhost:4000
http://localhost:5173
http://127.0.0.1:4000
http://127.0.0.1:5173
```

**Production (add your production domain):**
```
https://your-production-domain.com
```

### Step 3: Configure CORS Headers

Ensure these headers are enabled:
- `Access-Control-Allow-Origin: *` (or specific origins)
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Allow-Credentials: true` (if using cookies/sessions)

### Step 4: API-Level CORS (Alternative)

If workspace-level CORS isn't available, add CORS headers to each API endpoint:

1. Open each API endpoint in Xano
2. Add a **Function Stack** at the beginning
3. Add **Response Headers**:
   ```
   Access-Control-Allow-Origin: http://localhost:4000
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

### Step 5: Handle OPTIONS Preflight Requests

For each endpoint, ensure OPTIONS requests return 200:
1. Add a conditional check for `$request.method == 'OPTIONS'`
2. Return empty response with CORS headers

### Testing

After configuration, test in browser console:
```javascript
fetch('https://xjlt-4ifj-k7qu.n7e.xano.io/api:QC35j52Y/user/sync', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
}).then(r => console.log('CORS fixed!', r))
```

## References
- Xano CORS Documentation: https://docs.xano.com
- Affected endpoints:
  - `/user/by-supabase/:id`
  - `/user/sync`
  - All API endpoints under `api:QC35j52Y`
