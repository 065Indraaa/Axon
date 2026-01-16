import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Types for our AXON AI System
export type CountryCode = 'ID' | 'MY' | 'SG' | 'TH' | 'US';

export interface CurrencyData {
    code: string;
    symbol: string;
    rate: number; // Rate relative to USD (Mock)
    locale: string;
}

interface AxonContextType {
    location: CountryCode;
    city: string; // New: Store detected city
    currency: CurrencyData;
    isAiActive: boolean;
    updateRealLocation: () => Promise<void>; // New: Trigger GPS update
    toggleAi: () => void;
    formatAmount: (amountInUSD: number) => string;
    onboardingComplete: boolean;
    setOnboardingComplete: (complete: boolean) => void;
    isOnboardingActive: boolean;
    setIsOnboardingActive: (active: boolean) => void;
}

// Mock Data for Currencies
const CURRENCIES: Record<CountryCode, CurrencyData> = {
    'ID': { code: 'IDR', symbol: 'Rp', rate: 15500, locale: 'id-ID' },
    'MY': { code: 'MYR', symbol: 'RM', rate: 4.70, locale: 'ms-MY' },
    'SG': { code: 'SGD', symbol: 'S$', rate: 1.35, locale: 'en-SG' },
    'TH': { code: 'THB', symbol: '฿', rate: 36.50, locale: 'th-TH' },
    'US': { code: 'USD', symbol: '$', rate: 1, locale: 'en-US' },
};

const AxonContext = createContext<AxonContextType | undefined>(undefined);

export function AxonProvider({ children }: { children: ReactNode }) {
    const [location, setLocationState] = useState<CountryCode>('ID');
    const [city, setCity] = useState<string>('Jakarta');
    const [isAiActive, setIsAiActive] = useState(true);
    const [onboardingComplete, setOnboardingCompleteState] = useState<boolean>(() => {
        return sessionStorage.getItem('axon_onboarding_complete') === 'true';
    });
    const [isOnboardingActive, setIsOnboardingActive] = useState(false);

    const setOnboardingComplete = (complete: boolean) => {
        setOnboardingCompleteState(complete);
        sessionStorage.setItem('axon_onboarding_complete', complete.toString());
        if (complete) {
            setIsOnboardingActive(false);
        }
    };

    // Derived state for currency
    const currency = CURRENCIES[location];

    // Real-time GPS Logic (Watch Position)
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watcher = navigator.geolocation.watchPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Reverse Geocoding via OpenStreetMap (Nominatim)
                // Note: In production, use a dedicated API key or backend proxy to avoid rate limits
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                if (data && data.address) {
                    const countryCodeRaw = data.address.country_code?.toUpperCase(); // id, my, sg
                    const detectedCity = data.address.city || data.address.town || data.address.state || 'Unknown City';

                    let newLocation: CountryCode = 'US';
                    if (countryCodeRaw === 'ID') newLocation = 'ID';
                    else if (countryCodeRaw === 'MY') newLocation = 'MY';
                    else if (countryCodeRaw === 'SG') newLocation = 'SG';
                    else if (countryCodeRaw === 'TH') newLocation = 'TH';

                    setLocationState(newLocation);
                    setCity(detectedCity);
                }
            } catch (error) {
                console.error("Error fetching location data:", error);
            }
        }, (error) => {
            console.error("Location watch error:", error);
        }, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 10000
        });

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    const updateRealLocation = async () => {
        // Kept for manual refresh compability if needed, but the main work is done by the effect above
    };

    const toggleAi = () => setIsAiActive(prev => !prev);

    // Helper: Formats any base USD amount to the local currency
    const formatAmount = (amountInUSD: number): string => {
        const localValue = amountInUSD * currency.rate;

        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(localValue);
    };

    return (
        <AxonContext.Provider value={{
            location,
            city,
            currency,
            isAiActive,
            updateRealLocation,
            toggleAi,
            formatAmount,
            onboardingComplete,
            setOnboardingComplete,
            isOnboardingActive,
            setIsOnboardingActive
        }}>
            {children}
        </AxonContext.Provider>
    );
}

// Hook for easy usage
export function useAxon() {
    const context = useContext(AxonContext);
    if (context === undefined) {
        throw new Error('useAxon must be used within an AxonProvider');
    }
    return context;
}
