/**
 * 路由验证脚本
 * 
 * 此脚本验证前端路由是否正确配置
 * 通过检查 App.tsx 的路由配置来确认所有页面都已集成
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 App.tsx 文件
const appTsxPath = join(__dirname, 'src', 'App.tsx');
const appTsxContent = readFileSync(appTsxPath, 'utf-8');

console.log('🔍 验证 App.tsx 路由配置...\n');

// 检查必需的导入
const requiredImports = [
  { name: 'KnowledgeHub', pattern: /import\s+KnowledgeHub\s+from\s+['"]\.\/components\/pages\/KnowledgeHub['"]/ },
  { name: 'CodeDebug', pattern: /import\s+CodeDebug\s+from\s+['"]\.\/components\/pages\/CodeDebug['"]/ },
  { name: 'HCMPractice', pattern: /import\s+HCMPractice\s+from\s+['"]\.\/components\/pages\/HCMPractice['"]/ },
  { name: 'Layout', pattern: /import\s+Layout\s+from\s+['"]\.\/components\/layout\/Layout['"]/ },
  { name: 'BrowserRouter', pattern: /import\s+\{[^}]*BrowserRouter[^}]*\}\s+from\s+['"]react-router-dom['"]/ },
  { name: 'Routes', pattern: /import\s+\{[^}]*Routes[^}]*\}\s+from\s+['"]react-router-dom['"]/ },
  { name: 'Route', pattern: /import\s+\{[^}]*Route[^}]*\}\s+from\s+['"]react-router-dom['"]/ },
  { name: 'Navigate', pattern: /import\s+\{[^}]*Navigate[^}]*\}\s+from\s+['"]react-router-dom['"]/ },
];

console.log('✅ 检查导入语句:');
let allImportsValid = true;
requiredImports.forEach(({ name, pattern }) => {
  const found = pattern.test(appTsxContent);
  console.log(`  ${found ? '✅' : '❌'} ${name}`);
  if (!found) allImportsValid = false;
});

// 检查路由配置
const requiredRoutes = [
  { path: '/knowledge', component: 'KnowledgeHub', pattern: /<Route\s+path=["']\/knowledge["']\s+element=\{<KnowledgeHub\s*\/>\}/ },
  { path: '/debug', component: 'CodeDebug', pattern: /<Route\s+path=["']\/debug["']\s+element=\{<CodeDebug\s*\/>\}/ },
  { path: '/practice', component: 'HCMPractice', pattern: /<Route\s+path=["']\/practice["']\s+element=\{<HCMPractice\s*\/>\}/ },
  { path: '/', component: 'Navigate', pattern: /<Route\s+path=["']\/["']\s+element=\{<Navigate\s+to=["']\/knowledge["']/ },
];

console.log('\n✅ 检查路由配置:');
let allRoutesValid = true;
requiredRoutes.forEach(({ path, component, pattern }) => {
  const found = pattern.test(appTsxContent);
  console.log(`  ${found ? '✅' : '❌'} ${path} → ${component}`);
  if (!found) allRoutesValid = false;
});

// 检查 Layout 包裹
console.log('\n✅ 检查 Layout 包裹:');
const hasLayoutWrapper = /<Layout>[\s\S]*<Routes>[\s\S]*<\/Routes>[\s\S]*<\/Layout>/.test(appTsxContent);
console.log(`  ${hasLayoutWrapper ? '✅' : '❌'} Layout 组件包裹 Routes`);

// 检查 BrowserRouter 包裹
const hasBrowserRouter = /<BrowserRouter>[\s\S]*<\/BrowserRouter>/.test(appTsxContent);
console.log(`  ${hasBrowserRouter ? '✅' : '❌'} BrowserRouter 包裹应用`);

// 总结
console.log('\n' + '='.repeat(50));
if (allImportsValid && allRoutesValid && hasLayoutWrapper && hasBrowserRouter) {
  console.log('✅ 所有检查通过！路由配置正确。');
  console.log('\n📋 配置摘要:');
  console.log('  - 3 个页面组件已导入');
  console.log('  - 3 个主要路由已配置');
  console.log('  - 1 个默认路由重定向已配置');
  console.log('  - Layout 组件正确包裹');
  console.log('  - BrowserRouter 正确配置');
  console.log('\n🎉 任务 10.1 完成：在 App.tsx 中集成所有页面');
  process.exit(0);
} else {
  console.log('❌ 检查失败！请修复上述问题。');
  process.exit(1);
}
