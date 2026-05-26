# Manual Verification Checklist
## Task 12.4: 验证完整的开发流程

This checklist covers manual verification steps for the complete development workflow.

## ✅ Automated Tests (Completed)

- [x] Backend health check (GET /)
- [x] Backend API endpoint (POST /api/run-code)
- [x] CORS configuration
- [x] Frontend pages accessibility
- [x] Frontend-backend integration
- [x] Requirements 1.5, 1.6, 12.5, 12.6

## Manual UI Testing Checklist

### 1. Installation and Startup (从零开始按照 README 安装和启动项目)

#### Backend Setup
- [ ] Navigate to `backend/` directory
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate virtual environment
  - Windows: `venv\Scripts\activate`
  - macOS/Linux: `source venv/bin/activate`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Start backend: `python start.py`
- [ ] Verify backend running at http://localhost:8000
- [ ] Check API docs at http://localhost:8000/docs

#### Frontend Setup
- [ ] Open new terminal
- [ ] Navigate to `frontend/` directory
- [ ] Install dependencies: `npm install`
- [ ] Start frontend: `npm run dev`
- [ ] Verify frontend running at http://localhost:5173
- [ ] Open browser to http://localhost:5173

### 2. Test All Three Pages (测试所有三个页面功能)

#### Page 1: Knowledge Hub (知识补给站)
- [ ] Navigate to Knowledge Hub (first tab or /knowledge route)
- [ ] Verify "今日精进推送" title is displayed
- [ ] Verify at least 3 learning cards are displayed
- [ ] Each card should have:
  - [ ] Title
  - [ ] Tags (e.g., "前后端", "硬件", "数据库")
  - [ ] "展开阅读" button
- [ ] Verify cards have rounded corners and semi-transparent background
- [ ] Verify dark theme styling

#### Page 2: Code Debug (代码扫雷)
- [ ] Click on Code Debug tab (middle tab)
- [ ] Verify page switches to Code Debug
- [ ] Verify level progress is displayed (e.g., "第 3/10 关")
- [ ] Verify code editor is present
- [ ] Verify pre-filled Python code is displayed
- [ ] Verify hint text is displayed below editor
- [ ] Verify "运行" (Run) button is present
- [ ] Verify dark theme for code editor

#### Page 3: HCM Practice (HCM 实战)
- [ ] Click on HCM Practice tab (right tab)
- [ ] Verify page switches to HCM Practice
- [ ] Verify business scenario description is displayed
- [ ] Verify employee data table is displayed with columns:
  - [ ] 员工ID (Employee ID)
  - [ ] 姓名 (Name)
  - [ ] 职位 (Position)
  - [ ] 生效日期 (Effective Date)
  - [ ] 失效日期 (Expiration Date)
- [ ] Verify SQL code editor is present
- [ ] Verify "code.sql" filename is displayed
- [ ] Verify "运行并检验" button is present (purple gradient)

### 3. Test Code Execution Functionality (测试代码执行功能)

#### Test in Code Debug Page
- [ ] Navigate to Code Debug page
- [ ] Clear existing code in editor
- [ ] Type new Python code: `print("Hello, SGMastery!")`
- [ ] Click "运行" button
- [ ] Verify button shows loading state during execution
- [ ] Verify execution result is displayed
- [ ] Verify result shows success message
- [ ] Test with empty code:
  - [ ] Clear all code
  - [ ] Click "运行"
  - [ ] Verify appropriate error message is shown

#### Test in HCM Practice Page
- [ ] Navigate to HCM Practice page
- [ ] Clear existing SQL code
- [ ] Type new SQL: `SELECT * FROM employees WHERE id = 'E001';`
- [ ] Click "运行并检验" button
- [ ] Verify button shows loading state
- [ ] Verify execution result is displayed
- [ ] Verify result shows success message

### 4. Test Frontend-Backend Communication (确保前后端通信正常)

- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Navigate to Code Debug page
- [ ] Enter code and click "运行"
- [ ] Verify in Network tab:
  - [ ] POST request to http://localhost:8000/api/run-code
  - [ ] Request payload contains code
  - [ ] Response status is 200
  - [ ] Response contains `status` and `message` fields
  - [ ] CORS headers are present
- [ ] Check Console tab for any errors
  - [ ] No CORS errors
  - [ ] No JavaScript errors

### 5. Test Navigation Bar (底部导航栏)

- [ ] Verify navigation bar is fixed at bottom of page
- [ ] Verify navigation bar has glass morphism effect (backdrop blur)
- [ ] Verify three tabs are present with icons:
  - [ ] Knowledge Hub (BookOpen icon)
  - [ ] Code Debug (Bug icon)
  - [ ] HCM Practice (Database icon)
- [ ] Click each tab and verify:
  - [ ] Active tab is highlighted
  - [ ] Page content changes
  - [ ] URL updates
- [ ] Verify navigation bar is visible on all pages

### 6. Test Responsive Layout (响应式布局)

- [ ] Resize browser window to mobile size (< 768px width)
- [ ] Verify layout adjusts for small screen
- [ ] Verify navigation bar remains usable
- [ ] Verify code editor remains editable
- [ ] Verify data table is scrollable or responsive
- [ ] Test on different screen sizes:
  - [ ] Mobile (375px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1024px+)

### 7. Test UI Visual Design (UI 视觉设计)

- [ ] Verify dark theme throughout application
- [ ] Verify deep blue/black background colors
- [ ] Verify buttons have blue/purple gradient
- [ ] Verify cards have rounded corners
- [ ] Verify cards have semi-transparent backgrounds
- [ ] Verify navigation bar has glass morphism effect
- [ ] Verify text is readable (light color on dark background)
- [ ] Verify code editor has dark theme

### 8. Test Error Handling

- [ ] Stop backend server
- [ ] Try to run code in frontend
- [ ] Verify error message is displayed
- [ ] Verify error message is user-friendly
- [ ] Restart backend server
- [ ] Verify functionality resumes

## Summary

### Automated Test Results
✅ All automated tests passed:
- Backend health check
- API endpoint functionality
- CORS configuration
- Frontend pages accessibility
- Frontend-backend integration

### Manual Testing Status
- [ ] Installation and startup verified
- [ ] All three pages tested
- [ ] Code execution functionality tested
- [ ] Frontend-backend communication verified
- [ ] Navigation bar tested
- [ ] Responsive layout tested
- [ ] UI visual design verified
- [ ] Error handling tested

## Notes

Record any issues or observations here:

---

## Completion Criteria

Task 12.4 is complete when:
1. ✅ Backend can be started from README instructions
2. ✅ Frontend can be started from README instructions
3. ✅ All three pages are accessible and functional
4. ✅ Code execution works in both Code Debug and HCM Practice
5. ✅ Frontend-backend communication is working correctly
6. ✅ No critical errors in browser console
7. ✅ Requirements 1.5, 1.6, 12.5, 12.6 are satisfied
