import { Address } from 'viem';
import { TOKENS } from '../config/tokens';
import { useAccount } from 'wagmi';

interface IdrxSwapTestResult {
    canSwap: boolean;
    estimatedOutput?: string;
    error?: string;
    warnings?: string[];
    recommendations?: string[];
}

export async function testIdrxSwap(
    amount: string,
    userAddress: Address,
    chainId: number = 8453
): Promise<IdrxSwapTestResult> {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
        // Import dynamically to avoid SSR issues
        const { getSwapQuote } = await import('@coinbase/onchainkit/api');

        const usdcToken = TOKENS.find(t => t.symbol === 'USDC');
        const idrxToken = TOKENS.find(t => t.symbol === 'IDRX');

        if (!usdcToken || !idrxToken) {
            return {
                canSwap: false,
                error: 'Token configuration missing'
            };
        }

        // Validate amount
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return {
                canSwap: false,
                error: 'Invalid amount'
            };
        }

        // Amount warnings
        if (amountNum < 1) {
            warnings.push('Amounts less than 1 USDC may have higher slippage');
            recommendations.push('Consider using amounts of 1 USDC or more for better rates');
        }

        if (amountNum > 10000) {
            warnings.push('Large amounts may have liquidity constraints');
            recommendations.push('Consider breaking into smaller transactions');
        }

        const quoteParams = {
            from: {
                address: usdcToken.address,
                symbol: usdcToken.symbol,
                name: usdcToken.name,
                decimals: usdcToken.decimals,
                chainId,
                image: ''
            },
            to: {
                address: idrxToken.address,
                symbol: idrxToken.symbol,
                name: idrxToken.name,
                decimals: idrxToken.decimals,
                chainId,
                image: ''
            },
            amount,
            useAggregator: true,
            maxSlippage: '5', // Use higher slippage for testing
            isAmountInDecimals: true
        };

        const quote = await getSwapQuote(quoteParams);

        if ('error' in quote) {
            console.error('IDRX test quote failed:', quote);
            
            // Provide specific error guidance
            let errorMsg = quote.error || quote.message || 'Unknown error';
            if (errorMsg.includes('no route') || errorMsg.includes('no path')) {
                return {
                    canSwap: false,
                    error: 'No swap route available',
                    warnings: ['IDRX may have insufficient liquidity'],
                    recommendations: [
                        'Try again later when liquidity improves',
                        'Use a smaller amount',
                        'Contact support if issue persists'
                    ]
                };
            }

            return {
                canSwap: false,
                error: errorMsg,
                recommendations: ['Try refreshing the page and attempting again']
            };
        }

        // Analyze the quote for potential issues
        if (quote.quote?.priceImpact && parseFloat(quote.quote.priceImpact) > 5) {
            warnings.push(`High price impact: ${quote.quote.priceImpact}%`);
            recommendations.push('Consider reducing the amount or waiting for better rates');
        }

        if (quote.warning) {
            warnings.push(quote.warning.message);
        }

        return {
            canSwap: true,
            estimatedOutput: quote.quote?.toAmount,
            warnings: warnings.length > 0 ? warnings : undefined,
            recommendations: recommendations.length > 0 ? recommendations : undefined
        };

    } catch (error) {
        console.error('IDRX swap test failed:', error);
        return {
            canSwap: false,
            error: error instanceof Error ? error.message : 'Test failed',
            recommendations: [
                'Check your internet connection',
                'Ensure you are on Base network',
                'Try refreshing the page'
            ]
        };
    }
}

export function getIdrxSwapRecommendations(amount: string): string[] {
    const recommendations: string[] = [];
    const amountNum = parseFloat(amount);

    if (amountNum < 1) {
        recommendations.push('For best results, swap 1 USDC or more');
    }

    if (amountNum > 5000) {
        recommendations.push('For large amounts, consider multiple smaller swaps');
    }

    recommendations.push('Ensure you have sufficient USDC balance');
    recommendations.push('Keep the app open until the transaction completes');
    recommendations.push('Gas fees will be sponsored by Coinbase');

    return recommendations;
}