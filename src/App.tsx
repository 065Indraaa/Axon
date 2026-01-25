import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ScanPage from './pages/ScanPage';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import OAuthCallback from './pages/OAuthCallback';
import CreateSnap from './pages/CreateSnap';
import ReceiveSnap from './pages/ReceiveSnap';
import OnboardingFlow from './pages/OnboardingFlow';
import { useAxon } from './context/AxonContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Web3 Config Imports
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount } from 'wagmi';
import { base } from 'wagmi/chains';
import { config } from './wagmi';

const queryClient = new QueryClient();

function AppContent() {
  const { isConnected } = useAccount();
  const { onboardingComplete, isOnboardingActive } = useAxon();

  // Stricter logic: Only show onboarding if explicitly active.
  // Even if connected, if not onboarded (session), show Landing Logic first or let them click Login.
  const showOnboarding = isOnboardingActive;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/snap/:id"
          element={
            <ErrorBoundary>
              <ReceiveSnap />
            </ErrorBoundary>
          }
        />
        {onboardingComplete && isConnected ? (
          <>
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/create-snap" element={<CreateSnap />} />

              <Route path="/account" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </>
        ) : showOnboarding ? (
          <Route path="*" element={<OnboardingFlow />} />
        ) : (
          <Route path="*" element={<LandingPage />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
          projectId={import.meta.env.VITE_CDP_PROJECT_ID}
          chain={base}
          config={{
            paymaster: import.meta.env.VITE_PAYMASTER_URL,
            appearance: {
              name: 'AXON',
              mode: 'light',
              theme: 'light',
            },
            wallet: {
              display: 'modal',
              termsUrl: 'https://axon.finance/terms',
              privacyUrl: 'https://axon.finance/privacy'
            },
          }}
        >
          <AppContent />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}