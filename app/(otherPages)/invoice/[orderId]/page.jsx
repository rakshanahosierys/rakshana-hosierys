'use client'; // Important for client-side hooks

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { db } from "@/utlis/firebaseConfig"; // Import your Firestore instance
// No import for 'Order' type here, as it's a JS file

export default function InvoicePage() {
  const params = useParams();
  const orderId = params.orderId;
  const [orderDetails, setOrderDetails] = useState(null); // No type annotation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // No type annotation

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setError('Order ID is missing.');
        return;
      }

      try {
        setLoading(true);
        // No 'as string' assertion needed in JS
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // No 'as Order' assertion needed in JS
          setOrderDetails({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError(`No order found with ID: ${orderId}`);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to fetch order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Helper to safely convert Timestamp to Date for display
  // Parameter 'timestamp' will be implicitly 'any' or inferred by JSDoc
  const convertTimestampToLocaleString = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (
      timestamp &&
      typeof timestamp === 'object' &&
      'seconds' in timestamp
    ) {
      // Handle plain object structure if Firestore doesn't automatically convert Timestamps
      return new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1_000_000
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="wrapper-invoice">
        <section className="invoice-section">
          <div className="cus-container2 text-center py-10">
            <p>Loading invoice details...</p>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapper-invoice">
        <section className="invoice-section">
          <div className="cus-container2 text-center py-10">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </section>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="wrapper-invoice">
        <section className="invoice-section">
          <div className="cus-container2 text-center py-10">
            <p>Order details could not be loaded.</p>
          </div>
        </section>
      </div>
    );
  }

  // Destructure orderDetails for easier access
  // Using optional chaining (?) and nullish coalescing (||) for safety in JS
  const {
    id,
    customerEmail,
    totalAmount,
    discountAmount,
    finalAmount,
    couponCode,
    paymentMethod,
    orderStatus,
    paymentStatus,
    createdAt,
    updatedAt,
    products,
    customerDetails,
    courierInfo,
  } = orderDetails;

  return (
    <>
      <div className="wrapper-invoice">
        <section className="invoice-section">
          <div className="cus-container2">
            <div className="top">
              <button
                onClick={() => window.print()}
                className="tf-btn btn-fill animate-hover-btn"
              >
                Print this invoice
              </button>
            </div>
            <div className="box-invoice">
              <div className="header">
                <div className="wrap-top">
                  <div className="box-left">
                    <Link href={`/`}>
                      <Image
                        alt="logo"
                        className="logo"
                        src="/images/logo/logo.svg"
                        width="136"
                        height="21"
                      />
                    </Link>
                  </div>
                  <div className="box-right">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                      <div className="title">Invoice #</div>
                      <span className="code-num">{id || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="wrap-date">
                  <div className="box-left">
                    <label htmlFor="">Invoice date:</label>
                    <span className="date">
                      {convertTimestampToLocaleString(createdAt)}
                    </span>
                  </div>
                  <div className="box-right">
                    <label htmlFor="">Last Updated:</label>
                    <span className="date">
                      {convertTimestampToLocaleString(updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="wrap-info">
                  {/* Supplier Details - These typically remain static on an invoice */}
                  <div className="box-left">
                    <div className="title">Supplier</div>
                    <div className="sub">Rakshana Hosierys</div>{' '}
                    <p className="desc">
                      No 18, 2nd St Ext, Appachi Nagar, Kongu Nagar, <br />Tiruppur, Tamil Nadu - 641607
                      <br /> India
                    </p>
                  </div>
                  {/* Customer Details - Dynamically populated */}
                  <div className="box-right">
                    <div className="title">Customer</div>
                    <div className="sub">
                      {customerDetails?.name || 'N/A'}
                    </div>
                    <p className="desc">
                      {customerDetails?.address || 'N/A'},{' '}
                      {customerDetails?.city || ''} <br />
                      {customerDetails?.state || ''}{' '}
                      {customerDetails?.pinCode || ''},{' '}
                      {customerDetails?.country || ''}
                      <br />
                      Email: {customerEmail || 'N/A'}
                      <br />
                      Phone: {customerDetails?.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="wrap-table-invoice">
                  <table className="invoice-table">
                    <thead>
                      <tr className="title">
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products && products.length > 0 ? (
                        products.map((product, index) => (
                          <tr className="content" key={index}>
                            <td>
                              {product.title}
                              <br />
                              {product.selectedColor &&
                                ` (${product.selectedColor.name})`}
                              {product.selectedSize &&
                                ` / Size: ${product.selectedSize}`}
                            </td>
                            <td>{product.quantity}</td>
                            <td>₹{product.priceAtPurchase.toFixed(2)}</td>
                            <td>
                              ₹
                              {(
                                product.quantity * product.priceAtPurchase
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="content">
                          <td colSpan={4}>No products in this order.</td>
                        </tr>
                      )}
                      {/* Summary Rows */}
                      <tr className="content total-row">
                        <td className="total" colSpan={3}>
                          Subtotal
                        </td>
                        <td className="total">
                          ₹{(totalAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                      {discountAmount > 0 && (
                        <tr className="content total-row">
                          <td className="total" colSpan={3}>
                            Discount {couponCode ? `(${couponCode})` : ''}
                          </td>
                          <td className="total">
                            - ₹{(discountAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr className="content total-row">
                        <td className="total" colSpan={3}>
                          Total Due
                        </td>
                        <td className="total">
                          ₹{(finalAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <br />

                {/* Additional Order Details (Status, Payment, Courier) */}
                <div className="wrap-info mt-8">
                  <div className="box-left">
                    <div className="title">Order Status</div>
                    <div className="sub">{orderStatus || 'N/A'}</div>
                  </div>
                  <div className="box-right">
                    <div className="title">Payment Status</div>
                    <div className="sub">{paymentStatus || 'N/A'}</div>
                  </div>
                </div>

                {courierInfo && (
                  <div className="wrap-info mt-4">
                    <div className="box-left">
                      <div className="title">Courier Service</div>
                      <div className="sub">
                        {courierInfo.serviceName || 'N/A'}
                      </div>
                    </div>
                    <div className="box-right">
                      <div className="title">Tracking Number</div>
                      <div className="sub">
                        {courierInfo.trackingNumber || 'N/A'}
                      </div>
                      {courierInfo.trackingLink &&
                        courierInfo.trackingLink !== 'N/A' && (
                          <p className="desc mt-1">
                            <a
                              href={courierInfo.trackingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Tracking
                            </a>
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </div>
              <div className="footer">
                <ul className="box-contact">
                  <li>rakshanahosierys.in</li>
                  <li>rakshanahosierys@gmail.com</li>
                  <li>(+91) 94881 611770</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}