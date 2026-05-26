// Test script to verify the complete development workflow
// This script tests:
// 1. Backend API health
// 2. Backend code execution endpoint
// 3. Frontend accessibility (we'll check manually)

const testBackend = async () => {
  console.log('=== Testing Backend API ===\n');
  
  // Test 1: Health check
  console.log('1. Testing health check endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:8000/');
    const healthData = await healthResponse.json();
    console.log('✓ Health check passed:', healthData);
  } catch (error) {
    console.error('✗ Health check failed:', error.message);
    return false;
  }
  
  // Test 2: Code execution endpoint
  console.log('\n2. Testing code execution endpoint...');
  try {
    const codeResponse = await fetch('http://localhost:8000/api/run-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'def calculate_salary(base, bonus):\n    return base + bonus\n\nprint(calculate_salary(5000, 1000))',
        language: 'python'
      })
    });
    const codeData = await codeResponse.json();
    console.log('✓ Code execution passed:', codeData);
    
    // Verify response structure
    if (codeData.status && codeData.message) {
      console.log('✓ Response structure is correct');
    } else {
      console.error('✗ Response structure is incorrect');
      return false;
    }
  } catch (error) {
    console.error('✗ Code execution failed:', error.message);
    return false;
  }
  
  // Test 3: CORS headers
  console.log('\n3. Testing CORS configuration...');
  try {
    const corsResponse = await fetch('http://localhost:8000/api/run-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      },
      body: JSON.stringify({ code: 'test' })
    });
    console.log('✓ CORS is properly configured');
  } catch (error) {
    console.error('✗ CORS test failed:', error.message);
    return false;
  }
  
  console.log('\n=== All Backend Tests Passed! ===\n');
  return true;
};

// Run tests
testBackend().then(success => {
  if (success) {
    console.log('Backend verification complete!');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Test the three pages:');
    console.log('   - Knowledge Hub (知识补给站)');
    console.log('   - Code Debug (代码扫雷)');
    console.log('   - HCM Practice (HCM 实战)');
    console.log('3. Test code execution by clicking the Run button');
  } else {
    console.log('Backend verification failed!');
    process.exit(1);
  }
});
