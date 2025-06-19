// app/api/phonepe-initiate-payment/route.js
import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/utlis/firebaseAdmin';

import CryptoJS from 'crypto-js'; // For SHA256 hashing

// Ensure these are defined in your environment variables (e.g., .env.local for dev, hosting provider for prod)
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_PAY_API_URL = process.env.PHONEPE_PAY_API_URL;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request) {
    try {
        // Log environment variables for debugging in production logs
        console.log("DEBUG ENV VARS:");
        console.log("PHONEPE_MERCHANT_ID:", PHONEPE_MERCHANT_ID);
        console.log("PHONEPE_SALT_KEY:", PHONEPE_SALT_KEY);
        console.log("PHONEPE_SALT_INDEX:", PHONEPE_SALT_INDEX);
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

        const merchantTransactionId = `T${orderId}_${Date.now()}`;
        const merchantUserId = orderData.userId || `MUID${orderId}`;

        await orderRef.update({
            merchantTransactionId: merchantTransactionId,
            paymentStatus: 'Initiated',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Order ${orderId} payment initiated with merchantTransactionId: ${merchantTransactionId}`);

        const paymentPayload = {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: merchantUserId,
            amount: amountInPaisa,
            redirectUrl: `${NEXT_PUBLIC_BASE_URL}/order-processing?orderId=${orderId}&phonepe_txnid=${merchantTransactionId}`,
            redirectMode: 'REDIRECT',
            callbackUrl: `${NEXT_PUBLIC_BASE_URL}/api/phonepe-callback`,
            mobileNumber: orderData.customerDetails?.phone || '9999999999',
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const payloadString = JSON.stringify(paymentPayload);
        const base64Payload = Buffer.from(payloadString).toString('base64');

        const hashString = base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY;
        const hash = CryptoJS.SHA256(hashString).toString();
        const xVerify = hash + '###' + PHONEPE_SALT_INDEX;

        console.log("PhonePe Request Payload (Base64):", base64Payload);
        console.log("X-Verify Header:", xVerify);
        console.log("PhonePe Pay API URL:", PHONEPE_PAY_API_URL);

        const phonePeResponse = await fetch(PHONEPE_PAY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
                'accept': 'application/json'
            },
            body: JSON.stringify({
                request: base64Payload
            }),
        });

        const phonePeData = await phonePeResponse.json();
        console.log("PhonePe API Response:", phonePeData);

        if (phonePeData.success && phonePeData.data && phonePeData.data.instrumentResponse && phonePeData.data.instrumentResponse.redirectInfo && phonePeData.data.instrumentResponse.redirectInfo.url) {
            const redirectUrl = phonePeData.data.instrumentResponse.redirectInfo.url;
            return NextResponse.json({ redirectUrl });
        } else {
            console.error("PhonePe initiation failed:", phonePeData);
            return NextResponse.json({ message: 'Failed to initiate PhonePe payment.', details: phonePeData.message || 'Unknown error from PhonePe' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in PhonePe initiate payment API:', error);

        // --- IMPROVED ERROR HANDLING START ---
        let errorMessageForClient = 'An unexpected server error occurred.';
        let errorDetailsForClient = 'No specific details available.';

        if (error instanceof Error) {
            errorMessageForClient = error.message;
            errorDetailsForClient = error.stack || error.message; // Capture stack for more detail
        } else if (typeof error === 'object' && error !== null) {
            // If it's an object but not an Error instance (e.g., a plain object from a failed fetch)
            try {
                errorMessageForClient = JSON.stringify(error);
                errorDetailsForClient = JSON.stringify(error);
            } catch (stringifyErr) {
                // Fallback if stringify fails
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
        // --- IMPROVED ERROR HANDLING END ---
    }
}
