// app/api/phonepe-callback/route.js
import { NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/utlis/firebaseConfig';
import CryptoJS from 'crypto-js';

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

const PHONEPE_API_BASE_URL = "https://api.phonepe.com/apis/hermes"; // Production API URL

export async function POST(request) {
  try {
    const callbackBody = await request.json(); // PhonePe sends JSON via POST callback
    console.log("PhonePe Callback Received:", callbackBody);

    // IMPORTANT: Verify the checksum (X-VERIFY header) from PhonePe
    const xVerifyHeader = request.headers.get('X-VERIFY');
    const expectedXVerify = CryptoJS.SHA256(JSON.stringify(callbackBody) + PHONEPE_SALT_KEY).toString() + '###' + PHONEPE_SALT_INDEX;

    if (xVerifyHeader !== expectedXVerify) {
        console.error("Checksum mismatch from PhonePe callback! Possible tampering.");
        // Redirect to an error page or generic orders page
        return NextResponse.redirect(new URL('/my-account-orders?paymentStatus=security_error', request.url), 302);
    }


    const { code, merchantId, transactionId, merchantTransactionId } = callbackBody;

    // 1. Verify the payment status with PhonePe's Status API (CRITICAL for security)
    // Do NOT rely solely on the callback `code` for final status.
    const statusCheckUrl = `${PHONEPE_API_BASE_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;
    const statusHash = CryptoJS.SHA256(`/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}` + PHONEPE_SALT_KEY).toString();
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
        redirectPath = `/my-account-orders-details/${merchantTransactionId.split('-')[0].substring(1)}`; // Extract original orderId
    } else {
        newPaymentStatus = 'Failed';
        redirectPath = `/my-account-orders?paymentStatus=failed&orderId=${merchantTransactionId.split('-')[0].substring(1)}`;
    }

    // 2. Update your Firestore order document based on the VERIFIED status
    const originalOrderId = merchantTransactionId.split('-')[0].substring(1); // Extract your original order ID
    const orderRef = doc(db, "orders", originalOrderId);
    await updateDoc(orderRef, {
      paymentStatus: newPaymentStatus,
      phonePeTransactionId: transactionId, // PhonePe's internal transaction ID
      phonePeCallbackResponse: callbackBody, // Store the full callback for debugging
      phonePeStatusResponse: statusData, // Store the full status check response
      updatedAt: new Date(),
    });

    // 3. Redirect the user's browser
    return NextResponse.redirect(new URL(redirectPath, request.url), 302);

  } catch (error) {
    console.error('Error in PhonePe callback API:', error);
    // On error, redirect to a generic error page or orders list
    return NextResponse.redirect(new URL('/my-account-orders?paymentStatus=error', request.url), 302);
  }
}