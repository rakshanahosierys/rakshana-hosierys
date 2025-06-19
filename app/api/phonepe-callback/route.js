// app/api/phonepe-callback/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/utlis/firebaseAdmin'; // <-- CORRECT: IMPORT ADMIN DB HERE
// import { doc, updateDoc } from 'firebase/firestore'; // REMOVE: You don't need this `doc` and `updateDoc` from client-side Firestore
//                                                       // Use admin.firestore().collection().doc().update() instead
import CryptoJS from 'crypto-js';

// REMOVE THESE LINES: You don't need to import 'firebase-admin' globally here
// and you cannot destructure 'adminDoc'/'adminUpdateDoc' directly from 'adminDb' like this.
// const admin = require('firebase-admin');
// const { doc: adminDoc, updateDoc: adminUpdateDoc } = adminDb;

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

// PRODUCTION API URL for status check.
// This is the correct base for production status check.
// Make sure this matches PhonePe's latest production status check endpoint.
const PHONEPE_API_BASE_URL = "https://api.phonepe.com/apis/hermes"; // This is for general services.
// The status check endpoint is usually different.
// For production, the status check might be: https://api.phonepe.com/apis/pg-ind/pg/v1/status
// For UAT, it's: https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status
// It's safer to have separate environment variables for the different API URLs.
const PHONEPE_STATUS_CHECK_API_URL = process.env.PHONEPE_STATUS_CHECK_API_URL || "https://api.phonepe.com/apis/pg-ind/pg/v1/status"; // Add this to your .env

export async function POST(request) {
    try {
        const callbackBody = await request.json(); // PhonePe sends JSON in the body
        console.log("PhonePe Callback Received:", callbackBody);

        // --- 1. Checksum Verification of the Callback ---
        // PhonePe's callback X-VERIFY is usually a hash of the response payload, NOT a full request body.
        // It should be: SHA256(Base64_Encoded_Response + /pg/v1/status/{merchantId}/{merchantTransactionId} + SALT_KEY) + ### + SALT_INDEX
        // The format of the incoming callback X-VERIFY header varies by integration type (Pay Page vs. server-to-server).
        // Let's assume for a standard webhook, PhonePe sends the base64 encoded payload in the `response` field.
        // **IMPORTANT**: You need to refer to PhonePe's *specific webhook/callback documentation* for the exact checksum calculation on incoming callbacks.
        // The checksum for incoming callbacks might be calculated differently from outgoing requests.
        // Based on PhonePe's current documentation, the X-VERIFY for a POST callback has a structure where
        // `X-VERIFY = SHA256(BASE64_Encoded_Payload + SALT_KEY) + "###" + SALT_INDEX`
        // However, the `callbackBody` here is already JSON. If PhonePe sends the *raw* JSON,
        // then your current SHA256(JSON.stringify(callbackBody) + PHONEPE_SALT_KEY) might be correct,
        // but often they send the payload base64 encoded *within* the callback `response` field,
        // or the checksum includes the endpoint path.

        // Let's assume `callbackBody.response` is the base64 encoded string from PhonePe
        // And the X-VERIFY for callback is SHA256(Base64_response_from_phonepe + SALT_KEY) + '###' + SALT_INDEX
        // **YOU MUST CONFIRM THIS WITH PHONEPE'S DOCS for the specific webhook setup**
        // For simplicity, let's assume your current hash for `JSON.stringify(callbackBody)` is what they expect,
        // but be prepared to adjust if their docs say otherwise (e.g., they send a `response` field that needs decoding).

        const receivedPayload = JSON.stringify(callbackBody); // Assuming the received body is what needs hashing
        const calculatedXVerify = CryptoJS.SHA256(receivedPayload + PHONEPE_SALT_KEY).toString() + '###' + PHONEPE_SALT_INDEX;
        const xVerifyHeader = request.headers.get('X-VERIFY');

        console.log("Expected X-VERIFY:", calculatedXVerify);
        console.log("Received X-VERIFY:", xVerifyHeader);

        if (xVerifyHeader !== calculatedXVerify) {
            console.error("Checksum mismatch from PhonePe callback! Possible tampering. Received:", xVerifyHeader, "Expected:", calculatedXVerify);
            // DO NOT REDIRECT YET - This is a server-to-server call.
            // You should respond with an error status (e.g., 401 Unauthorized) to PhonePe.
            return NextResponse.json({ success: false, message: 'Checksum Mismatch' }, { status: 401 });
        }

        // --- 2. Extract Data from Callback ---
        // PhonePe's callback usually contains the `code` (e.g., PAYMENT_SUCCESS), `merchantId`,
        // `transactionId` (PhonePe's ID), and `merchantTransactionId` (your ID).
        const { code, merchantId, transactionId, merchantTransactionId } = callbackBody;

        if (!merchantTransactionId) {
             console.error("Missing merchantTransactionId in PhonePe callback.");
             return NextResponse.json({ success: false, message: 'Missing merchantTransactionId' }, { status: 400 });
        }

        // Extract the original orderId from your merchantTransactionId format: T{Date.now()}_{orderId.substring(0, 8)}
        // The original order ID is everything after 'T' and before '_'.
        // Let's refine this to safely extract.
        const parts = merchantTransactionId.split('_');
        const originalOrderId = parts.length > 1 ? parts[1] : null; // Get the part after the first underscore

        if (!originalOrderId) {
            console.error(`Could not extract originalOrderId from merchantTransactionId: ${merchantTransactionId}`);
            return NextResponse.json({ success: false, message: 'Invalid merchantTransactionId format' }, { status: 400 });
        }

        // --- 3. Server-to-Server Status Check (Crucial for Reliability) ---
        // Even if the callback says success, always do a server-to-server check.
        // Construct the URL and hash for the status check API.
        const statusCheckEndpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;
        const statusHashString = statusCheckEndpoint + PHONEPE_SALT_KEY; // Hash the endpoint path + salt key
        const statusHash = CryptoJS.SHA256(statusHashString).toString();
        const statusXVerify = statusHash + '###' + PHONEPE_SALT_INDEX;

        const statusCheckUrl = `${PHONEPE_STATUS_CHECK_API_URL}/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;
        console.log(`Performing status check on: ${statusCheckUrl}`);

        const statusResponse = await fetch(statusCheckUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', // Can be omitted for GET, but generally good practice
                'X-VERIFY': statusXVerify,
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
            },
        });

        const statusData = await statusResponse.json();
        console.log("PhonePe Status API Response:", statusData);

        let newPaymentStatus;
        let finalRedirectPath; // Renamed to avoid confusion with internal variables

        if (statusData.success && statusData.code === 'PAYMENT_SUCCESS') {
            newPaymentStatus = 'Paid'; // Use 'Paid' for successful payments
            finalRedirectPath = `/my-account-orders-details/${originalOrderId}`;
        } else {
            newPaymentStatus = 'Failed';
            // It's good to pass the originalOrderId back for the user to retry or view details
            finalRedirectPath = `/my-account-orders?paymentStatus=failed&orderId=${originalOrderId}`;
        }

        // --- 4. Update Order Status in Firestore (Using Admin SDK) ---
        const orderRef = adminDb.collection("orders").doc(originalOrderId);
        await orderRef.update({
            paymentStatus: newPaymentStatus,
            phonePeTransactionId: transactionId, // PhonePe's transaction ID
            phonePeCallbackResponse: callbackBody, // Store the raw callback for debugging
            phonePeStatusResponse: statusData,     // Store the raw status response for debugging
            updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
            // You might want to add more fields like:
            // paymentGateway: 'PhonePe',
            // amountPaid: statusData.data.amount / 100, // Convert paise back to INR if needed
        });
        console.log(`Order ${originalOrderId} payment status updated to: ${newPaymentStatus}`);


        // --- 5. Redirect User ---
        // This is a server-to-server callback. You should respond with a 200 OK to PhonePe first.
        // The user is already on a redirect page from PhonePe, which should either be
        // your `NEXT_PUBLIC_PHONEPE_REDIRECT_URL` or a PhonePe page.
        // Your client-side `order-processing/page.js` then picks up the query params
        // or a similar mechanism to direct the user.

        // If PhonePe expects a client-side redirect directly from this API endpoint
        // (which is less common for webhooks but sometimes used in specific flows),
        // then the `NextResponse.redirect` would be correct.
        // However, for a *webhook*, PhonePe expects a 200 OK response to acknowledge receipt.
        // The redirect should primarily be handled on the client-side (`NEXT_PUBLIC_PHONEPE_REDIRECT_URL`).

        // For a typical webhook, you should respond to PhonePe with a success JSON.
        // The user's browser should be redirected to the `redirectUrl` you provided
        // in the *initial payment initiation API call*.

        // Let's assume you're using this API Route as the `callbackUrl` in the initial PhonePe request,
        // and PhonePe will then redirect the user to your `redirectUrl`.
        // In that case, this `callback` should not redirect the user's browser.
        // Instead, it should just confirm the status update to PhonePe's server.

        // Option 1: Respond to PhonePe (typical webhook)
        return NextResponse.json({ success: true, message: 'Callback processed' }, { status: 200 });

        // Option 2: If this *is* the final user redirect endpoint (less common for webhooks)
        // return NextResponse.redirect(new URL(finalRedirectPath, request.url), 302);

    } catch (error) {
        console.error('Error in PhonePe callback API:', error);
        // Respond to PhonePe with a non-200 status code for errors
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}