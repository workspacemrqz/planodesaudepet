import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center z-50">
          <div className="text-center text-white max-w-md mx-auto px-6">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold mb-4">Erro na aplicação</h1>
            <p className="text-lg mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-[#E1AC33] text-[#1a5a5c] px-6 py-3 rounded-lg font-semibold hover:bg-[#d4a02b] transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-transparent border-2 border-[#E1AC33] text-[#E1AC33] px-6 py-3 rounded-lg font-semibold hover:bg-[#E1AC33] hover:text-[#1a5a5c] transition-colors"
              >
                Recarregar Página
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-[#E1AC33] font-semibold">
                  Detalhes do erro (dev)
                </summary>
                <pre className="mt-2 text-sm bg-black/20 p-3 rounded overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
