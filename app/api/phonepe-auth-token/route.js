// app/api/phonepe-auth-token/route.js
import { NextResponse } from 'next/server';

// These should be set as secrets in Google Secret Manager and referenced in apphosting.yaml
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const PHONEPE_AUTH_TOKEN_URL = process.env.PHONEPE_AUTH_TOKEN_URL;

export async function POST(request) {
    try {
        console.log("DEBUG ENV VARS for Auth Token:");
        console.log("PHONEPE_CLIENT_ID:", PHONEPE_CLIENT_ID ? "Loaded" : "NOT LOADED");
        console.log("PHONEPE_CLIENT_SECRET:", PHONEPE_CLIENT_SECRET ? "Loaded" : "NOT LOADED");
        console.log("PHONEPE_AUTH_TOKEN_URL:", PHONEPE_AUTH_TOKEN_URL);

        if (!PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET) {
            console.error("Missing PhonePe Client ID or Client Secret environment variables.");
            return NextResponse.json(
                { message: 'Authentication credentials are not configured.', details: 'Missing Client ID or Client Secret.' },
                { status: 500 }
            );
        }

        // Construct the request body for OAuth token
        // PhonePe expects application/x-www-form-urlencoded
        const requestBody = new URLSearchParams();
        requestBody.append('client_id', PHONEPE_CLIENT_ID);
        requestBody.append('client_version', '1'); // As per documentation for UAT. Check prod doc for its value.
        requestBody.append('client_secret', PHONEPE_CLIENT_SECRET);
        requestBody.append('grant_type', 'client_credentials');

        const response = await fetch(PHONEPE_AUTH_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'accept': 'application/json'
            },
            body: requestBody.toString(), // Send URLSearchParams as string
        });

        const data = await response.json();
        console.log("PhonePe Auth Token API Response:", data);

        if (response.ok && data.access_token) {
            // Note: `expires_at` is epoch seconds. Client might need to convert to milliseconds.
            // Sending `expiresIn` as it might be in the original response too.
            return NextResponse.json({ accessToken: data.access_token, expiresIn: data.expires_at });
        } else {
            console.error("Failed to get PhonePe Access Token:", data);
            return NextResponse.json(
                { message: 'Failed to acquire PhonePe access token.', details: data.message || 'Unknown authentication error.' },
                { status: response.status }
            );
        }

    } catch (error) {
        console.error('Error in PhonePe Auth Token API:', error);
        let errorMessageForClient = 'An unexpected server error occurred during token acquisition.';
        let errorDetailsForClient = 'No specific details available.';

        if (error instanceof Error) {
            errorMessageForClient = error.message;
            errorDetailsForClient = error.stack || error.message;
        } else if (typeof error === 'object' && error !== null) {
            try {
                errorMessageForClient = JSON.stringify(error);
                errorDetailsForClient = JSON.stringify(error);
            } catch (stringifyErr) {
                errorMessageForClient = "An unstringifiable object error occurred.";
                errorDetailsForClient = "Original error could not be stringified.";
            }
        } else if (typeof error === 'string') {
            errorMessageForClient = error;
            errorDetailsForClient = error;
        }

        return NextResponse.json(
            {
                message: errorMessageForClient,
                details: errorDetailsForClient
            },
            { status: 500 }
        );
    }
}
