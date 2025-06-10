"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "@/utlis/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link"; // Import Link component

// OrderDetails now accepts 'orderId' as a prop
export default function OrderDetails({ orderId }) { // Receive orderId as a prop
  const [activeTab, setActiveTab] = useState('itemDetails');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Log the orderId received by the component
      console.log("OrderDetails component received orderId:", orderId);

      if (!orderId) {
        setLoading(false);
        setError("Order ID not provided or found in URL."); // More precise error
        return; // Exit early if no orderId
      }

      console.log("Attempting to fetch order with ID:", orderId);
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
          setError(null); // Clear any previous errors on success
        } else {
          setError("Order not found in database.");
          setOrder(null); // Ensure order is null if not found
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(`Failed to load order details: ${err.message || 'Unknown error'}`);
        setOrder(null); // Ensure order is null on error
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if orderId is available and we are still loading or order is null
    // This prevents re-fetching if order is already loaded successfully
    if (orderId && (loading || order === null)) {
      fetchOrderDetails();
    } else if (!orderId && loading) { // Handle case where orderId might be undefined on initial render
      setLoading(false);
      setError("Order ID not available.");
    }
  }, [orderId, loading, order]); // Depend on orderId, loading, and order to re-evaluate

  // --- Tab Management ---
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // --- Loading, Error, and Not Found States (Order of checks is crucial) ---
  if (loading) {
    return (
      <div className="wd-form-order">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wd-form-order">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  // This check is now the final fallback. If we reach here, and order is still null,
  // it means loading is false, no error, but no order was found/set.
  if (!order) {
    return (
      <div className="wd-form-order">
        <p>No order data available. Please check the order ID.</p>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  // Define product variable if it exists for the main image/details
  const firstProduct = order.products?.[0]; // Safe to access now because 'order' is guaranteed to be not null

  return (
    <div className="wd-form-order">
      <div className="order-head">
        <figure className="img-product">
          {/* Conditionally render Image only if firstProduct exists */}
          {firstProduct ? (
            <Image
              alt={firstProduct.title || "product"} // Use product.title as per Checkout.js structure
              src={firstProduct.imgSrc || "/images/products/brown.jpg"} // Use product.imgSrc as per Checkout.js structure
              width={720}
              height={1005}
            />
          ) : (
            // Fallback if no product data is available
            <Image
              alt="No product image"
              src="/images/products/placeholder.jpg" // A generic placeholder
              width={720}
              height={1005}
            />
          )}
        </figure>
        <div className="content">
          {/* Now safe to access order.orderStatus */}
          <div className="badge">{order.orderStatus || 'N/A'}</div>
          <h6 className="mt-8 fw-5">Order #{order.id?.substring(0, 8)}...</h6>
        </div>
      </div>
      <div className="tf-grid-layout md-col-2 gap-15">
        <div className="item">
          <div className="text-2 text_black-2">Receiver</div>
          <div className="text-2 mt_4 fw-6">{order.customerDetails.name || 'N/A'}</div> {/* Use firstProduct */}
        </div>
        <div className="item">
          <div className="text-2 text_black-2">Total Price</div>
          <div className="text-2 mt_4 fw-6">₹{order.finalAmount.toFixed(2) || 'N/A'}</div> {/* Use firstProduct */}
        </div>
        <div className="item">
          <div className="text-2 text_black-2">Order Date</div>
          <div className="text-2 mt_4 fw-6">{formatDate(order.createdAt)}</div>
        </div>
        <div className="item">
          <div className="text-2 text_black-2">Shipping Address</div>
          <div className="text-2 mt_4 fw-6">
            {order.customerDetails ? (
              <>
                {order.customerDetails.address}, {order.customerDetails.city},<br />
                {order.customerDetails.country}
              </>
            ) : 'N/A'}
          </div>
        </div>
      </div>

      <div className="widget-tabs style-has-border widget-order-tab">
        <ul className="widget-menu-tab">
          <li className={`item-title ${activeTab === 'itemDetails' ? 'active' : ''}`} onClick={() => handleTabClick('itemDetails')}>
            <span className="inner">Item Details</span>
          </li>
          <li className={`item-title ${activeTab === 'orderHistory' ? 'active' : ''}`} onClick={() => handleTabClick('orderHistory')}>
            <span className="inner">Order History</span>
          </li>
          <li className={`item-title ${activeTab === 'courierInfo' ? 'active' : ''}`} onClick={() => handleTabClick('courierInfo')}>
            <span className="inner">Courier Info</span>
          </li>
          <li className={`item-title ${activeTab === 'receiverInfo' ? 'active' : ''}`} onClick={() => handleTabClick('receiverInfo')}>
            <span className="inner">Receiver Info</span>
          </li>
        </ul>

        <div className="widget-content-tab">
          {activeTab === 'itemDetails' && (
            <div className="widget-content-inner active">
              {order.products && order.products.length > 0 ? (
                order.products.map((product, index) => (
                  <div key={index} className="order-head" style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    <figure className="img-product">
                      <Image
                        alt={product.title || "product"}
                        src={product.imgSrc || "/images/products/placeholder.jpg"}
                        width={720}
                        height={1005}
                        style={{ objectFit: 'cover' }}
                      />
                    </figure>
                    <div className="content">
                      <Link href={`/product-detail/${product.productId}`} passHref>
                        <div className="text-2 fw-6 cursor-pointer hover:underline">{product.title}</div>
                      </Link>
                      <div className="mt_4">
                        <span className="fw-6">Price :</span> ₹{product.priceAtPurchase?.toFixed(2) || '0.00'}
                      </div>
                      <div className="mt_4">
                        <span className="fw-6">Quantity :</span> {product.quantity || 1}
                      </div>
                      {product.selectedSize && (
                        <div className="mt_4">
                          <span className="fw-6">Size :</span> {product.selectedSize}
                        </div>
                      )}
                      {product.selectedColor && (
                        <div className="mt_4">
                          <span className="fw-6">Color :</span> {product.selectedColor.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No product details available.</p>
              )}

              <ul>
                <li className="d-flex justify-content-between text-2">
                  <span>Total Price</span>
                  <span className="fw-6">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                </li>
                <li className="d-flex justify-content-between text-2 mt_8">
                  <span>Discount</span>
                  <span className="fw-6">₹{order.discountAmount?.toFixed(2) || '0.00'}</span>
                </li>
                <li className="d-flex justify-content-between text-2 mt_8">
                  <span>Order Total</span>
                  <span className="fw-6">₹{order.finalAmount?.toFixed(2) || '0.00'}</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'orderHistory' && (
            <div className="widget-content-inner active">
              <div className="widget-timeline">
                <ul className="timeline">
                  {order.statusHistory && order.statusHistory.length > 0 ? (
                    order.statusHistory.map((historyItem, index) => (
                      <li key={index}>
                        <div className={`timeline-badge ${historyItem.status === 'Delivered' ? 'success' : ''}`} />
                        <div className="timeline-box">
                          <div className="timeline-panel">
                            <div className="text-2 fw-6">{historyItem.status}</div>
                            <span>{formatDate(historyItem.timestamp)}</span>
                          </div>
                          {historyItem.details && <p>{historyItem.details}</p>}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li><p>No order history available.</p></li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'courierInfo' && (
            <div className="widget-content-inner active">
              {order.courierInfo ? (
                <>
                  <p>
                    <strong>Courier Service: </strong> {order.courierInfo.serviceName || 'N/A'}
                  </p>
                  <p>
                    <strong>Tracking Number: </strong> {order.courierInfo.trackingNumber || 'N/A'}
                  </p>
                  <p>
                    <strong>Tracking Link: </strong>
                    {order.courierInfo.trackingLink ? (
                      <a href={order.courierInfo.trackingLink} target="_blank" rel="noopener noreferrer">
                        Track your package
                      </a>
                    ) : 'N/A'}
                  </p>
                  <p>
                    Our courier service is dedicated to providing fast, reliable, and
                    secure delivery solutions tailored to meet your needs. Whether
                    you're sending documents, parcels, or larger shipments, our team
                    ensures that your items are handled with the utmost care and
                    delivered on time. With a commitment to customer satisfaction,
                    real-time tracking, and a wide network of routes, we make it easy
                    for you to send and receive packages both locally and
                    internationally. Choose our service for a seamless and efficient
                    delivery experience.
                  </p>
                </>
              ) : (
                <p>Courier information not available for this order yet.</p>
              )}
            </div>
          )}

          {activeTab === 'receiverInfo' && (
            <div className="widget-content-inner active">
              <p className="text-2 text_success">
                Thank you! Your order has been received.
              </p>
              <ul className="mt_20">
                <li>
                  Order Number: <span className="fw-7">#{order.id?.substring(0, 8)}...</span>
                </li>
                <li>
                  Date: <span className="fw-7">{formatDate(order.createdAt)}</span>
                </li>
                <li>
                  Total: <span className="fw-7">₹{order.finalAmount?.toFixed(2) || '0.00'}</span>
                </li>
                <li>
                  Payment Method: <span className="fw-7">{order.paymentMethod || 'N/A'}</span>
                </li>
                {order.customerDetails && (
                  <>
                    <li>
                      Receiver Name: <span className="fw-7">{order.customerDetails.name || 'N/A'}</span>
                    </li>
                    <li>
                      Phone: <span className="fw-7">{order.customerDetails.phone || 'N/A'}</span>
                    </li>
                    <li>
                      Email: <span className="fw-7">{order.customerDetails.email || 'N/A'}</span>
                    </li>
                    <li>
                      Address: <span className="fw-7">{order.customerDetails.address}, {order.customerDetails.city}</span>
                    </li>
                    <li>
                      <span className="fw-7">{order.customerDetails.country}</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
      <p className="text-2 text_red-1">
        Note: Please contact us within 48 hours of order confirmation to cancel the order.
      </p>
    </div>
  );
}