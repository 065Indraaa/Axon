import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, ArrowRight, Loader2, ShieldCheck, Info, AlertCircle, Settings } from 'lucide-react';
import { useConnect, useAccount } from 'wagmi';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { signInWithBase, isPasskeyAvailable, generateAuthNonce } from '../../utils/baseAccount';
import { validateCDPEnvironment } from '../../utils/cdpConfig';

interface BaseAccountSignInProps {
  onSuccess?: (address: string) => void;
  onError?: (error: string) => void;
}

export function BaseAccountSignIn({ onSuccess, onError }: BaseAccountSignInProps) {
  const { connectors, isPending } = useConnect();
  const { isConnected } = useAccount();
  const [passkeySupported, setPasskeySupported] = useState<boolean | null>(null);
  const [envStatus, setEnvStatus] = useState<{
    cdpProjectId: boolean;
    onchainKitApiKey: boolean;
    paymasterUrl: boolean;
  }>({ cdpProjectId: false, onchainKitApiKey: false, paymasterUrl: false });

  useEffect(() => {
    setPasskeySupported(isPasskeyAvailable());
    
    // Validate CDP environment configuration
    const cdpStatus = validateCDPEnvironment();
    setEnvStatus({
      cdpProjectId: cdpStatus.projectId.configured,
      onchainKitApiKey: cdpStatus.apiKey.configured,
      paymasterUrl: cdpStatus.paymaster.configured
    });
    
    console.log('🚀 CDP Smart Wallet Configuration:');
    console.log('📱 Project ID:', cdpStatus.projectId.configured ? '✓' : '✗');
    console.log('🔑 API Key:', cdpStatus.apiKey.configured ? '✓' : '✗');
    console.log('⚡ Paymaster:', cdpStatus.paymaster.configured ? '✓' : '⚠');
    console.log('🌐 Network:', `${cdpStatus.network.name} (${cdpStatus.network.chainId})`);
  }, []);

  const handleBaseAccountSignIn = async () => {
    const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');

    if (!coinbaseConnector) {
      const error = "CDP Smart Wallet configuration not found";
      toast.error(error);
      onError?.(error);
      return;
    }

    // Verify CDP environment configuration
    const cdpStatus = validateCDPEnvironment();
    if (!cdpStatus.projectId.configured || !cdpStatus.apiKey.configured) {
      const missingVars = [];
      if (!cdpStatus.projectId.configured) missingVars.push('CDP Project ID');
      if (!cdpStatus.apiKey.configured) missingVars.push('OnchainKit API Key');
      
      const error = `Missing CDP configuration: ${missingVars.join(', ')}`;
      toast.error(error);
      onError?.(error);
      return;
    }

    try {
      console.log("🚀 Connecting to CDP Smart Wallet...");
      console.log("📱 Connector:", coinbaseConnector.name);
      
      // Generate nonce for authentication
      const nonce = generateAuthNonce();
      console.log(`🔑 Generated auth nonce: ${nonce}`);
      
      // Connect to CDP Smart Wallet using passkey authentication
      const result = await signInWithBase(coinbaseConnector);
      
      if (result.success) {
        const successMsg = `✅ CDP Smart Wallet connected: ${result.address?.slice(0, 6)}...${result.address?.slice(-4)}`;
        toast.success(successMsg);
        onSuccess?.(result.address!);
      } else {
        toast.error(result.error || "Failed to connect to CDP Smart Wallet");
        onError?.(result.error || "Failed to connect to CDP Smart Wallet");
      }
    } catch (err: any) {
      console.error("CDP Smart Wallet connection failed:", err);
      const errorMessage = err.message || "Connection failed. Please try again.";
      toast.error(errorMessage);
      onError?.(errorMessage);
    }
  };

  if (isConnected) {
    return (
      <div className="text-center py-8">
        <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-sm text-gray-600 font-medium">Successfully connected to Base Account</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Passkey availability check */}
      {passkeySupported === false && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Passkey Not Available</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your device doesn't support passkey authentication. Try using a modern browser with biometric support.
            </p>
          </div>
        </motion.div>
      )}

      {/* Sign In Button */}
      <motion.div
        whileHover={{ scale: passkeySupported === false ? 1 : 1.02 }}
        whileTap={{ scale: passkeySupported === false ? 1 : 0.98 }}
      >
        <Button
          onClick={handleBaseAccountSignIn}
          fullWidth
          disabled={isPending || passkeySupported === false}
          className="!h-16 !bg-axon-obsidian !text-white !font-black !text-sm group relative overflow-hidden"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="uppercase tracking-[0.2em]">Connecting...</span>
            </>
          ) : (
            <>
              <Key className="w-5 h-5 mr-2" />
              <span className="uppercase tracking-[0.2em]">Sign in with Base</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Environment Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2 text-xs">
          <Settings className="w-3 h-3 text-gray-500" />
          <span className="font-mono text-gray-600">CDP Configuration Status:</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className={`px-2 py-1 rounded text-center font-mono ${
            envStatus.cdpProjectId ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            CDP ID {envStatus.cdpProjectId ? '✓' : '✗'}
          </div>
          <div className={`px-2 py-1 rounded text-center font-mono ${
            envStatus.onchainKitApiKey ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            API Key {envStatus.onchainKitApiKey ? '✓' : '✗'}
          </div>
          <div className={`px-2 py-1 rounded text-center font-mono ${
            envStatus.paymasterUrl ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            Paymaster {envStatus.paymasterUrl ? '✓' : '⚠'}
          </div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-50/50 p-4 rounded-xl flex items-start gap-3 border border-purple-100"
        >
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">CDP Smart Wallet</p>
            <p className="text-xs text-purple-700 leading-relaxed">
              Coinbase Developer Platform smart wallet with passkey authentication and gasless transactions.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50/50 p-4 rounded-xl flex items-start gap-3 border border-blue-100"
        >
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Base Network</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Secure Layer 2 blockchain with instant transactions and sponsored gas fees for CDP wallets.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}