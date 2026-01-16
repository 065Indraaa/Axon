import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ScanPage from './pages/ScanPage';
import Staking from './pages/Staking';
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

  const showOnboarding = isOnboardingActive || (isConnected && !onboardingComplete);

  return (
    <BrowserRouter>
      <Routes>
        {onboardingComplete && isConnected ? (
          <>
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route
              path="/snap/:id"
              element={
                <ErrorBoundary>
                  <ReceiveSnap />
                </ErrorBoundary>
              }
            />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/create-snap" element={<CreateSnap />} />
              <Route path="/staking" element={<Staking />} />
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
          chain={base}
          config={{
            appearance: {
              name: 'AXON',
              // logo: 'https://axon.finance/logo.png', // Placeholder
              mode: 'light',
              theme: 'light',
            },
            wallet: {
              display: 'modal',
              termsUrl: 'https://.../terms',
              privacyUrl: 'https://.../privacy'
            }
          }}
        >
          <AppContent />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}