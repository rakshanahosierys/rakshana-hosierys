// app/api/phonepe-callback/route.js

// Import necessary Next.js and Firebase Admin modules
import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/utlis/firebaseAdmin'; // Assuming '@/utlis/firebaseAdmin' correctly exports initialized admin SDK
import CryptoJS from 'crypto-js'; // Import CryptoJS for SHA256 hashing

// Environment variables: Crucial for security and configuration.
// Ensure these are defined in your environment (e.g., .env.local for dev, hosting provider for prod).
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_STATUS_CHECK_API_URL = process.env.PHONEPE_STATUS_CHECK_API_URL;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// New environment variables for webhook authentication (configured in PhonePe dashboard)
const PHONEPE_WEBHOOK_USERNAME = process.env.PHONEPE_WEBHOOK_USERNAME;
const PHONEPE_WEBHOOK_PASSWORD = process.env.PHONEPE_WEBHOOK_PASSWORD;

/**
 * Handles the POST request from PhonePe's webhook.
 * This route receives server-to-server notifications about payment and refund status changes.
 * It verifies the webhook's authenticity, performs an authoritative server-to-server (S2S)
 * status check with PhonePe, and updates your order database accordingly.
 * @param {Request} request - The incoming Next.js API request object (from PhonePe webhook).
 * @returns {NextResponse} - JSON response indicating success or failure to PhonePe.
 */
export async function POST(request) {
    try {
        // 1. Log the incoming callback body for debugging.
        const callbackBody = await request.json();
        console.log("PhonePe Callback Received:", JSON.stringify(callbackBody, null, 2));

        // --- Webhook Authorization Header Verification (CRITICAL FOR SECURITY) ---
        // Verify the Authorization header sent by PhonePe to ensure the webhook is legitimate.
        if (PHONEPE_WEBHOOK_USERNAME && PHONEPE_WEBHOOK_PASSWORD) {
            const receivedAuthHeader = request.headers.get('Authorization');
            console.log("Received Auth Header:", receivedAuthHeader);

            if (!receivedAuthHeader) {
                console.error("Webhook: Missing Authorization header.");
                return NextResponse.json({ success: false, message: 'Unauthorized - Missing Authorization Header' }, { status: 401 });
            }

            // Calculate the expected SHA256 hash of "username:password" as per PhonePe's documentation.
            // Documentation implies the entire header value *is* this hash: "Authorization : SHA256(username:password)"
            const expectedAuthString = `${PHONEPE_WEBHOOK_USERNAME}:${PHONEPE_WEBHOOK_PASSWORD}`;
            const calculatedAuthHash = CryptoJS.SHA256(expectedAuthString).toString();

            if (receivedAuthHeader !== calculatedAuthHash) {
                console.error("Webhook: Authorization header mismatch! Possible unauthorized access. Received:", receivedAuthHeader, "Expected (SHA256 hash of username:password):", calculatedAuthHash);
                return NextResponse.json({ success: false, message: 'Unauthorized - Invalid Authorization Header' }, { status: 401 });
            }
            console.log("Webhook: Authorization header successfully verified.");
        } else {
            console.warn("Webhook: PHONEPE_WEBHOOK_USERNAME or PHONEPE_WEBHOOK_PASSWORD not configured. Skipping webhook authorization header verification. This is INSECURE for production environments. Please configure these variables.");
        }
        // --- END Webhook Authorization Header Verification ---

        // 2. Extract Data from Callback Body
        // PhonePe's webhook typically sends 'event', 'payload', etc.
        const { event, payload } = callbackBody;

        if (!payload || !payload.merchantOrderId || !payload.state || !event) {
            console.error("Missing critical data in PhonePe callback payload.", { event, payload });
            return NextResponse.json({ success: false, message: 'Missing critical payload data' }, { status: 400 });
        }

        const { merchantOrderId, state, transactionId, errorCode, detailedErrorCode, originalMerchantOrderId: payloadOriginalMerchantOrderId } = payload;

        // Determine the original order ID from the merchantOrderId (set during initiation)
        // Format: PPO_YOURORDERID_TIMESTAMP
        const parts = merchantOrderId.split('_');
        const originalOrderId = parts.length >= 2 ? parts[1] : null;

        if (!originalOrderId) {
            console.error(`Could not extract originalOrderId from merchantOrderId: ${merchantOrderId}`);
            return NextResponse.json({ success: false, message: 'Invalid merchantOrderId format' }, { status: 400 });
        }

        // 3. Get Access Token for Server-to-Server Status Check
        const tokenFetchUrl = `${NEXT_PUBLIC_BASE_URL}/api/phonepe-auth-token`; // Call your internal token acquisition API
        console.log("Callback: Attempting to fetch token from:", tokenFetchUrl);
        const tokenResponse = await fetch(tokenFetchUrl, {
            method: 'POST',
        });

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


        // 4. Server-to-Server Status Check (Crucial for Reliability)
        // Perform an S2S check using the merchantOrderId to get the most authoritative status.
        const statusCheckUrl = `${PHONEPE_STATUS_CHECK_API_URL}/${PHONEPE_MERCHANT_ID}/${merchantOrderId}`;
        console.log(`Callback: Performing S2S status check on: ${statusCheckUrl}`);

        const statusResponse = await fetch(statusCheckUrl, {
            method: 'GET', // Status check API typically uses GET
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${accessToken}`, // Use the acquired OAuth token
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID, // Merchant ID header as required by PhonePe status API
            },
        });

        const statusData = await statusResponse.json();
        console.log("Callback: PhonePe Status API Response (S2S Check):", JSON.stringify(statusData, null, 2));

        // 5. Determine New Status and Update Order in Firestore
        const updateData = {
            phonePeCallbackResponse: callbackBody, // Store the raw webhook body for auditing
            phonePeStatusResponse: statusData,     // Store the raw S2S status check response
            updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Update timestamp
        };

        // Initialize status fields to null to ensure they are set only when applicable
        let newPaymentStatus = null;
        let newRefundStatus = null;

        // Use the 'event' parameter to determine the type of update
        switch (event) {
            case 'checkout.order.completed':
                newPaymentStatus = 'Paid';
                break;
            case 'checkout.order.failed':
                newPaymentStatus = 'Failed';
                break;
            case 'pg.refund.accepted':
                newRefundStatus = 'Accepted';
                break;
            case 'pg.refund.completed':
                newRefundStatus = 'Completed';
                break;
            case 'pg.refund.failed':
                newRefundStatus = 'Failed';
                break;
            default:
                console.warn(`Webhook: Unhandled event type received: ${event}`);
                // If an unhandled event, try to derive payment status from S2S or payload.state as a fallback
                if (statusData.success && statusData.code === 'PAYMENT_SUCCESS') {
                    newPaymentStatus = 'Paid';
                } else if (statusData.code === 'PAYMENT_PENDING') {
                    newPaymentStatus = 'Pending';
                } else if (state) { // Fallback to payload.state if no S2S success/pending
                    newPaymentStatus = state === 'COMPLETED' ? 'Paid' : (state === 'FAILED' ? 'Failed' : 'Pending');
                }
                break;
        }

        // Apply determined statuses
        if (newPaymentStatus) {
            updateData.paymentStatus = newPaymentStatus;
        }
        if (newRefundStatus) {
            updateData.refundStatus = newRefundStatus;
        }

        // Capture transaction ID and error codes from payload or S2S data
        updateData.phonePeTransactionId = payload.paymentDetails?.[0]?.transactionId || statusData.data?.transactionId || null;
        if (errorCode) updateData.errorCode = errorCode;
        if (detailedErrorCode) updateData.detailedErrorCode = detailedErrorCode;
        
        // Log consistency if S2S state doesn't match webhook payload state
        if (statusData.data?.state && statusData.data.state !== state) {
            console.warn(`Webhook: S2S state (${statusData.data.state}) inconsistent with webhook payload state (${state}) for order ${originalOrderId}. Relying on webhook payload state for update as per documentation.`);
        }

        // Update the order document in Firestore
        const orderRef = adminDb.collection("orders").doc(originalOrderId);
        await orderRef.update(updateData);
        console.log(`Callback: Order ${originalOrderId} updated. New paymentStatus: ${newPaymentStatus}, New refundStatus: ${newRefundStatus}`);


        // 6. Respond to PhonePe (Important for Webhook Confirmation)
        // PhonePe expects a 200 OK response to confirm successful receipt and processing of the webhook.
        // This prevents PhonePe from retrying the webhook.
        return NextResponse.json({ success: true, message: 'Callback processed' }, { status: 200 });

    } catch (error) {
        // Centralized error handling for unexpected issues during callback processing.
        console.error('Error in PhonePe callback API:', error);

        let errorMessageForClient = 'An unexpected server error occurred during callback processing.';
        let errorDetailsForClient = 'No specific details available.';

        // Attempt to extract more specific error information.
        if (error instanceof Error) {
            errorMessageForClient = error.message;
            errorDetailsForClient = error.stack || error.message;
        } else if (typeof error === 'object' && error !== null) {
            try {
                // If it's an object, try to stringify it for logging.
                errorMessageForClient = JSON.stringify(error);
                errorDetailsForClient = JSON.stringify(error);
            } catch (stringifyErr) {
                // Fallback if stringification fails.
                errorMessageForClient = "An unstringifiable object error occurred.";
                errorDetailsForClient = "Original error could not be stringified.";
            }
        } else if (typeof error === 'string') {
            // If it's a simple string error.
            errorMessageForClient = error;
            errorDetailsForClient = error;
        }

        // Return a 500 response to PhonePe if an error occurs.
        // This might cause PhonePe to retry the webhook later.
        return NextResponse.json(
            {
                success: false,
                message: errorMessageForClient,
                details: errorDetailsForClient // In production, consider limiting error details sent back.
            },
            { status: 500 }
        );
    }
}
