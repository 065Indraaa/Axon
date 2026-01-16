import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
        return localStorage.getItem('axon_onboarding_complete') === 'true';
    });

    const setOnboardingComplete = (complete: boolean) => {
        setOnboardingCompleteState(complete);
        localStorage.setItem('axon_onboarding_complete', complete.toString());
    };

    // Derived state for currency
    const currency = CURRENCIES[location];

    // Real-time GPS Logic
    const updateRealLocation = async () => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            return;
        }

        return new Promise<void>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse Geocoding via OpenStreetMap (Nominatim)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.address) {
                        const countryCodeRaw = data.address.country_code?.toUpperCase(); // id, my, sg
                        const detectedCity = data.address.city || data.address.town || data.address.state || 'Unknown City';

                        // Map to our supported CountryCodes
                        let newLocation: CountryCode = 'US'; // Default fallback
                        if (countryCodeRaw === 'ID') newLocation = 'ID';
                        else if (countryCodeRaw === 'MY') newLocation = 'MY';
                        else if (countryCodeRaw === 'SG') newLocation = 'SG';
                        else if (countryCodeRaw === 'TH') newLocation = 'TH';

                        setLocationState(newLocation);
                        setCity(detectedCity);
                        resolve();
                    }
                } catch (error) {
                    console.error("Error fetching location data:", error);
                    reject(error);
                }
            }, (error) => {
                console.error("Error getting location:", error);
                reject(error);
            });
        });
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
            setOnboardingComplete
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
