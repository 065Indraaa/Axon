import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
// import { supabase } from '../lib/supabase';

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    nik: string;
    address: string;
    city: string;
    postalCode: string;
    level: number;
}

const DEFAULT_PROFILE: UserProfile = {
    name: "New AXON User",
    email: "",
    phone: "",
    nik: "",
    address: "",
    city: "",
    postalCode: "",
    level: 1
};

export function useUserProfile() {
    const { address, isConnected } = useAccount();
    const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        if (!address) return;

        // Temporarily disabled Supabase loading
        /*
        setIsLoading(true);
        try {
            const { data, error: sbError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('wallet_address', address.toLowerCase())
                .single();

            if (sbError) {
                if (sbError.code === 'PGRST116') {
                    setProfile(DEFAULT_PROFILE);
                } else {
                    console.error('Error loading profile:', sbError);
                    setError(sbError.message);
                }
            } else if (data) {
                setProfile({
                    name: data.name || DEFAULT_PROFILE.name,
                    email: data.email || DEFAULT_PROFILE.email,
                    phone: data.phone || DEFAULT_PROFILE.phone,
                    nik: data.nik || DEFAULT_PROFILE.nik,
                    address: data.address || DEFAULT_PROFILE.address,
                    city: data.city || DEFAULT_PROFILE.city,
                    postalCode: data.postal_code || DEFAULT_PROFILE.postalCode,
                    level: data.verification_level || DEFAULT_PROFILE.level,
                });
            }
        } catch (err: any) {
            console.error('Unexpected error loading profile:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
        */
        setProfile(DEFAULT_PROFILE);
    }, [address]);

    const saveProfile = useCallback(async (newProfile: UserProfile) => {
        if (!address) return;

        // Temporarily disabled Supabase saving
        /*
        try {
            const { error: sbError } = await supabase
                .from('user_profiles')
                .upsert({
                    wallet_address: address.toLowerCase(),
                    name: newProfile.name,
                    email: newProfile.email,
                    phone: newProfile.phone,
                    nik: newProfile.nik,
                    address: newProfile.address,
                    city: newProfile.city,
                    postal_code: newProfile.postalCode,
                    verification_level: newProfile.level,
                    updated_at: new Date().toISOString(),
                });

            if (sbError) {
                console.error('Error saving profile:', sbError);
                throw sbError;
            }

            setProfile(newProfile);
        } catch (err: any) {
            console.error('Unexpected error saving profile:', err);
            throw err;
        }
        */
        setProfile(newProfile);
    }, [address]);

    useEffect(() => {
        if (isConnected && address) {
            loadProfile();
        } else {
            setProfile(DEFAULT_PROFILE);
        }
    }, [isConnected, address, loadProfile]);

    return {
        profile,
        isLoading,
        error,
        saveProfile,
        refreshProfile: loadProfile
    };
}
