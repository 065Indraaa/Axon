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
    countryName: string; // New: Full country name
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
    locationError?: boolean;
}

// Mock Data for Currencies
const CURRENCIES: Record<CountryCode, CurrencyData> = {
    'ID': { code: 'IDR', symbol: 'Rp', rate: 15500, locale: 'id-ID' },
    'MY': { code: 'MYR', symbol: 'RM', rate: 4.70, locale: 'ms-MY' },
    'SG': { code: 'SGD', symbol: 'S$', rate: 1.35, locale: 'en-SG' },
    'TH': { code: 'THB', symbol: '฿', rate: 36.50, locale: 'th-TH' },
    'US': { code: 'USD', symbol: '$', rate: 1, locale: 'en-US' },
};

const COUNTRY_NAMES: Record<CountryCode, string> = {
    'ID': 'INDONESIA',
    'MY': 'MALAYSIA',
    'SG': 'SINGAPORE',
    'TH': 'THAILAND',
    'US': 'UNITED STATES'
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
    const [locationError, setLocationError] = useState<boolean>(false);

    // Derived state
    const currency = CURRENCIES[location];
    const countryName = COUNTRY_NAMES[location] || 'UNKNOWN';

    const setOnboardingComplete = (complete: boolean) => {
        setOnboardingCompleteState(complete);
        sessionStorage.setItem('axon_onboarding_complete', complete.toString());
        if (complete) {
            setIsOnboardingActive(false);
        }
    };

    // Real-time GPS Logic (Watch Position)
    useEffect(() => {
        if (!navigator.geolocation) {
            // Try IP fallback immediately
            fetchIpLocationFallback().then(success => {
                if (!success) setLocationError(true);
            });
            return;
        }

        const watcher = navigator.geolocation.watchPosition(async (position) => {
            setLocationError(false);
            await fetchAndSetLocation(position.coords.latitude, position.coords.longitude);
        }, async (error) => {
            // Geolocation timeout is common, silently try fallback if it's code 3
            if (error.code !== 3) console.error("Location watch error:", error);
            const ipSuccess = await fetchIpLocationFallback();
            if (!ipSuccess) setLocationError(true);
        }, {
            enableHighAccuracy: false, // More reliable for broad location context
            timeout: 30000,
            maximumAge: 60000
        });

        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    const fetchAndSetLocation = async (lat: number, lon: number) => {
        let success = false;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                headers: { 'User-Agent': 'AxonApp/1.0 (info@axon.finance)' }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.address) {
                    const countryCodeRaw = data.address.country_code?.toUpperCase();
                    const detectedCity = data.address.city || data.address.town || data.address.county || 'Unknown';
                    updateLocationState(countryCodeRaw, detectedCity);
                    success = true;
                }
            }
        } catch (e) {
            console.warn("Nominatim failed", e);
        }

        // If Nominatim failed, try BigDataCloud (lat/lon)
        if (!success) {
            try {
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        updateLocationState(data.countryCode, data.city || data.locality || 'Unknown');
                        success = true;
                    }
                }
            } catch (e) { console.error("GPS fallback failed", e); }
        }
    };

    const fetchIpLocationFallback = async () => {
        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    updateLocationState(data.countryCode, data.city || data.locality || 'Unknown');
                    return true;
                }
            }
        } catch (error) {
            console.error("IP fallback failed:", error);
        }
        return false;
    };

    const updateLocationState = (countryCodeRaw: string, detectedCity: string) => {
        let newLocation: CountryCode = 'US';
        if (countryCodeRaw === 'ID') newLocation = 'ID';
        else if (countryCodeRaw === 'MY') newLocation = 'MY';
        else if (countryCodeRaw === 'SG') newLocation = 'SG';
        else if (countryCodeRaw === 'TH') newLocation = 'TH';

        setLocationState(newLocation);
        setCity(detectedCity);
        setLocationError(false);
    };

    const updateRealLocation = async () => {
        // Race condition: Try GPS, but trigger IP fallback if it fails/timeouts
        const ipPromise = fetchIpLocationFallback();

        if (!navigator.geolocation) {
            const success = await ipPromise;
            if (!success) setLocationError(true);
            return;
        }

        const gpsPromise = new Promise<void>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(async (position) => {
                await fetchAndSetLocation(position.coords.latitude, position.coords.longitude);
                resolve();
            }, (error) => {
                reject(error);
            }, { enableHighAccuracy: true, timeout: 5000 });
        });

        try {
            await gpsPromise;
        } catch (e) {
            console.warn("Manual GPS failed, relying on IP...", e);
            const success = await ipPromise;
            if (!success) setLocationError(true);
        }
    };

    const toggleAi = () => setIsAiActive(prev => !prev);

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
            countryName,
            city,
            currency,
            isAiActive,
            updateRealLocation,
            toggleAi,
            formatAmount,
            onboardingComplete,
            setOnboardingComplete,
            isOnboardingActive,
            setIsOnboardingActive,
            locationError
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
