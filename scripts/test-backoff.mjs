import { fetchWithRetry } from '../src/lib/api-utils.js';

async function test() {
  console.log("Starting backoff test...");
  
  // Test with a non-existent URL to see if it retries on network error
  try {
    console.log("\n--- Test 1: Network Error (Should retry 3 times) ---");
    await fetchWithRetry('https://this-domain-does-not-exist-12345.com', { method: 'GET' }, 3, 500);
  } catch (e) {
    console.log("Test 1 Finished (Expected failure after retries)");
  }

  // Test with a 404 URL (Should NOT retry by default unless we add 404 to retry list)
  try {
    console.log("\n--- Test 2: 404 Error (Should NOT retry) ---");
    const res = await fetchWithRetry('https://google.com/404-test-retry', { method: 'GET' }, 3, 500);
    console.log("Test 2 Status:", res.status);
  } catch (e) {
    console.log("Test 2 Error:", e.message);
  }

  console.log("\nTest script finished.");
}

test();
