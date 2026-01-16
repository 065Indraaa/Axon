import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface CoinbaseVerificationData {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    verificationLevel: number;
}

/**
 * Hook to fetch Coinbase verification data from EAS attestations
 * This will automatically populate user data after they verify with Coinbase
 */
export function useCoinbaseVerification() {
    const { address, isConnected } = useAccount();
    const [verificationData, setVerificationData] = useState<CoinbaseVerificationData>({
        verificationLevel: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isConnected || !address) {
            setVerificationData({ verificationLevel: 0 });
            return;
        }

        const fetchVerificationData = async () => {
            setIsLoading(true);

            try {
                // Step 1: Check if we have cached verification for this address
                const cachedVerification = localStorage.getItem(`coinbase_verification_${address}`);

                if (cachedVerification) {
                    const parsed = JSON.parse(cachedVerification);
                    setVerificationData(parsed);
                    setIsLoading(false);
                    return;
                }

                // Step 2: Check if user has OAuth token (from Coinbase login)
                const oauthToken = localStorage.getItem(`coinbase_oauth_token_${address}`);

                if (oauthToken) {
                    // Fetch user profile from Coinbase API
                    const response = await fetch('https://api.coinbase.com/v2/user', {
                        headers: {
                            'Authorization': `Bearer ${oauthToken}`,
                            'CB-VERSION': '2024-01-01'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const userData = data.data;

                        // Step 3: Query EAS for verification attestations
                        const hasVerificationAttestation = await checkEASAttestation(address);

                        const verifiedData = {
                            name: userData.name || "User",
                            email: userData.email || "",
                            country: userData.country?.code || "ID",
                            verificationLevel: hasVerificationAttestation ? 2 : 1
                        };

                        // Cache the data
                        localStorage.setItem(`coinbase_verification_${address}`, JSON.stringify(verifiedData));
                        setVerificationData(verifiedData);
                    } else {
                        // Token expired or invalid
                        localStorage.removeItem(`coinbase_oauth_token_${address}`);
                        setVerificationData({ verificationLevel: 1 });
                    }
                } else {
                    // User connected wallet but hasn't done OAuth
                    setVerificationData({ verificationLevel: 1 });
                }
            } catch (error) {
                console.error('Error fetching verification data:', error);
                setVerificationData({ verificationLevel: 1 });
            } finally {
                setIsLoading(false);
            }
        };

        fetchVerificationData();
    }, [address, isConnected]);

    return { verificationData, isLoading };
}

/**
 * Check if user has Coinbase Verification attestation on EAS
 */
async function checkEASAttestation(address: string): Promise<boolean> {
    try {
        const schemaId = import.meta.env.VITE_COINBASE_VERIFICATION_SCHEMA_ID;

        // Query EAS GraphQL endpoint for Base network
        const query = `
            query GetAttestations($recipient: String!, $schemaId: String!) {
                attestations(
                    where: {
                        recipient: { equals: $recipient }
                        schemaId: { equals: $schemaId }
                        revoked: { equals: false }
                    }
                ) {
                    id
                    attester
                    decodedDataJson
                }
            }
        `;

        const response = await fetch('https://base.easscan.org/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                variables: {
                    recipient: address.toLowerCase(),
                    schemaId: schemaId
                }
            })
        });

        const result = await response.json();
        return result.data?.attestations?.length > 0;
    } catch (error) {
        console.error('Error checking EAS attestation:', error);
        return false;
    }
}

/**
 * Initiate Coinbase OAuth flow
 */
export function initiateCoinbaseOAuth() {
    const clientId = import.meta.env.VITE_COINBASE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_COINBASE_REDIRECT_URI;

    const authUrl = `https://www.coinbase.com/oauth/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=wallet:user:read,wallet:user:email`;

    window.location.href = authUrl;
}

/**
 * Helper function to trigger mock verification
 * In production, this would redirect to Coinbase verification flow
 */
export function mockCoinbaseVerification(address: string) {
    localStorage.setItem(`coinbase_verified_${address}`, 'true');
    window.location.reload(); // Reload to trigger data fetch
}
