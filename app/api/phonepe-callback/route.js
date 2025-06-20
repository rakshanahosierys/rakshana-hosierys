// app/api/phonepe-callback/route.js
import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/utlis/firebaseAdmin';
import CryptoJS from 'crypto-js'; // Import CryptoJS for SHA256 hashing

// Ensure these are defined in your environment variables (e.g., .env.local for dev, hosting provider for prod)
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_STATUS_CHECK_API_URL = process.env.PHONEPE_STATUS_CHECK_API_URL;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// New environment variables for webhook authentication
const PHONEPE_WEBHOOK_USERNAME = process.env.PHONEPE_WEBHOOK_USERNAME;
const PHONEPE_WEBHOOK_PASSWORD = process.env.PHONEPE_WEBHOOK_PASSWORD;

export async function POST(request) {
    try {
        const callbackBody = await request.json();
        console.log("PhonePe Callback Received:", JSON.stringify(callbackBody, null, 2));

        // --- NEW: Webhook Authorization Header Verification ---
        if (PHONEPE_WEBHOOK_USERNAME && PHONEPE_WEBHOOK_PASSWORD) {
            const receivedAuthHeader = request.headers.get('Authorization');
            console.log("Received Auth Header:", receivedAuthHeader);

            if (!receivedAuthHeader) {
                console.error("Webhook: Missing Authorization header.");
                return NextResponse.json({ success: false, message: 'Unauthorized - Missing Authorization Header' }, { status: 401 });
            }

            const expectedAuthString = `${PHONEPE_WEBHOOK_USERNAME}:${PHONEPE_WEBHOOK_PASSWORD}`;
            const calculatedAuthHash = CryptoJS.SHA256(expectedAuthString).toString();
            const expectedAuthHeader = `SHA256 ${calculatedAuthHash}`; // PhonePe documentation states 'SHA256(username:password)' as the header value

            // PhonePe documentation example: Authorization : SHA256(username:password)
            // It might literally be 'SHA256 <hash>' or just '<hash>'. Double check.
            // Let's assume 'SHA256 <hash>' format based on "PhonePe will pass the authorization header as :"
            
            // Note: The doc says "SHA256(username:password) as the “Authorization” header in s2s response"
            // This might mean the *entire* header value is just the hash, or it's prefixed like "SHA256 <hash>".
            // The provided doc is ambiguous here. If it's just the hash, remove "SHA256 " prefix.
            // We will compare against "SHA256 <hash>" and also fallback to just "<hash>" if first fails.

            let isAuthValid = false;
            if (receivedAuthHeader === expectedAuthHeader) {
                isAuthValid = true;
            } else if (receivedAuthHeader === calculatedAuthHash) { // Fallback for just hash
                isAuthValid = true;
                console.warn("Webhook: Received Authorization header without 'SHA256 ' prefix, but hash matched.");
            }

            if (!isAuthValid) {
                console.error("Webhook: Authorization header mismatch! Possible unauthorized access. Received:", receivedAuthHeader, "Expected (SHA256):", expectedAuthHeader);
                return NextResponse.json({ success: false, message: 'Unauthorized - Invalid Authorization Header' }, { status: 401 });
            }
            console.log("Webhook: Authorization header successfully verified.");
        } else {
            console.warn("Webhook: PHONEPE_WEBHOOK_USERNAME or PHONEPE_WEBHOOK_PASSWORD not configured. Skipping webhook authorization header verification. Ensure this is intentional for your environment.");
        }
        // --- END NEW: Webhook Authorization Header Verification ---


        // --- 2. Extract Data from Callback ---
        const { code, transactionId, merchantOrderId } = callbackBody;

        if (!merchantOrderId) {
            console.error("Missing merchantOrderId in PhonePe callback.");
            return NextResponse.json({ success: false, message: 'Missing merchantOrderId' }, { status: 400 });
        }

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
            method: 'POST',
        });

        console.log("Callback: Token API Response Status:", tokenResponse.status);
        console.log("Callback: Token API Response Status Text:", tokenResponse.statusText);
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("Callback: Raw Token API Error Response (HTML/Text):", errorText.substring(0, 500) + "...");
            return NextResponse.json(
                { success: false, message: 'Failed to acquire PhonePe access token (internal API error during callback).', details: `Status: ${tokenResponse.status}, Details: ${errorText.substring(0, 200)}...` },
                { status: tokenResponse.status || 500 }
            );
        }

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
        const statusCheckUrl = `${PHONEPE_STATUS_CHECK_API_URL}/${PHONEPE_MERCHANT_ID}/${merchantOrderId}`;
        console.log(`Callback: Performing status check on: ${statusCheckUrl}`);

        const statusResponse = await fetch(statusCheckUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${accessToken}`,
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
            },
        });

        const statusData = await statusResponse.json();
        console.log("Callback: PhonePe Status API Response:", JSON.stringify(statusData, null, 2));

        let newPaymentStatus;
        if (statusData.success && statusData.code === 'PAYMENT_SUCCESS') {
            newPaymentStatus = 'Paid';
        } else if (statusData.code === 'PAYMENT_PENDING') {
            newPaymentStatus = 'Pending';
        } else {
            newPaymentStatus = 'Failed';
        }

        // --- 5. Update Order Status in Firestore (Using Admin SDK) ---
        const orderRef = adminDb.collection("orders").doc(originalOrderId);
        await orderRef.update({
            paymentStatus: newPaymentStatus,
            phonePeTransactionId: transactionId || statusData.data?.transactionId || null,
            phonePeCallbackResponse: callbackBody,
            phonePeStatusResponse: statusData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Callback: Order ${originalOrderId} payment status updated to: ${newPaymentStatus}`);

        // --- 6. Respond to PhonePe (typical webhook) ---
        return NextResponse.json({ success: true, message: 'Callback processed' }, { status: 200 });

    } catch (error) {
        console.error('Error in PhonePe callback API:', error);
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
