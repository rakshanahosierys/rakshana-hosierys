// app/order-processing/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/utlis/firebaseConfig"; // Your Firestore instance
import Header7 from "@/components/headers/Header7";
import Footer1 from "@/components/footers/Footer1";
import ToolbarBottom from "@/components/modals/ToolbarBottom";

export default function OrderProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId"); // Get orderId from query parameter

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID not found in URL. Cannot process payment.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Order not found in database.");
        }
      } catch (err) {
        console.error("Error fetching order details for payment:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Removed simulatePaymentSuccess and simulatePaymentFailure as we're now doing real integration
  // You can keep them for testing purposes if you wish, but they won't be used for PhonePe flow.

  // --- REAL PHONEPE INITIATION ---
  const initiatePhonePePayment = async () => {
    if (!order || processingPayment) return;

    setProcessingPayment(true);
    setError(null);

    try {
      // Call your Next.js API Route to initiate payment
      const response = await fetch('/api/phonepe-initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }), // Only send orderId, amount fetched server-side
      });

      const data = await response.json();
      console.log(data);

      if (response.ok && data.redirectUrl) {
        // Redirect user to PhonePe gateway
        window.location.href = data.redirectUrl;
      } else {
        setError(data.message || 'Failed to initiate PhonePe payment.');
        setProcessingPayment(false);
      }
    } catch (err) {
      console.error("Error initiating PhonePe payment:", err);
      setError("Payment initiation failed. Please try again.");
      setProcessingPayment(false);
    }
  };

  // Automatically initiate payment once order is loaded and not already processing
  useEffect(() => {
    if (order && !loading && !error && !processingPayment && order.paymentStatus === 'Pending') {
      initiatePhonePePayment();
    }
    // If order payment status is already Initiated or Completed, redirect immediately
    if (order && !loading && !error && order.paymentStatus === 'Initiated') {
        // This scenario might happen if the user returns to the page after initiating but before callback
        // You might want to display a "Payment in progress..." message or redirect back to orders.
        // For simplicity, we'll try to initiate again, or let the callback handle it.
        // Or perhaps even redirect to orders if status is 'Initiated' and some time has passed.
    }
    if (order && !loading && !error && order.paymentStatus === 'Paid') {
        router.replace(`/my-account-orders-details/${order.id}`);
    }
    if (order && !loading && !error && order.paymentStatus === 'Failed') {
        router.replace(`/my-account-orders?paymentStatus=failed`);
    }
  }, [order, loading, error, processingPayment, router]);


  if (loading || processingPayment) {
    return (
      <>
        <Header7 />
        <div className="tf-page-title"><div className="container-full"><div className="heading text-center">Payment Processing</div></div></div>
        <section className="flat-spacing-11">
          <div className="container text-center">
            <p className="mt-4">
                {processingPayment ? 'Redirecting to PhonePe...' : 'Loading order details for payment...'}
            </p>
            <p>Please do not close this window.</p>
          </div>
        </section>
        <Footer1 />
        <ToolbarBottom />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header7 />
        <div className="tf-page-title"><div className="container-full"><div className="heading text-center">Payment Error</div></div></div>
        <section className="flat-spacing-11">
          <div className="container text-center">
            <p style={{ color: "red" }}>{error}</p>
            <button onClick={() => router.push('/my-account-orders')} className="tf-btn btn-fill mt-4">
              Back to Orders
            </button>
          </div>
        </section>
        <Footer1 />
        <ToolbarBottom />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header7 />
        <div className="tf-page-title"><div className="container-full"><div className="heading text-center">Order Not Found</div></div></div>
        <section className="flat-spacing-11">
          <div className="container text-center">
            <p>The order you are trying to pay for was not found.</p>
            <button onClick={() => router.push('/my-account-orders')} className="tf-btn btn-fill mt-4">
              Back to Orders
            </button>
          </div>
        </section>
        <Footer1 />
        <ToolbarBottom />
      </>
    );
  }

  // This part of the UI will typically not be seen by the user if auto-redirect works
  return (
    <>
      <Header7 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Process Payment for Order #{order.id?.substring(0, 8)}...</div>
        </div>
      </div>
      <section className="flat-spacing-11">
        <div className="container">
          <div className="payment-summary bg-gray-100 p-6 rounded-lg shadow-md">
            <h5 className="text-2xl font-semibold mb-4">Order Summary</h5>
            <p className="text-lg mb-2">Order ID: <span className="font-medium">{order.id}</span></p>
            <p className="text-lg mb-2">Total Amount: <span className="font-medium">₹{order.totalAmount?.toFixed(2) || '0.00'}</span></p>
            <p className="text-lg mb-4">Current Status: <span className="font-medium">{order.orderStatus} / {order.paymentStatus}</span></p>

            <p className="text-xl font-semibold mt-6 mb-4">Initiating payment with PhonePe...</p>
            <button
                onClick={initiatePhonePePayment} // Allow manual re-initiation if needed
                disabled={processingPayment}
                className="tf-btn btn-fill animate-hover-btn justify-content-center w-full md:w-auto"
            >
                {processingPayment ? 'Redirecting...' : 'Click to Redirect (if not automatic)'}
            </button>
            <p className="text-sm text-gray-600 mt-4">
              If you are not redirected automatically, please click the button above.
            </p>
          </div>
        </div>
      </section>
      <Footer1 />
      <ToolbarBottom />
    </>
  );
}