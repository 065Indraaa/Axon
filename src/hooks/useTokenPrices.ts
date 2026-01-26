import { useState, useEffect, useCallback } from 'react';

interface TokenPrices {
    [symbol: string]: number;
}

export function useTokenPrices() {
    const [prices, setPrices] = useState<TokenPrices>({
        USDC: 1,
        USDT: 1,
        IDRX: 0.000063, // 1/15850 approx
        ETH: 0,
    });
    const [usdToIdr, setUsdToIdr] = useState<number>(15850);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPrices = useCallback(async () => {
        try {
            // Fetch USD/IDR exchange rate from Coinbase
            const ratesResponse = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD');
            const ratesData = await ratesResponse.json();

            if (ratesData?.data?.rates) {
                const idrRate = parseFloat(ratesData.data.rates.IDR);
                if (idrRate) setUsdToIdr(idrRate);

                // Update prices based on USD rates
                const newPrices: TokenPrices = {
                    USDC: 1,
                    USDT: 1,
                    IDRX: 1 / idrRate,
                    ETH: 1 / parseFloat(ratesData.data.rates.ETH) || 0,
                    VIRTUAL: 1 / parseFloat(ratesData.data.rates.VIRTUAL) || 0,
                };
                setPrices(newPrices);
            }
        } catch (error) {
            console.error('Failed to fetch real-time prices:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [fetchPrices]);

    const convertToIdr = (usdAmount: number) => {
        return usdAmount * usdToIdr;
    };

    return {
        prices,
        usdToIdr,
        convertToIdr,
        isLoading,
        refresh: fetchPrices
    };
}
