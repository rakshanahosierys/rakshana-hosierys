// app/api/phonepe-initiate-payment/route.js
import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/utlis/firebaseAdmin';

// Removed CryptoJS as X-VERIFY is no longer used with this API
// Removed PHONEPE_SALT_KEY and PHONEPE_SALT_INDEX as they are not used with this API

// Ensure these are defined in your environment variables (e.g., .env.local for dev, hosting provider for prod)
// PHONEPE_MERCHANT_ID is typically part of the credential response or implicitly linked to Client ID.
// The /checkout/v2/pay API doesn't explicitly require X-MERCHANT-ID header, but PhonePe might still need it in payload for specific cases.
// For now, let's keep it as it's often used for logging/identification.
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID; 
const PHONEPE_PAY_API_URL = process.env.PHONEPE_PAY_API_URL;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request) {
    try {
        console.log("DEBUG ENV VARS for Payment Initiation:");
        console.log("PHONEPE_MERCHANT_ID:", PHONEPE_MERCHANT_ID);
        console.log("PHONEPE_PAY_API_URL:", PHONEPE_PAY_API_URL);
        console.log("NEXT_PUBLIC_BASE_URL:", NEXT_PUBLIC_BASE_URL);

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ message: 'Order ID is required.' }, { status: 400 });
        }

        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }

        const orderData = orderSnap.data();

        if (orderData.paymentStatus && (orderData.paymentStatus === 'Paid' || orderData.paymentStatus === 'Failed')) {
            return NextResponse.json({ message: 'Order is not in a pending payment state.' }, { status: 400 });
        }

        const amountInPaisa = Math.round(orderData.totalAmount * 100);
        
        // This is the merchantOrderId for the PhonePe API, it should be unique for each order.
        // The /checkout/v2/pay API documentation uses 'merchantOrderId' directly in the payload.
        // It's good practice to ensure this is unique per payment attempt if you allow retries.
        const phonePeMerchantOrderId = `PPO_${orderId}_${Date.now()}`; // Example: PhonePe Order ID + timestamp

        // 1. Get Access Token from your new API route
        const tokenFetchUrl = `${NEXT_PUBLIC_BASE_URL}/api/phonepe-auth-token`;
        console.log("Attempting to fetch token from:", tokenFetchUrl);
        const tokenResponse = await fetch(tokenFetchUrl, {
            method: 'POST', // Call your internal token acquisition API route
        });

        // --- NEW LOGGING ADDED HERE ---
        console.log("Token API Response Status:", tokenResponse.status);
        console.log("Token API Response Status Text:", tokenResponse.statusText);
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("Raw Token API Error Response (HTML/Text):", errorText.substring(0, 500) + "..."); // Log first 500 chars
            return NextResponse.json(
                { message: 'Failed to acquire PhonePe access token (internal API error).', details: `Status: ${tokenResponse.status}, Details: ${errorText.substring(0, 200)}...` },
                { status: 500 }
            );
        }
        // --- END NEW LOGGING ---

        const tokenData = await tokenResponse.json();

        if (!tokenData.accessToken) {
            console.error("Failed to get access token from internal API (no accessToken in response):", tokenData);
            return NextResponse.json(
                { message: 'Failed to acquire PhonePe access token (missing token).', details: tokenData.details || 'Unknown token error.' },
                { status: 500 }
            );
        }
        const accessToken = tokenData.accessToken;
        console.log("PhonePe Access Token acquired (first 10 chars):", accessToken.substring(0, 10) + "...");


        // 2. Update the order in Firestore with the new PhonePe merchantOrderId and set status to 'Initiated'
        // This 'phonePeMerchantOrderId' is what you'll use to check status later with PhonePe
        await orderRef.update({
            phonePeMerchantOrderId: phonePeMerchantOrderId, // Storing the ID used with PhonePe
            paymentStatus: 'Initiated',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Order ${orderId} payment initiated with PhonePe merchantOrderId: ${phonePeMerchantOrderId}`);

        // 3. Construct the payment payload for PhonePe's /checkout/v2/pay API
        const paymentPayload = {
            merchantOrderId: phonePeMerchantOrderId, // As per /checkout/v2/pay documentation
            amount: amountInPaisa,
            expireAfter: 300, // Optional: 1200 seconds (20 minutes), Min=300, Max=3600
            metaInfo: {
                udf1: orderId, // Can pass original order ID here for your reference
                udf2: orderData.userId, // Customer user ID
                // ... add other relevant meta information as needed (udf1-5 available)
            },
            paymentFlow: {
                type: 'PG_CHECKOUT',
                message: `Payment for Order ${orderId}`, // Message shown on PhonePe page
                merchantUrls: {
                    redirectUrl: `${NEXT_PUBLIC_BASE_URL}/order-processing?orderId=${orderId}&phonepe_txnid=${phonePeMerchantOrderId}` // User's browser redirect after payment
                }
            }
            // paymentModeConfig: { ... } // Optional: to enable/disable specific payment modes
            // Refer to PhonePe docs for structure if you need to control payment modes.
        };

        console.log("PhonePe Request Payload:", JSON.stringify(paymentPayload, null, 2));
        console.log("PhonePe Pay API URL:", PHONEPE_PAY_API_URL);

        // 4. Send the payment initiation request to PhonePe with Authorization header
        const phonePeResponse = await fetch(PHONEPE_PAY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${accessToken}`, // OAuth 2.0 Token
                'accept': 'application/json',
                // The /checkout/v2/pay documentation doesn't mention X-MERCHANT-ID header, but good to keep in mind if issues arise.
                // 'X-MERCHANT-ID': PHONEPE_MERCHANT_ID, 
            },
            body: JSON.stringify(paymentPayload), // Send the JSON payload directly
        });

        const phonePeData = await phonePeResponse.json();
        console.log("PhonePe API Response:", phonePeData);

        if (phonePeResponse.ok && phonePeData.redirectUrl) {
            const redirectUrl = phonePeData.redirectUrl; // Get redirectUrl from the new response structure
            return NextResponse.json({ redirectUrl }); // Send the PhonePe redirect URL back to the client
        } else {
            // Log PhonePe's error details for debugging
            console.error("PhonePe initiation failed:", phonePeData);
            return NextResponse.json({
                message: 'Failed to initiate PhonePe payment.',
                details: phonePeData.message || phonePeData.code || 'Unknown error from PhonePe'
            }, { status: phonePeResponse.status || 500 }); // Use PhonePe's status code if available
        }

    } catch (error) {
        console.error('Error in PhonePe initiate payment API:', error);

        let errorMessageForClient = 'An unexpected server error occurred.';
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
