// app/api/phonepe-initiate-payment/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/utlis/firebaseAdmin'; // <--- IMPORT ADMIN DB HERE
// Remove the client-side imports:
// import { doc, getDoc, updateDoc } from 'firebase/firestore'; // NO LONGER NEEDED
// import { db } from '@/utlis/firebaseConfig'; // NO LONGER NEEDED

import CryptoJS from 'crypto-js'; // For SHA256 hashing
import { v4 as uuidv4 } from 'uuid'; // For generating unique transaction IDs if needed

// Ensure these are defined in your .env.local
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1'; // Default to 1 if not set
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const PHONEPE_API_BASE_URL = "https://api.phonepe.com/apis/hermes"; // For production
// For testing/development, you might use: "https://api-preprod.phonepe.com/apis/pg-sandbox"

export async function POST(request) {
  try {
    const { orderId } = await request.json(); // Only need orderId from client

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required.' }, { status: 400 });
    }

    // 1. Fetch order details from Firestore to get the accurate amount and status
    // Use adminDb for Firestore interactions
    const orderRef = adminDb.collection('orders').doc(orderId); // Admin SDK way
    const orderSnap = await orderRef.get(); // Admin SDK way

    if (!orderSnap.exists) { // Admin SDK uses .exists, not .exists()
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    const orderData = orderSnap.data(); // Admin SDK uses .data()

    // Ensure order is in a state ready for payment (e.g., 'Pending')
    if (orderData.paymentStatus && orderData.paymentStatus !== 'Pending') {
      return NextResponse.json({ message: 'Order is not in a pending payment state.' }, { status: 400 });
    }

    const amountInPaisa = Math.round(orderData.totalAmount * 100); // PhonePe expects amount in paisa

    // Generate a unique transaction ID for PhonePe
    // It's good practice to use your orderId or a derivative of it for easier tracking
    const merchantTransactionId = `T${orderId}-${Date.now()}`; // Example: T_yourOrderId_timestamp

    // Update the order in Firestore with the new PhonePe transaction ID and set status to 'Initiated'
    await orderRef.update({ // Admin SDK way to update
      merchantTransactionId: merchantTransactionId, // Store the PhonePe transaction ID
      paymentStatus: 'Initiated', // Mark as initiated
      updatedAt: new Date(),
    });

    const paymentPayload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      amount: amountInPaisa,
      redirectUrl: `${NEXT_PUBLIC_BASE_URL}/api/phonepe-callback`, // Your server callback
      redirectMode: 'POST',
      callbackUrl: `${NEXT_PUBLIC_BASE_URL}/api/phonepe-callback`, // Same as redirect for consistency
      mobileNumber: orderData.customerDetails?.phone || '9999999999', // Customer's mobile number
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const payloadString = JSON.stringify(paymentPayload);
    const base64Payload = Buffer.from(payloadString).toString('base64');

    // Generate SHA256 checksum
    const hash = CryptoJS.SHA256(base64Payload + PHONEPE_SALT_KEY).toString();
    const xVerify = hash + '###' + PHONEPE_SALT_INDEX;

    console.log("PhonePe Request Payload (Base64):", base64Payload);
    console.log("X-Verify Header:", xVerify);

    const phonePeResponse = await fetch(`${PHONEPE_API_BASE_URL}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
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
      // Log PhonePe's error details for debugging
      console.error("PhonePe initiation failed:", phonePeData);
      return NextResponse.json({ message: 'Failed to initiate PhonePe payment.', details: phonePeData.message || 'Unknown error' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in PhonePe initiate payment API:', error);
    return NextResponse.json({ message: 'Internal server error.', details: error.message || 'Unknown error' }, { status: 500 });
  }
}