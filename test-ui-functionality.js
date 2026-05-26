/**
 * UI Functionality Test
 * Tests the actual rendered UI components and interactions
 */

const http = require('http');

const FRONTEND_URL = 'http://localhost:5173';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get(`${FRONTEND_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function testPageContent() {
  log('\n=== Testing Page Content ===', 'cyan');
  
  const tests = [
    {
      name: 'Knowledge Hub',
      path: '/knowledge',
      checks: [
        { pattern: /今日精进推送|Knowledge|知识/, desc: 'Page title or heading' },
        { pattern: /展开阅读|Read More/, desc: 'Expand button text' },
        { pattern: /前后端|硬件|数据库/, desc: 'Tag content' }
      ]
    },
    {
      name: 'Code Debug',
      path: '/debug',
      checks: [
        { pattern: /第.*关|Level|关卡/, desc: 'Level progress indicator' },
        { pattern: /运行|Run/, desc: 'Run button' },
        { pattern: /def |function|代码/, desc: 'Code content' }
      ]
    },
    {
      name: 'HCM Practice',
      path: '/practice',
      checks: [
        { pattern: /员工|Employee|HCM/, desc: 'Employee/HCM content' },
        { pattern: /运行并检验|Run/, desc: 'Run button' },
        { pattern: /SELECT|sql|SQL/, desc: 'SQL code' },
        { pattern: /生效日期|Effective/, desc: 'Table column headers' }
      ]
    }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    log(`\nTesting ${test.name} (${test.path})`, 'blue');
    
    try {
      const response = await fetchPage(test.path);
      
      if (response.statusCode !== 200) {
        log(`  ✗ Page returned status ${response.statusCode}`, 'red');
        allPassed = false;
        continue;
      }
      
      let pagePassed = true;
      for (const check of test.checks) {
        if (check.pattern.test(response.body)) {
          log(`  ✓ ${check.desc} found`, 'green');
        } else {
          log(`  ✗ ${check.desc} not found`, 'red');
          pagePassed = false;
          allPassed = false;
        }
      }
      
      if (pagePassed) {
        log(`  ✓ ${test.name} page content verified`, 'green');
      }
      
    } catch (error) {
      log(`  ✗ Error: ${error.message}`, 'red');
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testNavigationStructure() {
  log('\n=== Testing Navigation Structure ===', 'cyan');
  
  try {
    const response = await fetchPage('/');
    
    const checks = [
      { pattern: /知识补给站|Knowledge/, desc: 'Knowledge Hub nav item' },
      { pattern: /代码扫雷|Code.*Debug|Bug/, desc: 'Code Debug nav item' },
      { pattern: /HCM.*实战|Practice/, desc: 'HCM Practice nav item' }
    ];
    
    let allFound = true;
    for (const check of checks) {
      if (check.pattern.test(response.body)) {
        log(`✓ ${check.desc} found in navigation`, 'green');
      } else {
        log(`✗ ${check.desc} not found`, 'red');
        allFound = false;
      }
    }
    
    return allFound;
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return false;
  }
}

async function testDarkTheme() {
  log('\n=== Testing Dark Theme ===', 'cyan');
  
  try {
    const response = await fetchPage('/');
    
    // Check for dark theme indicators in the HTML
    const darkThemePatterns = [
      /bg-gray-900|bg-slate-900|bg-black|dark/i,
      /text-white|text-gray/i
    ];
    
    let themeFound = false;
    for (const pattern of darkThemePatterns) {
      if (pattern.test(response.body)) {
        themeFound = true;
        break;
      }
    }
    
    if (themeFound) {
      log('✓ Dark theme styling detected', 'green');
      return true;
    } else {
      log('✗ Dark theme styling not clearly detected', 'red');
      return false;
    }
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return false;
  }
}

async function runUITests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('UI Functionality Tests', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const results = {
    pageContent: false,
    navigation: false,
    darkTheme: false
  };
  
  results.pageContent = await testPageContent();
  results.navigation = await testNavigationStructure();
  results.darkTheme = await testDarkTheme();
  
  log('\n' + '='.repeat(60), 'cyan');
  log('UI Test Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const tests = [
    { name: 'Page Content Verification', passed: results.pageContent },
    { name: 'Navigation Structure', passed: results.navigation },
    { name: 'Dark Theme Styling', passed: results.darkTheme }
  ];
  
  let allPassed = true;
  for (const test of tests) {
    const status = test.passed ? '✓ PASS' : '✗ FAIL';
    const color = test.passed ? 'green' : 'red';
    log(`${status}: ${test.name}`, color);
    if (!test.passed) allPassed = false;
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  if (allPassed) {
    log('✓ ALL UI TESTS PASSED', 'green');
  } else {
    log('✗ SOME UI TESTS FAILED', 'red');
  }
  log('='.repeat(60), 'cyan');
  
  return allPassed;
}

runUITests().then(passed => {
  process.exit(passed ? 0 : 1);
}).catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
