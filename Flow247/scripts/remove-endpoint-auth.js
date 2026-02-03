/**
 * Script to remove authentication from Xano endpoints
 *
 * This script removes the "auth = user" requirement from:
 * - GET /shipments
 * - GET /dashboard/stats
 *
 * Usage:
 * 1. Set your Xano API token: set XANO_API_TOKEN=your_token_here
 * 2. Run: node scripts/remove-endpoint-auth.js
 */

const XANO_BASE = 'https://xjlt-4ifj-k7qu.n7e.xano.io';
const WORKSPACE_ID = 1;
const API_GROUP_ID = 75; // Dashboard API Group

async function removeAuthFromEndpoints() {
  const token = process.env.XANO_API_TOKEN;

  if (!token) {
    console.error('Error: XANO_API_TOKEN environment variable not set');
    console.log('\nTo get your token:');
    console.log('1. Go to https://xjlt-4ifj-k7qu.n7e.xano.io');
    console.log('2. Click your profile icon → Account Settings');
    console.log('3. Navigate to API Tokens tab');
    console.log('4. Create a new token with "Management API" access');
    console.log('5. Copy the token and run:');
    console.log('   set XANO_API_TOKEN=your_token_here');
    console.log('6. Run this script again');
    process.exit(1);
  }

  try {
    // Step 1: Find the endpoints
    console.log('\n🔍 Step 1: Finding endpoints in API Group 75...\n');

    const listResponse = await fetch(
      `${XANO_BASE}/api:admin/workspaces/${WORKSPACE_ID}/api_groups/${API_GROUP_ID}/endpoints`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!listResponse.ok) {
      throw new Error(`Failed to list endpoints: ${listResponse.status} ${listResponse.statusText}`);
    }

    const endpoints = await listResponse.json();

    // Find our target endpoints
    const shipmentsEndpoint = endpoints.find(ep =>
      ep.path === '/shipments' && ep.method === 'GET'
    );

    const statsEndpoint = endpoints.find(ep =>
      ep.path === '/dashboard/stats' && ep.method === 'GET'
    );

    console.log('Found endpoints:');
    if (shipmentsEndpoint) {
      console.log(`  ✓ GET /shipments (ID: ${shipmentsEndpoint.id})`);
    } else {
      console.log('  ✗ GET /shipments not found');
    }

    if (statsEndpoint) {
      console.log(`  ✓ GET /dashboard/stats (ID: ${statsEndpoint.id})`);
    } else {
      console.log('  ✗ GET /dashboard/stats not found');
    }

    // Step 2: Get current endpoint configurations
    console.log('\n🔍 Step 2: Fetching current endpoint configurations...\n');

    const endpointsToUpdate = [];

    if (shipmentsEndpoint) {
      const detailResponse = await fetch(
        `${XANO_BASE}/api:admin/workspaces/${WORKSPACE_ID}/api_groups/${API_GROUP_ID}/endpoints/${shipmentsEndpoint.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (detailResponse.ok) {
        const detail = await detailResponse.json();
        console.log('Current /shipments config:');
        console.log(`  - Auth required: ${detail.requires_authentication || 'unknown'}`);
        console.log(`  - XanoScript length: ${detail.script?.length || 0} chars`);
        endpointsToUpdate.push({ id: shipmentsEndpoint.id, name: '/shipments', detail });
      }
    }

    if (statsEndpoint) {
      const detailResponse = await fetch(
        `${XANO_BASE}/api:admin/workspaces/${WORKSPACE_ID}/api_groups/${API_GROUP_ID}/endpoints/${statsEndpoint.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (detailResponse.ok) {
        const detail = await detailResponse.json();
        console.log('\nCurrent /dashboard/stats config:');
        console.log(`  - Auth required: ${detail.requires_authentication || 'unknown'}`);
        console.log(`  - XanoScript length: ${detail.script?.length || 0} chars`);
        endpointsToUpdate.push({ id: statsEndpoint.id, name: '/dashboard/stats', detail });
      }
    }

    // Step 3: Update endpoints to remove auth
    console.log('\n📝 Step 3: Removing authentication requirement...\n');

    for (const endpoint of endpointsToUpdate) {
      console.log(`Updating ${endpoint.name}...`);

      // Remove "auth = user" from XanoScript if present
      let updatedScript = endpoint.detail.script || '';
      const hasAuthLine = updatedScript.includes('auth = "user"') || updatedScript.includes("auth = 'user'");

      if (hasAuthLine) {
        // Remove the auth line (handles both quote styles)
        updatedScript = updatedScript
          .replace(/auth\s*=\s*["']user["']\s*;?\s*/g, '')
          .replace(/^\s*[\r\n]/gm, ''); // Remove empty lines

        console.log(`  - Removed auth = "user" from XanoScript`);
      }

      // Update the endpoint
      const updatePayload = {
        ...endpoint.detail,
        script: updatedScript,
        requires_authentication: false,
        authentication_method: null
      };

      const updateResponse = await fetch(
        `${XANO_BASE}/api:admin/workspaces/${WORKSPACE_ID}/api_groups/${API_GROUP_ID}/endpoints/${endpoint.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        }
      );

      if (updateResponse.ok) {
        console.log(`  ✓ Successfully updated ${endpoint.name}`);
      } else {
        const errorText = await updateResponse.text();
        console.error(`  ✗ Failed to update ${endpoint.name}: ${updateResponse.status}`);
        console.error(`    Response: ${errorText}`);
      }
    }

    console.log('\n✅ Done! Both endpoints should now be publicly accessible.\n');
    console.log('Test the endpoints:');
    console.log(`  - ${XANO_BASE}/api:I5SJFe7I/shipments`);
    console.log(`  - ${XANO_BASE}/api:I5SJFe7I/dashboard/stats`);
    console.log('\nThey should now return data without requiring authentication.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify your API token has Management API access');
    console.log('2. Check that the token hasn\'t expired');
    console.log('3. Ensure workspace ID (1) and API group ID (75) are correct');
  }
}

removeAuthFromEndpoints();
