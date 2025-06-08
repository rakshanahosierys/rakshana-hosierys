// app/api/phonepe-callback/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/utlis/firebaseAdmin'; // <-- IMPORT ADMIN DB HERE
import { doc, updateDoc } from 'firebase/firestore'; // You don't need this `doc` and `updateDoc` from client-side Firestore
                                                     // Use admin.firestore().collection().doc().update() instead
import CryptoJS from 'crypto-js';

// Import the specific methods from firebase-admin's firestore namespace
// This is how you access Firestore methods via the Admin SDK
const admin = require('firebase-admin'); // Import admin here if you need other services
const { doc: adminDoc, updateDoc: adminUpdateDoc } = adminDb; // You can't directly import these like this.
                                                            // You access them via adminDb instance.

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

const PHONEPE_API_BASE_URL = "https://api.phonepe.com/apis/hermes"; // Production API URL

export async function POST(request) {
    try {
        const callbackBody = await request.json();
        console.log("PhonePe Callback Received:", callbackBody);

        const xVerifyHeader = request.headers.get('X-VERIFY');
        const expectedXVerify = CryptoJS.SHA256(JSON.stringify(callbackBody) + PHONEPE_SALT_KEY).toString() + '###' + PHONEPE_SALT_INDEX;

        if (xVerifyHeader !== expectedXVerify) {
            console.error("Checksum mismatch from PhonePe callback! Possible tampering.");
            return NextResponse.redirect(new URL('/my-account-orders?paymentStatus=security_error', request.url), 302);
        }

        const { code, merchantId, transactionId, merchantTransactionId } = callbackBody;

        const statusCheckUrl = `<span class="math-inline">\{PHONEPE\_API\_BASE\_URL\}/pg/v1/status/</span>{PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;
        const statusHash = CryptoJS.SHA256(`/pg/v1/status/<span class="math-inline">\{PHONEPE\_MERCHANT\_ID\}/</span>{merchantTransactionId}` + PHONEPE_SALT_KEY).toString();
        const statusXVerify = statusHash + '###' + PHONEPE_SALT_INDEX;

        const statusResponse = await fetch(statusCheckUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': statusXVerify,
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
            },
        });

        const statusData = await statusResponse.json();
        console.log("PhonePe Status API Response:", statusData);

        let newPaymentStatus;
        let redirectPath;

        if (statusData.success && statusData.code === 'PAYMENT_SUCCESS') {
            newPaymentStatus = 'Completed';
            redirectPath = `/my-account-orders-details/${merchantTransactionId.split('-')[0].substring(1)}`;
        } else {
            newPaymentStatus = 'Failed';
            redirectPath = `/my-account-orders?paymentStatus=failed&orderId=${merchantTransactionId.split('-')[0].substring(1)}`;
        }

        // Use adminDb for Firestore operations
        const originalOrderId = merchantTransactionId.split('-')[0].substring(1);
        const orderRef = adminDb.collection("orders").doc(originalOrderId); // Admin SDK way to get a doc ref
        await orderRef.update({ // Admin SDK way to update a document
            paymentStatus: newPaymentStatus,
            phonePeTransactionId: transactionId,
            phonePeCallbackResponse: callbackBody,
            phonePeStatusResponse: statusData,
            updatedAt: new Date(),
        });

        return NextResponse.redirect(new URL(redirectPath, request.url), 302);

    } catch (error) {
        console.error('Error in PhonePe callback API:', error);
        return NextResponse.redirect(new URL('/my-account-orders?paymentStatus=error', request.url), 302);
    }
}