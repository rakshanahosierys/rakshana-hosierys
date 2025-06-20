"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore"; // Changed from getDoc to onSnapshot
import { db } from "@/utlis/firebaseConfig"; // Your Firestore instance
import Header7 from "@/components/headers/Header7";
import Footer1 from "@/components/footers/Footer1";
import ToolbarBottom from "@/components/modals/ToolbarBottom";

export default function OrderProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId"); // Get orderId from query parameter
  const phonepeTxnId = searchParams.get("phonepe_txnid"); // Get PhonePe transaction ID from query parameter (for reference)

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false); // State for when *this page* is handling initiation/redirection

  // --- Firestore Real-time Listener ---
  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found in URL. Cannot process payment.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const orderRef = doc(db, "orders", orderId);

    // Set up real-time listener
    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists()) {
        const orderData = { id: docSnap.id, ...docSnap.data() };
        setOrder(orderData);
        setLoading(false);

        // --- Handle Payment Status Changes based on real-time data ---
        // This is where the core logic for redirection after payment completion happens
        if (orderData.paymentStatus === 'Paid') {
          console.log(`Order ${orderData.id} is Paid. Redirecting to order details.`);
          router.replace(`/my-account-orders-details/${orderData.id}`);
        } else if (orderData.paymentStatus === 'Failed') {
          console.log(`Order ${orderData.id} is Failed. Redirecting to orders page.`);
          router.replace(`/my-account-orders?paymentStatus=failed&orderId=${orderData.id}`);
        } else if (orderData.paymentStatus === 'Cancelled') {
          // Handle explicit cancellation if you have that status
          router.replace(`/my-account-orders?paymentStatus=cancelled&orderId=${orderData.id}`);
        }
        // If 'Pending' or 'Initiated', the component will proceed to try and initiate payment
        // or show a "payment in progress" message if already initiated.

      } else {
        setError("Order not found in database.");
        setLoading(false);
      }
    }, (err) => {
      console.error("Error listening to order details:", err);
      setError("Failed to load order details. Please try again.");
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [orderId, router]); // Dependency array: re-run if orderId or router changes

  // --- PhonePe Payment Initiation Function ---
  const initiatePhonePePayment = async () => {
    // Only initiate if order data is loaded, not already processing, and payment status is Pending
    if (!order || processingPayment || order.paymentStatus !== 'Pending') {
        console.log("Payment initiation skipped:", { order, processingPayment, paymentStatus: order?.paymentStatus });
        return;
    }

    setProcessingPayment(true); // Indicate that payment initiation is in progress
    setError(null); // Clear any previous errors

    try {
      console.log("Calling /api/phonepe-initiate-payment for order:", order.id);
      const response = await fetch('/api/phonepe-initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await response.json();
      console.log("Response from /api/phonepe-initiate-payment:", data);

      if (response.ok && data.redirectUrl) {
        // Redirect user to PhonePe gateway
        console.log("Redirecting to PhonePe:", data.redirectUrl);
        window.location.href = data.redirectUrl;
        // setProcessingPayment(false); // No need to set false, as we're leaving the page
      } else {
        // If API call was OK but no redirectUrl, or API call failed
        setError(data.message || 'Failed to initiate PhonePe payment.');
        console.error("Payment initiation failed or no redirect URL:", data);
        setProcessingPayment(false); // Allow re-attempt if user wishes
      }
    } catch (err) {
      console.error("Client-side error initiating PhonePe payment:", err);
      setError("Payment initiation failed due to network or unexpected error. Please try again.");
      setProcessingPayment(false); // Allow re-attempt
    }
  };

  // --- Effect to trigger payment initiation or handle status when order data updates ---
  useEffect(() => {
    // Automatically initiate payment if order is loaded, status is 'Pending', and not already trying to redirect
    if (order && order.paymentStatus === 'Pending' && !processingPayment) {
      initiatePhonePePayment();
    }
    // If status is 'Initiated', keep showing processing message or a retry option
    // The `onSnapshot` handles redirects for 'Paid' and 'Failed'
  }, [order, processingPayment]); // Depend on 'order' object and 'processingPayment' state

  // --- UI Rendering based on states ---
  if (loading) {
    return (
      <>
        <Header7 />
        <div className="tf-page-title"><div className="container-full"><div className="heading text-center">Loading Payment Details</div></div></div>
        <section className="flat-spacing-11">
          <div className="container text-center">
            <p className="mt-4">Loading order details for payment...</p>
            <p>Please wait.</p>
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
            <p style={{ color: "red", fontWeight: "bold" }}>Error: {error}</p>
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

  // If order is loaded and no immediate redirect occurred for Paid/Failed/Cancelled
  // Display processing message if initiating or already initiated
  if (processingPayment || order.paymentStatus === 'Initiated') {
    return (
      <>
        <Header7 />
        <div className="tf-page-title"><div className="container-full"><div className="heading text-center">Payment in Progress</div></div></div>
        <section className="flat-spacing-11">
          <div className="container text-center">
            <p className="mt-4">
              {processingPayment ? 'Redirecting to PhonePe...' : 'Payment initiated. Please check PhonePe app or wait for status update.'}
            </p>
            <p>Please do not close this window. You will be redirected after payment.</p>
            {/* Optional: Add a button to manually retry or go back if stuck */}
            {!processingPayment && (
                <button onClick={initiatePhonePePayment} className="tf-btn btn-fill mt-4">
                    Retry Payment
                </button>
            )}
          </div>
        </section>
        <Footer1 />
        <ToolbarBottom />
      </>
    );
  }

  // Fallback UI if order is loaded but status is not Pending/Initiated/Paid/Failed
  // This state should ideally not be reached if all status transitions are handled
  return (
    <>
      <Header7 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Order Payment Status</div>
        </div>
      </div>
      <section className="flat-spacing-11">
        <div className="container">
          <div className="payment-summary bg-gray-100 p-6 rounded-lg shadow-md">
            <h5 className="text-2xl font-semibold mb-4">Order Summary</h5>
            <p className="text-lg mb-2">Order ID: <span className="font-medium">{order.id}</span></p>
            <p className="text-lg mb-2">Total Amount: <span className="font-medium">₹{order.totalAmount?.toFixed(2) || '0.00'}</span></p>
            <p className="text-lg mb-4">Current Status: <span className="font-medium">{order.orderStatus} / {order.paymentStatus}</span></p>
            <p className="text-xl font-semibold mt-6 mb-4">
              Unhandled Order Status: {order.paymentStatus}. Please contact support.
            </p>
            <button
                onClick={() => router.push('/my-account-orders')}
                className="tf-btn btn-fill animate-hover-btn justify-content-center w-full md:w-auto"
            >
                Back to Orders
            </button>
          </div>
        </div>
      </section>
      <Footer1 />
      <ToolbarBottom />
    </>
  );
}
