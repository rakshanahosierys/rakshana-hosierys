// app/api/phonepe-callback/route.js
import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/utlis/firebaseAdmin'; // Correct: Import Admin SDK

// Ensure these are defined in your environment variables (e.g., .env.local for dev, hosting provider for prod)
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID; // Used for status check URL, might be in callback body
const PHONEPE_STATUS_CHECK_API_URL = process.env.PHONEPE_STATUS_CHECK_API_URL;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // Used to call internal token API

export async function POST(request) {
    try {
        const callbackBody = await request.json(); // PhonePe sends JSON in the body
        console.log("PhonePe Callback Received:", JSON.stringify(callbackBody, null, 2));

        // --- 1. No Salt-Based Checksum Verification for Incoming OAuth Callbacks ---
        // PhonePe's /checkout/v2/pay webhook does not send an X-VERIFY header using Salt Key.
        // Security is achieved by the server-to-server status check using the OAuth token.
        // The previous checksum verification logic is removed.

        // --- 2. Extract Data from Callback ---
        const { code, transactionId, merchantOrderId } = callbackBody; // Assuming these fields are present

        if (!merchantOrderId) {
            console.error("Missing merchantOrderId in PhonePe callback.");
            return NextResponse.json({ success: false, message: 'Missing merchantOrderId' }, { status: 400 });
        }

        // Extract the original orderId from your merchantOrderId format: PPO_{orderId}_{timestamp}
        const parts = merchantOrderId.split('_');
        const originalOrderId = parts.length >= 2 ? parts[1] : null;

        if (!originalOrderId) {
            console.error(`Could not extract originalOrderId from merchantOrderId: ${merchantOrderId}`);
            return NextResponse.json({ success: false, message: 'Invalid merchantOrderId format' }, { status: 400 });
        }

        // --- 3. Get Access Token for Server-to-Server Status Check ---
        const tokenFetchUrl = `${NEXT_PUBLIC_BASE_URL}/api/phonepe-auth-token`;
        console.log("Callback: Attempting to fetch token from:", tokenFetchUrl);
        const tokenResponse = await fetch(tokenFetchUrl, {
            method: 'POST', // Call your internal token acquisition API
        });

        // --- NEW LOGGING ADDED HERE ---
        console.log("Callback: Token API Response Status:", tokenResponse.status);
        console.log("Callback: Token API Response Status Text:", tokenResponse.statusText);
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("Callback: Raw Token API Error Response (HTML/Text):", errorText.substring(0, 500) + "..."); // Log first 500 chars
            return NextResponse.json(
                { success: false, message: 'Failed to acquire PhonePe access token (internal API error during callback).', details: `Status: ${tokenResponse.status}, Details: ${errorText.substring(0, 200)}...` },
                { status: tokenResponse.status || 500 }
            );
        }
        // --- END NEW LOGGING ---

        const tokenData = await tokenResponse.json();

        if (!tokenData.accessToken) {
            console.error("Callback: Failed to get access token from internal API (no accessToken in response):", tokenData);
            return NextResponse.json(
                { success: false, message: 'Failed to acquire PhonePe access token for status check (missing token).' },
                { status: 500 }
            );
        }
        const accessToken = tokenData.accessToken;
        console.log("Callback: PhonePe Access Token acquired for status check (first 10 chars):", accessToken.substring(0, 10) + "...");


        // --- 4. Server-to-Server Status Check (Crucial for Reliability) ---
        // Even if the callback says success, always do a server-to-server check.
        // The status check endpoint is typically /pg/v1/status/{merchantId}/{merchantTransactionId}
        // but now uses the OAuth Authorization header.
        const statusCheckUrl = `${PHONEPE_STATUS_CHECK_API_URL}/${PHONEPE_MERCHANT_ID}/${merchantOrderId}`;
        console.log(`Callback: Performing status check on: ${statusCheckUrl}`);

        const statusResponse = await fetch(statusCheckUrl, {
            method: 'GET', // PhonePe's /pg/v1/status endpoint is typically GET
            headers: {
                'Content-Type': 'application/json', // Good practice, though not strictly needed for GET
                'Authorization': `O-Bearer ${accessToken}`, // OAuth 2.0 Token
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID, // X-MERCHANT-ID is often required for status check
            },
        });

        const statusData = await statusResponse.json();
        console.log("Callback: PhonePe Status API Response:", JSON.stringify(statusData, null, 2));

        let newPaymentStatus;
        if (statusData.success && statusData.code === 'PAYMENT_SUCCESS') {
            newPaymentStatus = 'Paid';
        } else if (statusData.code === 'PAYMENT_PENDING') {
            newPaymentStatus = 'Pending'; // Keep pending if status API says so
        }
        else {
            newPaymentStatus = 'Failed';
        }

        // --- 5. Update Order Status in Firestore (Using Admin SDK) ---
        const orderRef = adminDb.collection("orders").doc(originalOrderId);
        await orderRef.update({
            paymentStatus: newPaymentStatus,
            phonePeTransactionId: transactionId || statusData.data?.transactionId || null, // Use PhonePe's transaction ID from callback or status
            phonePeCallbackResponse: callbackBody, // Store the raw callback for debugging
            phonePeStatusResponse: statusData,    // Store the raw status response for debugging
            updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
            // You might want to add more fields like:
            // paymentGateway: 'PhonePe',
            // amountPaid: statusData.data.amount / 100, // Convert paisa back to INR if needed
        });
        console.log(`Callback: Order ${originalOrderId} payment status updated to: ${newPaymentStatus}`);

        // --- 6. Respond to PhonePe (typical webhook) ---
        // For a typical webhook, you should respond with a 200 OK to PhonePe's server.
        // The user's browser redirection is handled by the `redirectUrl` you provided
        // in the *initial payment initiation API call*.
        return NextResponse.json({ success: true, message: 'Callback processed' }, { status: 200 });

    } catch (error) {
        console.error('Error in PhonePe callback API:', error);
        // Respond to PhonePe with a non-200 status code for errors, but provide a friendly message
        let errorMessageForClient = 'An unexpected server error occurred during callback processing.';
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
                success: false,
                message: errorMessageForClient,
                details: errorDetailsForClient
            },
            { status: 500 }
        );
    }
}
