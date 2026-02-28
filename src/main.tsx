/**
 * Evita "Cannot convert object to primitive value" quando a extensão React DevTools
 * intercepta console.error e tenta formatar objetos (ex.: erros de lazy load).
 * Serializamos todos os argumentos para string antes de repassar ao console nativo.
 */
(function patchConsoleError() {
  const original = console.error;
  function toSafeString(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      if (typeof value === 'object' && value !== null && 'message' in value && typeof (value as Error).message === 'string')
        return (value as Error).message;
      if (typeof value === 'object' && value !== null && 'stack' in value && typeof (value as Error).stack === 'string')
        return (value as Error).stack;
      return JSON.stringify(value);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  console.error = function (...args: unknown[]) {
    original.apply(console, args.map(a => (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') ? a : toSafeString(a)));
  };
})();

// CRITICAL: Register Chart.js components FIRST, before any other imports
// This prevents "linear is not a registered scale" errors with Vite code splitting
import {
  forceChartRegistration,
  verifyChartRegistration,
} from './components/charts/chartConfig';
forceChartRegistration();

// Verify registration succeeded
if (!verifyChartRegistration()) {
  console.error('[Main] Chart.js registration failed on initial load!');
  forceChartRegistration();
}

import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import PublicApp from './PublicApp.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Base path - deve corresponder ao configurado no vite.config.ts
const basePath = '/sistema'; // 👈 ALTERE AQUI se mudar no vite.config.ts

// Rotas como /sistema e /sistema/login devem carregar este app (servidor deve servir index.html para /sistema/*).
// Aqui só redirecionamos se a URL não for sob o base path.
const currentPath = window.location.pathname;
if (basePath && (currentPath === '/' || !currentPath.startsWith(basePath))) {
  // Se está na raiz ou não começando com /sistema, redirecionar para /sistema
  const newPath = currentPath === '/' ? basePath : `${basePath}${currentPath}`;
  window.location.href = `${window.location.origin}${newPath}${window.location.search}${window.location.hash}`;
} else {
  // Verificar se é rota pública (considerando base path)
  const publicUploadPath = basePath
    ? `${basePath}/public/upload-documents/`
    : '/public/upload-documents/';
  const publicSignaturePath = basePath ? `${basePath}/assinar/` : '/assinar/';
  const isPublicUploadRoute =
    window.location.pathname.startsWith(publicUploadPath);
  const isPublicSignatureRoute =
    window.location.pathname.startsWith(publicSignaturePath);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    isPublicUploadRoute || isPublicSignatureRoute ? (
      <ThemeProvider>
        <PublicApp />
      </ThemeProvider>
    ) : (
      <App />
    )
  );

}
