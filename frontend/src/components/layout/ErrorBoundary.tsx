import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Captura errores de renderizado de React para evitar la pantalla en blanco.
 * Muestra una UI de recuperación en lugar de tumbar toda la aplicación.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // En producción aquí se enviaría a un servicio de monitoreo (Sentry, etc.).
    console.error('Error no controlado en la UI:', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Algo salió mal</h1>
        <p className="max-w-md text-gray-600">
          Ocurrió un error inesperado. Intenta recargar la página; si el problema persiste, vuelve
          más tarde.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }
}
