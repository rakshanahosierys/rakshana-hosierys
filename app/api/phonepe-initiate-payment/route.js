// app/api/phonepe-initiate-payment/route.js
import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/utlis/firebaseAdmin'; // <-- CORRECT: IMPORT ADMIN DB HERE

// REMOVE THESE CLIENT-SIDE IMPORTS: They are not needed when using Firebase Admin SDK
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { db } from '@/utlis/firebaseConfig';

import CryptoJS from 'crypto-js'; // For SHA256 hashing
// import { v4 as uuidv4 } from 'uuid'; // v4 is not strictly necessary if using orderId directly or a custom format

// Ensure these are defined in your .env.local
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1'; // Default to 1 if not set

// IMPORTANT: Use specific environment variables for UAT and Production API URLs
// This ensures you don't accidentally use production credentials with UAT URLs or vice-versa.
// For UAT: https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay
// For Production: https://api.phonepe.com/apis/hermes/pg/v1/pay (or other specific production URL if PhonePe updates)
const PHONEPE_PAY_API_URL = process.env.PHONEPE_PAY_API_URL; // e.g., "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay" or "https://api.phonepe.com/apis/hermes/pg/v1/pay"

// Your base URL for callbacks/redirects. Must be publicly accessible in production.
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request) {
    try {
        console.log("DEBUG ENV VARS:");
        console.log("PHONEPE_MERCHANT_ID:", PHONEPE_MERCHANT_ID);
        console.log("PHONEPE_SALT_KEY:", PHONEPE_SALT_KEY);
        console.log("PHONEPE_SALT_INDEX:", PHONEPE_SALT_INDEX);
        console.log("PHONEPE_PAY_API_URL:", PHONEPE_PAY_API_URL);
        console.log("NEXT_PUBLIC_BASE_URL:", NEXT_PUBLIC_BASE_URL); 
        const { orderId } = await request.json(); // Only need orderId from client

        if (!orderId) {
            return NextResponse.json({ message: 'Order ID is required.' }, { status: 400 });
        }

        // 1. Fetch order details from Firestore to get the accurate amount and status
        const orderRef = adminDb.collection('orders').doc(orderId); // Admin SDK way to get a document reference
        const orderSnap = await orderRef.get(); // Admin SDK way to fetch the document

        if (!orderSnap.exists) { // Admin SDK uses .exists property, not a method .exists()
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }

        const orderData = orderSnap.data(); // Admin SDK uses .data() method to get the document data

        // Ensure order is in a state ready for payment (e.g., 'Pending' or 'Created')
        // You might have specific statuses that allow payment initiation.
        // It's crucial to prevent re-initiating payment for already paid/failed orders unless intended.
        if (orderData.paymentStatus && (orderData.paymentStatus === 'Paid' || orderData.paymentStatus === 'Failed')) {
            return NextResponse.json({ message: 'Order is not in a pending payment state.' }, { status: 400 });
        }

        const amountInPaisa = Math.round(orderData.totalAmount * 100); // PhonePe expects amount in paisa

        // 2. Generate a unique merchantTransactionId
        // Your current format `T{orderId}-{Date.now()}` is good, ensuring uniqueness and traceability.
        const merchantTransactionId = `T${orderId}_${Date.now()}`; // Example: T_yourOrderId_timestamp (using _ for consistency with callback route)
        // Ensure this ID is unique for each payment attempt, even for the same order.
        // PhonePe also expects `merchantUserId` which identifies the user initiating the transaction.
        // You should ideally get this from your authentication system (e.g., Firebase Auth UID).
        const merchantUserId = orderData.userId || `MUID${orderId}`; // Fallback, but use actual user ID if available

        // 3. Update the order in Firestore with the new PhonePe transaction ID and set status to 'Initiated'
        await orderRef.update({ // Admin SDK way to update a document
            merchantTransactionId: merchantTransactionId, // Store the PhonePe transaction ID
            paymentStatus: 'Initiated', // Mark as initiated
            updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp for accuracy
            // Consider storing the PhonePe initiation payload and response for debugging
            // phonePeInitiatePayload: paymentPayload, // Store the final payload sent
            // phonePeInitiateResponse: phonePeData, // Store PhonePe's initial response
        });
        console.log(`Order ${orderId} payment initiated with merchantTransactionId: ${merchantTransactionId}`);


        // 4. Construct the payment payload for PhonePe
        const paymentPayload = {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: merchantUserId, // Crucial: PhonePe often requires this
            amount: amountInPaisa,
            redirectUrl: `${NEXT_PUBLIC_BASE_URL}/order-processing?orderId=${orderId}&phonepe_txnid=${merchantTransactionId}`, // **YOUR CLIENT-SIDE REDIRECT URL**
            // Note: PhonePe documentation often states that `redirectUrl` is where the user's browser is redirected after payment.
            // And `callbackUrl` is the server-to-server webhook. They can be the same, but distinct naming helps.
            // The `redirectMode` should match your handling on the `redirectUrl`. 'POST' is common for webhooks.
            redirectMode: 'REDIRECT', // Most common for Pay Page. If you expect a POST, use 'POST'.
            // For `redirectMode: 'REDIRECT'`, PhonePe will send parameters as GET query params.
            // For `redirectMode: 'POST'`, PhonePe will send parameters in a POST request body.
            // Your `/api/phonepe-callback` endpoint is set up for POST.
            // It's better to make `redirectUrl` a client-side route that then checks status,
            // and `callbackUrl` your server-side webhook.
            // demo
            callbackUrl: `${NEXT_PUBLIC_BASE_URL}/api/phonepe-callback`, // Your server webhook callback
            mobileNumber: orderData.customerDetails?.phone || '9999999999', // Customer's mobile number (ensure it's valid)
            // You might add more details like `message`, `email`, `deviceContext`, etc.
            // based on your integration needs and PhonePe's docs.
            paymentInstrument: {
                type: 'PAY_PAGE' // Indicates redirection to PhonePe's hosted payment page
            }
        };

        const payloadString = JSON.stringify(paymentPayload);
        const base64Payload = Buffer.from(payloadString).toString('base64');

        // 5. Generate SHA256 checksum (X-VERIFY header)
        // Formula: SHA256(Base64 encoded payload + "/pg/v1/pay" + salt key) + ### + salt index
        const hashString = base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY;
        const hash = CryptoJS.SHA256(hashString).toString();
        const xVerify = hash + '###' + PHONEPE_SALT_INDEX;

        console.log("PhonePe Request Payload (Base64):", base64Payload);
        console.log("X-Verify Header:", xVerify);
        console.log("PhonePe Pay API URL:", PHONEPE_PAY_API_URL);

        // 6. Send the payment initiation request to PhonePe
        const phonePeResponse = await fetch(PHONEPE_PAY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
                'accept': 'application/json' // PhonePe often expects this for response type
            },
            body: JSON.stringify({
                request: base64Payload
            }),
        });

        const phonePeData = await phonePeResponse.json();
        console.log("PhonePe API Response:", phonePeData);

        if (phonePeData.success && phonePeData.data && phonePeData.data.instrumentResponse && phonePeData.data.instrumentResponse.redirectInfo && phonePeData.data.instrumentResponse.redirectInfo.url) {
            const redirectUrl = phonePeData.data.instrumentResponse.redirectInfo.url;
            return NextResponse.json({ redirectUrl }); // Send the PhonePe redirect URL back to the client
        } else {
            // Log PhonePe's error details for debugging
            console.error("PhonePe initiation failed:", phonePeData);
            return NextResponse.json({ message: 'Failed to initiate PhonePe payment.', details: phonePeData.message || 'Unknown error' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in PhonePe initiate payment API:', error);
        return NextResponse.json({ message: 'Internal server error.', details: error.message || 'Unknown error' }, { status: 500 });
    }
}