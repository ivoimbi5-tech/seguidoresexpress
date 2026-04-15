import * as React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      
      try {
        // Check if it's a Firestore JSON error
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error) {
          errorMessage = `Erro de Permissão: Você não tem autorização para realizar esta operação (${parsed.operationType}).`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-3xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Ops! Algo deu errado</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
