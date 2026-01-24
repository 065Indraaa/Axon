import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

interface CoinbaseVerificationData {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    verificationLevel: number;
    isAccountVerified: boolean;
    isCountryVerified: boolean;
    isCoinbaseOne: boolean;
}

// EAS Schema IDs for Coinbase Verifications on Base (Mainnet & Sepolia)
// Ref: https://docs.cdp.coinbase.com/onchain-verifications/docs/verifications-eas
const SCHEMAS = {
    [base.id]: {
        ACCOUNT: "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9",
        COUNTRY: "0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065",
        COINBASE_ONE: "0x254bd1b63e0591fefa66818ca054c78627306f253f86be6023725a67ee6bf9f4",
    },
    [baseSepolia.id]: {
        ACCOUNT: "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9", // Fallback to mainnet schema if specific one not found
        COUNTRY: "0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065",
        COINBASE_ONE: "0x254bd1b63e0591fefa66818ca054c78627306f253f86be6023725a67ee6bf9f4",
    }
};

const EAS_ENDPOINTS: Record<number, string> = {
    [base.id]: 'https://base.easscan.org/graphql',
    [baseSepolia.id]: 'https://base-sepolia.easscan.org/graphql'
};

/**
 * Hook to fetch REAL-TIME Coinbase verification data from EAS attestations
 */
export function useCoinbaseVerification() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [verificationData, setVerificationData] = useState<CoinbaseVerificationData>(() => {
        const cached = localStorage.getItem(`coinbase_verification_${address}`);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                return { verificationLevel: 0, isAccountVerified: false, isCountryVerified: false, isCoinbaseOne: false };
            }
        }
        return { verificationLevel: 0, isAccountVerified: false, isCountryVerified: false, isCoinbaseOne: false };
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isConnected || !address) {
            setVerificationData({
                verificationLevel: 0,
                isAccountVerified: false,
                isCountryVerified: false,
                isCoinbaseOne: false
            });
            return;
        }

        const fetchVerificationData = async () => {
            setIsLoading(true);

            try {
                // Fetch EAS Attestations (Source of truth on-chain)
                const currentSchemas = SCHEMAS[chainId as keyof typeof SCHEMAS] || SCHEMAS[base.id];
                const endpoint = EAS_ENDPOINTS[chainId] || EAS_ENDPOINTS[base.id];

                const [hasAccount, hasCountry, hasCB1] = await Promise.all([
                    checkEASAttestation(address, currentSchemas.ACCOUNT, endpoint),
                    checkEASAttestation(address, currentSchemas.COUNTRY, endpoint),
                    checkEASAttestation(address, currentSchemas.COINBASE_ONE, endpoint)
                ]);

                // Metadata via OAuth (optional fallback for name/email)
                let name = "";
                let email = "";
                let country = "";

                const oauthToken = localStorage.getItem(`coinbase_oauth_token_${address}`);
                // Metadata is now fetched in backend during OAuth and stored in localStorage
                const cachedData = localStorage.getItem(`coinbase_verification_${address}`);
                if (cachedData) {
                    try {
                        const parsed = JSON.parse(cachedData);
                        name = parsed.name || "";
                        email = parsed.email || "";
                        country = parsed.country || "";
                    } catch (e) {
                        console.error("Failed to parse cached verification data", e);
                    }
                }

                // Strictly derive level from ON-CHAIN status
                let level = 0;
                if (oauthToken) level = 1; // Basic Connection
                if (hasAccount && hasCountry) level = 2; // Verified Identity
                if (hasCB1) level = 3; // Premium Status

                const finalData = {
                    name,
                    email,
                    country,
                    verificationLevel: level,
                    isAccountVerified: hasAccount,
                    isCountryVerified: hasCountry,
                    isCoinbaseOne: hasCB1
                };

                setVerificationData(finalData);
                // We still cache for performance, but the effector runs every address change
                localStorage.setItem(`coinbase_verification_${address}`, JSON.stringify(finalData));

            } catch (error) {
                console.error('Real-time verification fetch failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVerificationData();
    }, [address, isConnected]);

    return { verificationData, isLoading };
}

/**
 * Check if user has a specific Coinbase Verification attestation on EAS
 * Queries the GraphQL endpoint directly for real-time status
 */
async function checkEASAttestation(address: string, schemaId: string, endpoint: string): Promise<boolean> {
    try {
        const query = `
            query GetAttestations($recipient: String!, $schemaId: String!) {
                attestations(
                    where: {
                        recipient: { equals: $recipient }
                        schemaId: { equals: $schemaId }
                        revoked: { equals: false }
                    }
                    take: 1
                ) {
                    id
                }
            }
        `;

        const response = await fetch(endpoint, {
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

        if (!response.ok) return false;

        const result = await response.json();
        return (result.data?.attestations?.length || 0) > 0;
    } catch (error) {
        console.error('EAS real-time check failed:', error);
        return false;
    }
}

/**
 * Redirect to official Coinbase Onchain Verification Page
 */
export function redirectToCoinbaseVerification() {
    window.location.href = 'https://www.coinbase.com/onchain-verify';
}

/**
 * Initiate Coinbase OAuth flow
 */
export function initiateCoinbaseOAuth() {
    const clientId = import.meta.env.VITE_COINBASE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_COINBASE_REDIRECT_URI;

    if (!clientId) {
        console.error("Coinbase Client ID not configured");
        return;
    }

    const authUrl = `https://www.coinbase.com/oauth/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=wallet:user:read,wallet:user:email`;

    window.location.href = authUrl;
}
