/**
 * Script to find Xano endpoint IDs in API Group 75 (Dashboard)
 *
 * Usage: node scripts/find-xano-endpoints.js
 *
 * You'll need to set your Xano API token as an environment variable:
 * set XANO_API_TOKEN=your_token_here
 */

const XANO_BASE = 'https://xjlt-4ifj-k7qu.n7e.xano.io';
const WORKSPACE_ID = 1;
const API_GROUP_ID = 75; // Dashboard API Group

async function findEndpoints() {
  const token = process.env.XANO_API_TOKEN;

  if (!token) {
    console.error('Error: XANO_API_TOKEN environment variable not set');
    console.log('\nTo get your token:');
    console.log('1. Go to your Xano dashboard');
    console.log('2. Click your profile → Account Settings → API Tokens');
    console.log('3. Create a token with Management API access');
    console.log('4. Run: set XANO_API_TOKEN=your_token_here');
    process.exit(1);
  }

  try {
    console.log(`\nSearching for endpoints in API Group ${API_GROUP_ID}...\n`);

    // Fetch all endpoints in the API group
    const response = await fetch(
      `${XANO_BASE}/api:admin/workspaces/${WORKSPACE_ID}/api_groups/${API_GROUP_ID}/endpoints`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const endpoints = await response.json();

    // Filter for the endpoints we need
    const shipments = endpoints.find(ep => ep.path === '/shipments' || ep.path.includes('shipments'));
    const stats = endpoints.find(ep => ep.path === '/dashboard/stats' || ep.path.includes('stats'));

    console.log('Found endpoints:\n');

    if (shipments) {
      console.log('✓ /shipments endpoint:');
      console.log(`  - ID: ${shipments.id}`);
      console.log(`  - Path: ${shipments.path}`);
      console.log(`  - Method: ${shipments.method}`);
      console.log(`  - Full URL: ${XANO_BASE}/api:I5SJFe7I${shipments.path}\n`);
    } else {
      console.log('✗ /shipments endpoint not found\n');
    }

    if (stats) {
      console.log('✓ /dashboard/stats endpoint:');
      console.log(`  - ID: ${stats.id}`);
      console.log(`  - Path: ${stats.path}`);
      console.log(`  - Method: ${stats.method}`);
      console.log(`  - Full URL: ${XANO_BASE}/api:I5SJFe7I${stats.path}\n`);
    } else {
      console.log('✗ /dashboard/stats endpoint not found\n');
    }

    // Show all endpoints for reference
    console.log('\nAll endpoints in Dashboard API Group (75):');
    console.log('='.repeat(60));
    endpoints.forEach(ep => {
      console.log(`- [${ep.method}] ${ep.path} (ID: ${ep.id})`);
    });

  } catch (error) {
    console.error('Error fetching endpoints:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify your API token has Management API access');
    console.log('2. Check that workspace ID and API group ID are correct');
    console.log('3. Ensure your token hasn\'t expired');
  }
}

findEndpoints();
