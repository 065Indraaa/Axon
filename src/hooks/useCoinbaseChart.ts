import { useEffect, useState } from 'react';

// Fetches real-time price chart data from Coinbase API for a given symbol (e.g. 'BTC-USD', 'ETH-USD', 'USDC-USD')
export function useCoinbaseChart(symbol: string, granularity: number = 60) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    // Coinbase API: https://api.exchange.coinbase.com/products/{product_id}/candles
    // product_id: e.g. 'BTC-USD', 'ETH-USD', 'USDC-USD', 'IDRX-USD' (if available)
    fetch(`https://api.exchange.coinbase.com/products/${symbol}/candles?granularity=${granularity}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch chart data');
        return res.json();
      })
      .then((arr) => {
        // Coinbase returns [time, low, high, open, close, volume] per candle
        // Sort by time ascending
        const sorted = arr.sort((a: any, b: any) => a[0] - b[0]);
        if (isMounted) setData(sorted);
      })
      .catch((e) => {
        if (isMounted) setError(e.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [symbol, granularity]);

  return { data, loading, error };
}
