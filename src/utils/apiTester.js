// API testing utility for debugging connectivity issues
import { getConfig } from '../config/environment';

export const testApiConnectivity = async () => {
  const config = getConfig();
  const results = {
    timestamp: new Date().toISOString(),
    config: config,
    tests: {}
  };

  console.log('=== API Connectivity Test ===');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API Base URL:', config.API_BASE_URL);
  console.log('Cookie Domain:', config.COOKIE_DOMAIN);

  // Test 1: Basic connectivity with fetch
  try {
    console.log('\n--- Test 1: Basic Fetch Connectivity ---');
    const startTime = Date.now();
    const response = await fetch(`${config.API_BASE_URL}/v2/auth/login`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const endTime = Date.now();
    
    results.tests.basicFetch = {
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseTime: endTime - startTime,
      headers: Object.fromEntries(response.headers.entries())
    };
    
    console.log('✅ Basic fetch successful:', results.tests.basicFetch);
  } catch (error) {
    results.tests.basicFetch = {
      success: false,
      error: error.message,
      type: error.name
    };
    console.error('❌ Basic fetch failed:', error.message);
  }

  // Test 2: CORS preflight test
  try {
    console.log('\n--- Test 2: CORS Preflight Test ---');
    const startTime = Date.now();
    const response = await fetch(`${config.API_BASE_URL}/v2/auth/login`, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    const endTime = Date.now();
    
    results.tests.corsPreflight = {
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseTime: endTime - startTime,
      headers: Object.fromEntries(response.headers.entries())
    };
    
    console.log('✅ CORS preflight successful:', results.tests.corsPreflight);
  } catch (error) {
    results.tests.corsPreflight = {
      success: false,
      error: error.message,
      type: error.name
    };
    console.error('❌ CORS preflight failed:', error.message);
  }

  // Test 3: Network reachability
  try {
    console.log('\n--- Test 3: Network Reachability ---');
    const url = new URL(config.API_BASE_URL);
    const hostname = url.hostname;
    
    // Try to ping the hostname (this is a basic test)
    const startTime = Date.now();
    const img = new Image();
    img.src = `${url.protocol}//${hostname}/favicon.ico?t=${Date.now()}`;
    
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Host not reachable'));
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
    
    const endTime = Date.now();
    results.tests.networkReachability = {
      success: true,
      hostname: hostname,
      responseTime: endTime - startTime
    };
    
    console.log('✅ Network reachability test successful:', results.tests.networkReachability);
  } catch (error) {
    results.tests.networkReachability = {
      success: false,
      error: error.message,
      type: error.name
    };
    console.error('❌ Network reachability test failed:', error.message);
  }

  // Test 4: DNS resolution
  try {
    console.log('\n--- Test 4: DNS Resolution ---');
    const url = new URL(config.API_BASE_URL);
    const hostname = url.hostname;
    
    // This is a basic DNS test using fetch
    const startTime = Date.now();
    const response = await fetch(`${url.protocol}//${hostname}/`, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    const endTime = Date.now();
    
    results.tests.dnsResolution = {
      success: true,
      hostname: hostname,
      responseTime: endTime - startTime
    };
    
    console.log('✅ DNS resolution test successful:', results.tests.dnsResolution);
  } catch (error) {
    results.tests.dnsResolution = {
      success: false,
      error: error.message,
      type: error.name
    };
    console.error('❌ DNS resolution test failed:', error.message);
  }

  console.log('\n=== Test Results Summary ===');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
};

export const testSpecificEndpoint = async (endpoint = '/v2/auth/login') => {
  const config = getConfig();
  const fullUrl = `${config.API_BASE_URL}${endpoint}`;
  
  console.log(`\n--- Testing Specific Endpoint: ${endpoint} ---`);
  console.log('Full URL:', fullUrl);
  
  try {
    const startTime = Date.now();
    const response = await fetch(fullUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const endTime = Date.now();
    
    const result = {
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseTime: endTime - startTime,
      headers: Object.fromEntries(response.headers.entries()),
      url: fullUrl
    };
    
    console.log('✅ Endpoint test successful:', result);
    return result;
  } catch (error) {
    const result = {
      success: false,
      error: error.message,
      type: error.name,
      url: fullUrl
    };
    
    console.error('❌ Endpoint test failed:', result);
    return result;
  }
};
