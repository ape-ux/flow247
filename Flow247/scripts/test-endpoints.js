/**
 * Script to test Xano endpoints (with or without auth)
 *
 * Tests the following endpoints:
 * - GET /shipments
 * - GET /dashboard/stats
 *
 * Usage: node scripts/test-endpoints.js
 */

const XANO_BASE = 'https://xjlt-4ifj-k7qu.n7e.xano.io';
const DASHBOARD_API = `${XANO_BASE}/api:I5SJFe7I`;

async function testEndpoint(name, url, withAuth = false) {
  const token = process.env.XANO_TOKEN || null;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (withAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Auth: ${withAuth ? (token ? 'Yes (Bearer token)' : 'Yes (but no token provided)') : 'No'}`);

    const response = await fetch(url, { headers });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✓ Success!`);

      if (Array.isArray(data)) {
        console.log(`   Response: Array with ${data.length} items`);
        if (data.length > 0) {
          console.log(`   First item keys: ${Object.keys(data[0]).join(', ')}`);
        }
      } else if (typeof data === 'object') {
        console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
      } else {
        console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}`);
      }

      return { success: true, status: response.status, data };
    } else {
      const errorText = await response.text();
      console.log(`   ✗ Failed`);
      console.log(`   Error: ${errorText.substring(0, 200)}`);

      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.log(`   ✗ Network Error`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Xano Endpoint Test Suite');
  console.log('═══════════════════════════════════════════════════════');

  const results = [];

  // Test without auth (expected to work after removing auth requirement)
  console.log('\n📋 Testing endpoints WITHOUT authentication:');
  results.push(await testEndpoint(
    'GET /shipments (no auth)',
    `${DASHBOARD_API}/shipments`,
    false
  ));

  results.push(await testEndpoint(
    'GET /dashboard/stats (no auth)',
    `${DASHBOARD_API}/dashboard/stats`,
    false
  ));

  // Test with auth if token is provided
  const token = process.env.XANO_TOKEN;
  if (token) {
    console.log('\n🔐 Testing endpoints WITH authentication:');
    results.push(await testEndpoint(
      'GET /shipments (with auth)',
      `${DASHBOARD_API}/shipments`,
      true
    ));

    results.push(await testEndpoint(
      'GET /dashboard/stats (with auth)',
      `${DASHBOARD_API}/dashboard/stats`,
      true
    ));
  }

  // Test other working endpoints for comparison
  console.log('\n🔍 Testing comparison endpoints (should work):');
  results.push(await testEndpoint(
    'GET /cfs_monitor',
    `${DASHBOARD_API}/cfs_monitor`,
    false
  ));

  results.push(await testEndpoint(
    'GET /cfs/tasks',
    `${DASHBOARD_API}/cfs/tasks`,
    false
  ));

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`\n✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);

  // Check if the target endpoints are accessible without auth
  const shipmentsNoAuth = results.find(r => r.status !== undefined && r.success && r.data);
  const statsNoAuth = results.find(r => r.status !== undefined && r.success && r.data);

  if (successCount === results.length) {
    console.log('\n🎉 All tests passed! Endpoints are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');

    if (results.some(r => r.status === 401)) {
      console.log('\n💡 Tip: 401 Unauthorized errors mean the endpoint still requires authentication.');
      console.log('   Run: node scripts/remove-endpoint-auth.js');
      console.log('   Or manually remove auth in Xano UI (see docs/REMOVE_ENDPOINT_AUTH.md)');
    }
  }

  console.log('\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite error:', error.message);
  process.exit(1);
});
