import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { address } = useAccount();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            setStatus('error');
            setMessage('Authentication failed. Please try again.');
            setTimeout(() => navigate('/account'), 3000);
            return;
        }

        if (!code) {
            setStatus('error');
            setMessage('Invalid callback. Missing authorization code.');
            setTimeout(() => navigate('/account'), 3000);
            return;
        }

        if (!address) {
            setStatus('error');
            setMessage('Please connect your wallet first.');
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        exchangeCodeForToken(code, address);
    }, [searchParams, navigate, address]);

    const exchangeCodeForToken = async (code: string, walletAddress: string) => {
        try {
            setMessage('Exchanging authorization code...');

            // Exchange code for access token via secure backend function
            const { data: functionData, error: functionError } = await supabase.functions.invoke('coinbase_oauth', {
                body: {
                    code: code,
                    redirect_uri: import.meta.env.VITE_COINBASE_REDIRECT_URI,
                },
            });

            if (functionError || !functionData || functionData.error) {
                console.error('Token exchange error:', functionError || functionData?.error);
                throw new Error(functionData?.error || 'Failed to exchange code for token');
            }

            const accessToken = functionData.access_token;

            // Store token associated with wallet address
            localStorage.setItem(`coinbase_oauth_token_${walletAddress}`, accessToken);

            setMessage('Fetching your profile...');

            // Fetch user profile
            const userResponse = await fetch('https://api.coinbase.com/v2/user', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'CB-VERSION': '2024-01-01',
                },
            });

            if (!userResponse.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const userData = await userResponse.json();
            const user = userData.data;

            // Store user data
            const verificationData = {
                name: user.name || 'User',
                email: user.email || '',
                country: user.country?.code || 'ID',
                verificationLevel: 2, // Coinbase verified
            };

            localStorage.setItem(
                `coinbase_verification_${walletAddress}`,
                JSON.stringify(verificationData)
            );

            setStatus('success');
            setMessage('Successfully authenticated! Redirecting...');

            // Redirect to profile page
            setTimeout(() => {
                navigate('/account');
                window.location.reload(); // Reload to trigger data fetch
            }, 2000);

        } catch (error) {
            console.error('OAuth error:', error);
            setStatus('error');
            setMessage('Failed to complete authentication. Please try again.');
            setTimeout(() => navigate('/account'), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-[20px] border border-gray-200 p-8 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        {status === 'loading' && (
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-xl font-black text-axon-obsidian uppercase tracking-tight font-mono mb-2">
                        {status === 'loading' && 'Authenticating'}
                        {status === 'success' && 'Success!'}
                        {status === 'error' && 'Error'}
                    </h1>

                    {/* Message */}
                    <p className="text-sm text-gray-600 mb-6">{message}</p>

                    {/* Progress indicator */}
                    {status === 'loading' && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                    )}

                    {/* Coinbase branding */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                            Powered by Coinbase
                        </p>
                    </div>
                </div>

                {/* Info */}
                <p className="text-center text-xs text-gray-500 mt-4">
                    Please do not close this window
                </p>
            </div>
        </div>
    );
}
