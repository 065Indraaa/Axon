import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { code, redirect_uri } = await req.json()

        if (!code) {
            throw new Error('Missing authorization code')
        }

        const clientId = Deno.env.get('COINBASE_CLIENT_ID')
        const clientSecret = Deno.env.get('COINBASE_CLIENT_SECRET')

        if (!clientId || !clientSecret) {
            console.error('Missing Coinbase OAuth configuration')
            throw new Error('Server configuration error')
        }

        // Exchange code for token
        const response = await fetch('https://api.coinbase.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Coinbase token exchange failed:', data)
            return new Response(JSON.stringify({ error: data.error_description || data.error || 'Token exchange failed' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: response.status,
            })
        }

        // NEW: Fetch user profile data from backend to avoid CORS
        const userResponse = await fetch('https://api.coinbase.com/v2/user', {
            headers: {
                'Authorization': `Bearer ${data.access_token}`,
                'CB-VERSION': '2024-01-01',
            },
        });

        if (userResponse.ok) {
            const userData = await userResponse.json();
            data.user = userData.data;
            console.log('Successfully fetched user profile for', data.user.name);
        } else {
            console.error('Failed to fetch user profile from Coinbase');
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('OAuth error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
