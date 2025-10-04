#!/usr/bin/env node

/**
 * 🧪 eCommerce API Test Script
 * This script tests the basic functionality of your eCommerce API
 * to ensure everything is working correctly.
 */

const https = require('http');

const API_BASE_URL = 'http://localhost:3000';
let testResults = [];

// Test configuration
const tests = [
  {
    name: '🔍 Health Check',
    method: 'GET',
    path: '/health',
    expectedStatus: 200
  },
  {
    name: '🔐 User Login',
    method: 'POST',
    path: '/login',
    body: {
      email: 'john@example.com',
      password: 'password'
    },
    expectedStatus: 200,
    saveToken: true
  },
  {
    name: '📦 Get Products',
    method: 'GET',
    path: '/products',
    expectedStatus: 200
  },
  {
    name: '🏷️ Get Categories',
    method: 'GET',
    path: '/categories',
    expectedStatus: 200
  },
  {
    name: '🎯 Get Banners',
    method: 'GET',
    path: '/banners',
    expectedStatus: 200
  },
  {
    name: '👤 Get Profile',
    method: 'GET',
    path: '/profile',
    expectedStatus: 200,
    requiresAuth: true
  },
  {
    name: '✏️ Update Profile',
    method: 'PUT',
    path: '/profile',
    body: {
      name: 'John Updated',
      phone: '+1234567890'
    },
    expectedStatus: 200,
    requiresAuth: true
  }
];

let authToken = null;

console.log('🚀 Starting eCommerce API Tests...\n');

// Helper function to make HTTP requests
function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + test.path);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en'
      }
    };

    // Add authorization header if we have a token and it's required
    if (authToken && test.requiresAuth) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: response
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: { error: 'Invalid JSON response' }
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Send request body for POST requests
    if (test.body) {
      req.write(JSON.stringify(test.body));
    }

    req.end();
  });
}

// Run a single test
async function runTest(test) {
  try {
    const result = await makeRequest(test);
    
    const success = result.statusCode === 200 && result.data.status_code === test.expectedStatus;
    
    if (success) {
      console.log(`✅ ${test.name}: PASSED`);
      
      // Save auth token if this is a login test
      if (test.saveToken && result.data.data && result.data.data.token) {
        authToken = result.data.data.token;
        console.log(`   🔑 Token saved for authenticated requests`);
      }
    } else {
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Expected: HTTP 200 with status_code ${test.expectedStatus}`);
      console.log(`   Got: HTTP ${result.statusCode} with status_code ${result.data.status_code || 'N/A'}`);
      if (result.data.message) {
        console.log(`   Message: ${result.data.message}`);
      }
    }
    
    testResults.push({
      name: test.name,
      success,
      statusCode: result.statusCode,
      responseStatus: result.data.status_code,
      message: result.data.message
    });
    
  } catch (error) {
    console.log(`❌ ${test.name}: ERROR`);
    console.log(`   Error: ${error.message}`);
    
    testResults.push({
      name: test.name,
      success: false,
      error: error.message
    });
  }
}

// Run all tests sequentially
async function runAllTests() {
  for (const test of tests) {
    await runTest(test);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passed = testResults.filter(t => t.success).length;
  const total = testResults.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your eCommerce API is working correctly.');
    console.log('\n📋 What you can do now:');
    console.log('• Import the Postman collection from ecommerce-api.postman_collection.json');
    console.log('• Start building your client application');
    console.log('• Test with different languages using Accept-Language header');
  } else {
    console.log('\n⚠️  Some tests failed. Please check:');
    console.log('• Is the server running on port 3000?');
    console.log('• Did you run "npm install" first?');
    console.log('• Check for any error messages above');
  }
  
  console.log('\n🌐 Server: http://localhost:3000');
  console.log('📚 API Docs: See README.md for complete documentation');
}

// Check if server is accessible first
console.log('🔍 Checking if server is running...');
makeRequest({ method: 'GET', path: '/health' })
  .then(() => {
    console.log('✅ Server is accessible\n');
    runAllTests();
  })
  .catch((error) => {
    console.log('❌ Cannot connect to server!');
    console.log(`Error: ${error.message}\n`);
    console.log('💡 Make sure to start the server first:');
    console.log('   node server.js\n');
    console.log('🌐 Server should be running on: http://localhost:3000');
    process.exit(1);
  }); 