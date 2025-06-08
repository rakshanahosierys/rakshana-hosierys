"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth to get the current user
import { db } from "@/utlis/firebaseConfig"; // Import your Firestore instance
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"; // Firestore functions

export default function Orders() {
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Get user and auth status
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only attempt to fetch orders if the user is authenticated and not still loading auth state
    if (!authLoading && isAuthenticated && user) {
      setLoadingOrders(true);
      setError(null);

      const ordersCollectionRef = collection(db, "orders");
      const q = query(
        ordersCollectionRef,
        where("userId", "==", user.uid),
        // orderBy("createdAt", "desc") // Keep this if you have the index, otherwise remove and sort client-side
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort client-side if orderBy was removed due to indexing issues
        fetchedOrders.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));

        setOrders(fetchedOrders);
        setLoadingOrders(false);
      }, (err) => {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
        setLoadingOrders(false);
      });

      return () => unsubscribe();
    } else if (!authLoading && !isAuthenticated) {
      setOrders([]);
      setLoadingOrders(false);
    }
  }, [user, isAuthenticated, authLoading]);

  if (loadingOrders) {
    return (
      <div className="my-account-content account-order">
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-account-content account-order">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-account-content account-order">
        <div className="wrap-account-order">
          <p>You haven't placed any orders yet.</p>
          <Link href="/shop-default" className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center mt-4">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content account-order">
      <div className="wrap-account-order">
        <table>
          <thead>
            <tr>
              <th className="fw-6">Order</th>
              <th className="fw-6">Date</th>
              <th className="fw-6">Status</th>
              <th className="fw-6">Total</th>
              <th className="fw-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="tf-order-item">
                <td>{order.id.substring(0, 8)}...</td>
                <td>{order.createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                <td>{order.orderStatus}</td>
                <td>₹{order.totalAmount?.toFixed(2) || '0.00'} for {order.products?.length || 0} items</td>
                <td>
                  {order.paymentStatus === 'Pending' ? (
                    <Link
                      href={`/order-processing?orderId=${order.id}`}
                      className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
                    >
                      <span>Pay Now</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/my-account-orders-details/${order.id}`}
                      className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
                    >
                      <span>View</span>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}