import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import KnowledgeHub from './components/pages/KnowledgeHub';
import BugHunt from './components/pages/BugHunt';
import HcmPractice from './components/pages/HcmPractice';
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
            <Route path="/bug-hunt" element={<BugHunt />} />
            <Route path="/hcm-practice" element={<HcmPractice />} />
            <Route path="/" element={<Navigate to="/knowledge" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
