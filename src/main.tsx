import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary';
import { AxonProvider } from './context/AxonContext';
import { suppressExtensionErrors } from './utils/suppressExtensionErrors';
import { setOnchainKitConfig } from '@coinbase/onchainkit';

// Initialize OnchainKit globally
setOnchainKitConfig({
    apiKey: import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY,
});

// Debug environment variables in development
if (import.meta.env.DEV) {
    import('./debug/envTest').then(() => {
        console.log('🔍 Environment debug module loaded');
    }).catch(err => {
        console.error('Failed to load env debug:', err);
    });
}


// Suppress errors from browser extensions
suppressExtensionErrors();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <AxonProvider>
      <App />
    </AxonProvider>
  </ErrorBoundary>
)
