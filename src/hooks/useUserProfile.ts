import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../lib/supabase';

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    level: number;
    isAccountVerified?: boolean;
    isCountryVerified?: boolean;
    isCoinbaseOne?: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
    name: "New AXON User",
    email: "",
    phone: "",
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

        setIsLoading(true);
        setError(null);
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
    }, [address]);

    const saveProfile = useCallback(async (newProfile: UserProfile) => {
        if (!address) return;

        try {
            console.log('💾 Saving profile for wallet:', address.toLowerCase());
            console.log('📝 Profile data:', newProfile);

            // First try to update existing record (more reliable than upsert)
            const { error: updateError, data: existingData } = await supabase
                .from('user_profiles')
                .update({
                    name: newProfile.name,
                    email: newProfile.email,
                    phone: newProfile.phone,
                    address: newProfile.address,
                    city: newProfile.city,
                    postal_code: newProfile.postalCode,
                    verification_level: newProfile.level,
                    updated_at: new Date().toISOString(),
                })
                .eq('wallet_address', address.toLowerCase())
                .select();

            if (!updateError && existingData && existingData.length > 0) {
                console.log('✅ Profile updated successfully');
                setProfile(newProfile);
                return;
            }

            // If no existing record, try insert
            if (!updateError && (!existingData || existingData.length === 0)) {
                console.log('📝 No existing profile found, attempting insert...');
                
                const { error: insertError } = await supabase
                    .from('user_profiles')
                    .insert({
                        wallet_address: address.toLowerCase(),
                        name: newProfile.name,
                        email: newProfile.email,
                        phone: newProfile.phone,
                        address: newProfile.address,
                        city: newProfile.city,
                        postal_code: newProfile.postalCode,
                        verification_level: newProfile.level,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (insertError) {
                    if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
                        console.warn('⚠️ Insert failed due to duplicate, record was likely created concurrently');
                        // Don't throw error, just fetch the existing record
                        await loadProfile();
                        return;
                    } else {
                        console.error('Error inserting profile:', insertError);
                        throw new Error(`Failed to create profile: ${insertError.message}`);
                    }
                } else {
                    console.log('✅ Profile created successfully');
                    setProfile(newProfile);
                    return;
                }
            }

            // If update failed with something other than "not found"
            if (updateError) {
                console.error('Error updating profile:', updateError);
                throw new Error(`Failed to update profile: ${updateError.message}`);
            }

        } catch (err: any) {
            console.error('Unexpected error saving profile:', err);
            
            // Final fallback - try to reload existing profile
            try {
                await loadProfile();
            } catch (loadErr) {
                console.error('Failed to reload profile after error:', loadErr);
            }
            
            throw err;
        }
    }, [address, loadProfile]);

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
