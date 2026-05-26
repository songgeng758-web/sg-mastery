import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import KnowledgeHub from './components/pages/KnowledgeHub';
import CodeDebug from './components/pages/CodeDebug';
import HCMPractice from './components/pages/HCMPractice';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/knowledge" element={<KnowledgeHub />} />
            <Route path="/debug" element={<CodeDebug />} />
            <Route path="/practice" element={<HCMPractice />} />
            <Route path="/" element={<Navigate to="/knowledge" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
