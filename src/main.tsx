import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary';
import { AxonProvider } from './context/AxonContext';
import { suppressExtensionErrors } from './utils/suppressExtensionErrors';

// Suppress errors from browser extensions
suppressExtensionErrors();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <AxonProvider>
      <App />
    </AxonProvider>
  </ErrorBoundary>
)
