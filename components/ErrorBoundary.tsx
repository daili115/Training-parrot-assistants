import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 max-w-lg w-full shadow-lg border border-red-100 dark:border-red-900/30">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-[30px] flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                  哎呀，出错了！
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                  应用程序遇到了问题，无法继续运行。
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl w-full">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {this.state.error?.name || '未知错误'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                      {this.state.error?.message || '发生了未知的错误'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  重试
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white py-3 rounded-2xl font-bold transition-all"
                >
                  刷新页面
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                如果问题持续存在，请清除浏览器缓存或联系支持。
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;