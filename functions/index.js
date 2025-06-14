const functions = require('firebase-functions');
const admin = require('firebase-admin');
const next = require("next");

// Initialize Firebase Admin SDK once when the function starts
// This is crucial for interacting with Firestore, Auth, etc.
admin.initializeApp();

const db = admin.firestore(); // Get a reference to the Firestore database

/**
 * Cloud Function to process a secure checkout order.
 * This is a Callable Cloud Function, which means it can be directly called from your frontend
 * using the Firebase SDK, and it automatically handles authentication.
 *
 * @param {Object} data - The data sent from the client (e.g., cart items, customer details).
 * @param {Array<Object>} data.cartItems - Array of product objects from the cart.
 * @param {string} data.cartItems[].productId - The ID of the product.
 * @param {number} data.cartItems[].quantity - The quantity of the product.
 * @param {Object} data.cartItems[].selectedColor - The selected color object.
 * @param {string} data.cartItems[].selectedSize - The selected size string.
 * @param {string} data.cartItems[].name - The title/name of the product.
 * @param {Object} data.customerDetails - Customer's billing/shipping details.
 * @param {string} data.customerDetails.name - Combined first and last name of the customer.
 * @param {string} data.customerDetails.email - Email of the customer (from authenticated user).
 * @param {string} data.customerDetails.phone - Phone number.
 * @param {string} data.customerDetails.address - Street address.
 * @param {string} data.customerDetails.city - City.
 * @param {string} data.customerDetails.state - State.
 * @param {string} data.customerDetails.pinCode - PIN code.
 * @param {string} data.customerDetails.country - Country.
 * @param {string} data.paymentMethod - The chosen payment method (e.g., 'bank', 'delivery').
 * @param {string} [data.notes] - Optional order notes.
 * @param {string} [data.couponCode] - Optional coupon code entered by the user.
 * @param {Object} context - The context of the call, including authentication information.
 */
exports.processSecureCheckout = functions.https.onCall(async (data, context) => {
    console.log("processSecureCheckout function called.");

    // 1. Authentication Check
    // context.auth will be populated if the user is signed in on the client side
    // and Firebase Authentication sends a valid ID token with the request.
    if (!context.auth) {
        console.error("Authentication failed: context.auth is null or undefined. User is not logged in.");
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The request requires user authentication to place an order.'
        );
    }

    const uid = context.auth.uid; // Get the authenticated user's UID
    const userEmail = context.auth.token.email; // Get the user's email from the token
    console.log("User is authenticated. UID:", uid);
    // console.log("Auth token details:", JSON.stringify(context.auth.token, null, 2)); // Uncomment for more token details if needed

    // 2. Log incoming data (safe to stringify data as it should not have circular references)
    console.log("Request data:", JSON.stringify(data, null, 2));

    // 3. Basic Data Validation for incoming request (more robust validation can be added)
    const { cartItems, customerDetails, paymentMethod, notes, couponCode } = data;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        console.error("Invalid cartItems received:", cartItems);
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Cart items are missing or invalid.'
        );
    }
    if (!customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address || !customerDetails.city || !customerDetails.state || !customerDetails.pinCode || !customerDetails.country) {
        console.error("Invalid or incomplete customerDetails received:", customerDetails);
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Customer details (name, email, phone, address, city, state, pincode, country) are missing or invalid.'
        );
    }
    if (!paymentMethod) {
        console.error("Payment method missing.");
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Payment method is missing.'
        );
    }

    try {
        // --- START: Your Core Order Processing Logic ---

        let totalCalculatedSubtotal = 0;
        let appliedCouponDiscountAmount = 0;
        const productsForOrder = [];

        // Fetch product details from Firestore to validate prices and other info
        for (const item of cartItems) {
            const productId = item.productId;
            const quantity = item.quantity;
            const selectedColor = item.selectedColor;
            const selectedSize = item.selectedSize;
            const productName = item.name; // Product name from frontend

            if (!productId || typeof quantity !== 'number' || quantity <= 0) {
                throw new functions.https.HttpsError("invalid-argument", `Invalid product item or quantity provided: ${JSON.stringify(item)}`);
            }
            if (!selectedColor || !selectedSize) {
                throw new functions.https.HttpsError("invalid-argument", `Product ${productName || productId} missing color or size information.`);
            }

            const productRef = db.collection("products").doc(productId);
            const productSnap = await productRef.get();

            if (!productSnap.exists) {
                console.error(`Product with ID ${productId} not found in database.`);
                throw new functions.https.HttpsError("not-found", `Product "${productName || productId}" not found.`);
            }

            const productData = productSnap.data();

            // Validate product data structure from Firestore
            if (typeof productData.price !== 'number' || productData.price < 0) {
                console.error(`Product ${productId} has invalid price:`, productData.price);
                throw new functions.https.HttpsError("internal", `Invalid price data for product "${productName || productId}".`);
            }

            // Calculate price considering discount from backend data
            const discountPercentage = typeof productData.discount === 'number' && productData.discount >= 0 && productData.discount <= 100
                ? productData.discount
                : 0;
            const currentPriceAtPurchase = productData.price - (productData.price * discountPercentage / 100);

            totalCalculatedSubtotal += currentPriceAtPurchase * quantity;

            productsForOrder.push({
                productId: productId,
                title: productName, // Use name from frontend, or productData.title if available
                quantity: quantity,
                priceAtPurchase: currentPriceAtPurchase,
                selectedColor: selectedColor,
                selectedSize: selectedSize,
                imgSrc: productData.imgSrc || 'placeholder_image_url', // Ensure you have a fallback or actual image
            });
        }

        // 4. Validate and Apply Coupon (if provided)
        if (couponCode) {
            const normalizedCouponCode = couponCode.trim().toUpperCase();
            const couponRef = db.collection("coupons").doc(normalizedCouponCode);
            const couponSnap = await couponRef.get();

            if (couponSnap.exists) {
                const couponData = couponSnap.data();

                if (couponData.expiresAt && couponData.expiresAt.toDate() < new Date()) {
                    throw new functions.https.HttpsError("invalid-argument", "Coupon has expired.");
                }
                if (couponData.minPurchase && totalCalculatedSubtotal < couponData.minPurchase) {
                    throw new functions.https.HttpsError("invalid-argument", `Coupon requires a minimum purchase of ₹${couponData.minPurchase.toFixed(2)}.`);
                }

                if (couponData.type === "percentage" && typeof couponData.value === 'number') {
                    appliedCouponDiscountAmount = totalCalculatedSubtotal * (couponData.value / 100);
                } else if (couponData.type === "fixed" && typeof couponData.value === 'number') {
                    appliedCouponDiscountAmount = couponData.value;
                } else {
                    throw new functions.https.HttpsError("invalid-argument", "Invalid coupon type or value.");
                }

                // Ensure discount doesn't exceed subtotal
                appliedCouponDiscountAmount = Math.min(appliedCouponDiscountAmount, totalCalculatedSubtotal);

                // (Optional) Mark coupon as used or increment usage count if applicable
                // Consider using a transaction for this if it must be atomic with order creation
            } else {
                throw new functions.https.HttpsError("invalid-argument", "Invalid coupon code provided.");
            }
        }

        // 5. Calculate the final order total
        const finalAmount = totalCalculatedSubtotal - appliedCouponDiscountAmount;
        if (finalAmount < 0) {
            console.error("Calculated final amount is negative. This should not happen:", finalAmount);
            throw new functions.https.HttpsError("internal", "Order calculation error. Please try again.");
        }

        // 6. Create the Order Document
        const orderId = db.collection('orders').doc().id; // Generate ID before batch for client return

        const orderDocument = {
            orderId: orderId,
            userId: uid,
            customerEmail: userEmail, // From context.auth.token
            customerDetails: customerDetails, // Use the validated customerDetails from request
            products: productsForOrder, // Use server-side validated products
            totalAmount: totalCalculatedSubtotal, // Subtotal before discount
            discountAmount: appliedCouponDiscountAmount,
            finalAmount: finalAmount, // Final amount after discount
            couponCode: couponCode || null,
            paymentMethod: paymentMethod,
            notes: notes || null,
            orderStatus: "Pending", // Initial status
            paymentStatus: paymentMethod === "delivery" ? "COD" : "Pending", // COD or Pending for bank transfer
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Use a batch write for atomicity if you had multiple writes (e.g., stock updates)
        // For a single document, set() is fine, but batch is good practice for future expansion.
        const batch = db.batch();
        const orderRef = db.collection('orders').doc(orderId);
        batch.set(orderRef, orderDocument);

        await batch.commit();
        console.log(`Order ${orderId} successfully saved to Firestore for user ${uid}.`);

        // --- END: Your Core Order Processing Logic ---

        // 7. Return success response to the client
        return {
            orderId: orderId,
            message: "Order placed successfully!",
            finalAmount: finalAmount,
            status: 'success'
        };

    } catch (error) {
        console.error("Error during order processing:", error);

        // Re-throw as an HttpsError to send a clean error message back to the client
        if (error instanceof functions.https.HttpsError) {
            throw error; // Re-throw if it's already an HttpsError
        } else {
            // For unexpected errors, return a generic internal error message
            throw new functions.https.HttpsError(
                'internal',
                `An unexpected error occurred during order processing: ${error.message}`,
                { originalError: error.message } // Optional: send original error for client debugging
            );
        }
    }
});