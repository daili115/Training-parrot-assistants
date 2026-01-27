
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 添加应用加载状态
const AppLoader = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
    <LoadingSpinner size="lg" text="正在启动鹦鹉学舌助手..." fullScreen />
  </div>
);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={<AppLoader />}>
      <ThemeProvider>
        <React.Suspense fallback={<AppLoader />}>
          <App />
        </React.Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
