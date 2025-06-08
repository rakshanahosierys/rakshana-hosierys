"use client";
import { useState, useEffect } from "react";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/utlis/firebaseConfig"; // Ensure 'db' is correctly imported and initialized
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs, // Import getDocs for fetching multiple documents
  query,   // Import query for building queries
} from "firebase/firestore";
// No longer need firebase/functions imports as we're not using Cloud Functions for order processing
// import { httpsCallable } from 'firebase/functions';
// import { functionsInstance } from "@/utlis/firebaseConfig"; // Not needed

export default function Checkout() {
  const [agreed, setAgreed] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "India",
    city: "",
    state: "",
    pinCode: "",
    address: "",
    phone: "",
    note: "",
    paymentMethod: "delivery",
  });
  const { cartProducts, setCartProducts, totalPrice } = useContextElement();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(totalPrice);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // New state to store coupons fetched from Firestore
  const [availableCoupons, setAvailableCoupons] = useState({});
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // Fetch coupons from Firestore on component mount
  useEffect(() => {
    const fetchCoupons = async () => {
      setLoadingCoupons(true);
      try {
        const couponsCollectionRef = collection(db, "coupons");
        const q = query(couponsCollectionRef);
        const querySnapshot = await getDocs(q);
        const fetchedCoupons = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Store coupons by their code (case-insensitive for lookup)
          fetchedCoupons[doc.id.toUpperCase()] = {
            type: data.type,
            value: data.value,
            minPurchase: data.minPurchase || 0,
            expiresAt: data.expiresAt ? data.expiresAt.toDate() : null, // Convert Firestore Timestamp to Date object
            message: data.message || `${data.value}${data.type === 'percentage' ? '%' : '₹'} off!`,
          };
        });
        setAvailableCoupons(fetchedCoupons);
      } catch (err) {
        console.error("Error fetching coupons:", err);
        // Optionally set a coupon error or show a message to the user
      } finally {
        setLoadingCoupons(false);
      }
    };

    if (db) { // Ensure db is initialized before fetching
      fetchCoupons();
    }
  }, [db]); // Re-run if db instance changes (though unlikely in a typical app)


  useEffect(() => {
    setFinalPrice(totalPrice - discountAmount);
  }, [totalPrice, discountAmount]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (isAuthenticated && user && db) {
        try {
          const addressesCollectionRef = collection(db, `users/${user.uid}/addresses`);
          const q = query(addressesCollectionRef);
          const querySnapshot = await getDocs(q);

          const fetchedAddresses = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedAddresses.push({
              id: doc.id,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              address: data.address || "",
              city: data.city || "",
              country: data.country || "India",
              state: data.state || "",
              pinCode: data.zipCode || data.pinCode || "",
              phone: data.phone || "",
              isDefault: data.isDefault || false,
            });
          });
          setUserAddresses(fetchedAddresses);

          if (fetchedAddresses.length > 0) {
            const defaultAddress = fetchedAddresses.find(addr => addr.isDefault) || fetchedAddresses[0];
            setFormData((prev) => ({
              ...prev,
              firstName: defaultAddress.firstName || "",
              lastName: defaultAddress.lastName || "",
              country: defaultAddress.country || "India",
              city: defaultAddress.city || "",
              address: defaultAddress.address || "",
              phone: defaultAddress.phone || "",
              state: defaultAddress.state || "",
              pinCode: defaultAddress.pinCode || "",
            }));
            setSelectedAddressId(defaultAddress.id);
          } else {
            setFormData((prev) => ({
              ...prev,
              firstName: user.displayName ? user.displayName.split(' ')[0] : "",
              lastName: user.displayName ? user.displayName.slice(user.displayName.indexOf(' ') + 1) : "",
            }));
          }
        } catch (err) {
          console.error("Error fetching user addresses:", err);
          setCheckoutError("Failed to load your saved addresses.");
        }
      } else if (!isAuthenticated && !authLoading) {
        setFormData({
          firstName: "",
          lastName: "",
          country: "India",
          city: "",
          address: "",
          phone: "",
          state: "",
          pinCode: "",
          note: "",
          paymentMethod: "delivery",
        });
        setUserAddresses([]);
        setSelectedAddressId("new");
      }
    };

    fetchAddresses();
  }, [isAuthenticated, user, authLoading, db]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    if (selectedAddressId !== "new") {
      setSelectedAddressId("new");
    }
  };

  const handlePaymentChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      paymentMethod: e.target.id,
    }));
  };

  const handleAddressSelect = (e) => {
    const selectedId = e.target.value;
    setSelectedAddressId(selectedId);

    if (selectedId === "new") {
      setFormData((prevData) => ({
        ...prevData,
        firstName: user?.displayName ? user.displayName.split(' ')[0] : "",
        lastName: user?.displayName ? user.displayName.slice(user.displayName.indexOf(' ') + 1) : "",
        country: "India",
        city: "",
        address: "",
        phone: "",
        state: "",
        pinCode: "",
      }));
      setSaveAddressForFuture(false);
    } else {
      const addressToLoad = userAddresses.find((addr) => addr.id === selectedId);
      if (addressToLoad) {
        setFormData((prevData) => ({
          ...prevData,
          firstName: addressToLoad.firstName || "",
          lastName: addressToLoad.lastName || "",
          country: addressToLoad.country || "India",
          city: addressToLoad.city || "",
          address: addressToLoad.address || "",
          phone: addressToLoad.phone || "",
          state: addressToLoad.state || "",
          pinCode: addressToLoad.pinCode || "",
        }));
        setSaveAddressForFuture(false);
      }
    }
  };

  // --- Frontend Coupon Application Logic (now uses fetched coupons) ---
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    setDiscountAmount(0); // Reset discount
    setFinalPrice(totalPrice); // Reset final price

    const trimmedCouponCode = couponCode.trim().toUpperCase();
    if (trimmedCouponCode === "") {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (loadingCoupons) {
      setCouponError("Coupons are still loading. Please try again in a moment.");
      return;
    }

    const coupon = availableCoupons[trimmedCouponCode];

    if (!coupon) {
      setCouponError("Invalid coupon code.");
      return;
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      setCouponError("Coupon has expired.");
      return;
    }

    if (coupon.minPurchase && totalPrice < coupon.minPurchase) {
      setCouponError(`Coupon requires a minimum purchase of ₹${coupon.minPurchase.toFixed(2)}.`);
      return;
    }

    let calculatedDiscount = 0;
    if (coupon.type === "percentage") {
      calculatedDiscount = totalPrice * (coupon.value / 100);
    } else if (coupon.type === "fixed") {
      calculatedDiscount = coupon.value;
    } else {
      setCouponError("Invalid coupon type configured."); // Should not happen if data is clean
      return;
    }

    // Ensure discount doesn't exceed total price
    calculatedDiscount = Math.min(calculatedDiscount, totalPrice);

    setDiscountAmount(calculatedDiscount);
    setFinalPrice(totalPrice - calculatedDiscount);
    setCouponSuccess(`Coupon applied: ${coupon.message}`);
  };

  // --- New function to clear the applied coupon ---
  const handleClearCoupon = () => {
    setCouponCode("");
    setDiscountAmount(0);
    setFinalPrice(totalPrice); // Reset to original total price
    setCouponError("");
    setCouponSuccess("");
  };

  // --- Frontend Place Order Logic ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutError("");
    setCheckoutSuccess("");

    if (!agreed) {
      setCheckoutError("Please agree to the website terms and conditions.");
      return;
    }
    if (cartProducts.length === 0) {
      setCheckoutError("Your cart is empty. Please add items to your cart before placing an order.");
      return;
    }
    if (authLoading) {
      setCheckoutError("Please wait while we verify your login status...");
      return;
    }
    if (!isAuthenticated) {
      const redirectUrl = searchParams.get("redirect") || router.asPath || "/checkout";
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    const requiredFields = ["firstName", "lastName", "country", "city", "state", "pinCode", "address", "phone"];
    for (const field of requiredFields) {
      if (!formData[field] || (field === "country" && formData[field] === "---")) {
        setCheckoutError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return;
      }
    }

    setIsPlacingOrder(true);

    try {
      // --- IMPORTANT SECURITY NOTE ---
      // In this frontend-only solution, product prices are taken directly from cartProducts.
      // For a real e-commerce application, you should always re-validate product prices and stock
      // on a secure backend (e.g., Firebase Cloud Function) to prevent client-side manipulation.
      const productsForOrder = cartProducts.map(product => ({
        productId: product.id,
        title: product.title,
        quantity: product.quantity,
        // Use the price from the cart, but ideally this would be validated server-side
        priceAtPurchase: (product.price - (product.price * product.discount) / 100) || product.price,
        selectedColor: product.selectedColor,
        selectedSize: product.selectedSize,
        imgSrc: product.imgSrc || 'https://placehold.co/100x100/eeeeee/cccccc?text=No+Image', // Fallback for image
      }));

      // Calculate final amount again based on current cart and applied discount
      const calculatedSubtotal = productsForOrder.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
      const finalOrderAmount = calculatedSubtotal - discountAmount; // Use the discount calculated by handleApplyCoupon

      const orderDocument = {
        userId: user.uid,
        customerEmail: user.email,
        customerDetails: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: user.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          country: formData.country,
        },
        products: productsForOrder,
        totalAmount: calculatedSubtotal, // Subtotal before discount
        discountAmount: discountAmount,
        finalAmount: finalOrderAmount, // Final amount after discount
        couponCode: couponCode.trim() === "" ? null : couponCode,
        paymentMethod: formData.paymentMethod,
        notes: formData.note,
        orderStatus: "Pending", // Initial status
        paymentStatus: formData.paymentMethod === "delivery" ? "Paid" : "Pending", // COD or Pending for bank transfer
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add the order to Firestore
      const docRef = await addDoc(collection(db, "orders"), orderDocument);
      const orderId = docRef.id;

      console.log("Order placed directly to Firestore:", orderId);

      // Save new address if selected
      if (selectedAddressId === "new" && saveAddressForFuture && user) {
        const newAddressData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          state: formData.state,
          zipCode: formData.pinCode,
          phone: formData.phone,
          isDefault: userAddresses.length === 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await addDoc(collection(db, `users/${user.uid}/addresses`), newAddressData);
      }

      setCartProducts([]); // Clear cart after successful order

      if (formData.paymentMethod === "bank") {
        setCheckoutSuccess("Order placed! Redirecting to simulated payment page.");
        router.push(`/order-processing?orderId=${orderId}`);
      } else if (formData.paymentMethod === "delivery") {
        setCheckoutSuccess("Order placed successfully! Payment on delivery.");
        router.push(`/order-confirmation?orderId=${orderId}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setCheckoutError(`Error placing order: ${error.message || "An unexpected error occurred."}`);
      setDiscountAmount(0); // Reset discount on error
      setFinalPrice(totalPrice); // Reset final price on error
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="tf-page-cart-wrap layout-2">
          <div className="tf-page-cart-item">
            <h5 className="fw-5 mb_20">Billing details</h5>
            {checkoutError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                {checkoutError}
              </div>
            )}
            {checkoutSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                {checkoutSuccess}
              </div>
            )}

            {isAuthenticated && userAddresses.length > 0 && (
              <div className="mb_20">
                <label htmlFor="addressSelect" className="block text-sm font-medium text-gray-700 mb_5">
                  Choose from saved addresses:
                </label>
                <div className="select-custom">
                  <select
                    id="addressSelect"
                    className="tf-select w-100"
                    value={selectedAddressId}
                    onChange={handleAddressSelect}
                  >
                    <option value="new">Enter a new address</option>
                    {userAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.firstName} {addr.lastName}, {addr.address}, {addr.city}, {addr.state}, {addr.pinCode}, {addr.country}
                        {addr.isDefault && " (Default)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="form-checkout">
              <div className="box grid-2">
                <fieldset className="fieldset">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    required
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    required
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </fieldset>
              </div>
              <fieldset className="box fieldset">
                <label htmlFor="phone">Phone Number</label>
                <input
                  required
                  type="number"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </fieldset>
              <fieldset className="box fieldset">
                <label htmlFor="address">Address</label>
                <input
                  required
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </fieldset>
              <fieldset className="box fieldset">
                <label htmlFor="city">City</label>
                <input
                  required
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </fieldset>
              <fieldset className="box fieldset">
                <label htmlFor="state">State</label>
                <input
                  required
                  type="text"
                  id="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </fieldset>
              <fieldset className="box fieldset">
                <label htmlFor="pinCode">PIN code</label>
                <input
                  required
                  type="text"
                  id="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                />
              </fieldset>
              <fieldset className="box fieldset">
                <label htmlFor="country">Country/Region</label>
                <div className="select-custom">
                  <select
                    required
                    className="tf-select w-100"
                    id="country"
                    name="address[country]"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="India">India</option>
                    {/* Add other countries if needed */}
                  </select>
                </div>
              </fieldset>
              <fieldset className="box fieldset">
                <label htmlFor="note">Order notes (optional)</label>
                <textarea
                  name="note"
                  id="note"
                  value={formData.note}
                  onChange={handleChange}
                />
              </fieldset>

              {/* Option to save new address */}
              {isAuthenticated && selectedAddressId === "new" && (
                <div className="box-checkbox fieldset-radio mb_20 mt_20">
                  <input
                    type="checkbox"
                    className="tf-check"
                    id="saveAddress"
                    checked={saveAddressForFuture}
                    onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                  />
                  &nbsp;
                  <label htmlFor="saveAddress" className="text_black-2">
                    Save this address for future use
                  </label>
                </div>
              )}
            </form>
          </div>
          <div className="tf-page-cart-footer">
            <div className="tf-cart-footer-inner">
              <h5 className="fw-5 mb_20">Your order</h5>
              <form onSubmit={handlePlaceOrder} className="tf-page-cart-checkout widget-wrap-checkout">
                <ul className="wrap-checkout-product">
                  {cartProducts.map((elm, i) => (
                    <li key={i} className="checkout-product-item">
                      <figure className="img-product">
                        <Image
                          alt="product"
                          src={elm.imgSrc}
                          width={720}
                          height={1005}
                        />
                        <span className="quantity">{elm.quantity}</span>
                      </figure>
                      <div className="content">
                        <div className="info">
                          <p className="name">{elm.title}</p>
                          <span className="variant">
                            {elm.selectedColor?.name} - {elm.selectedSize}
                          </span>
                        </div>
                        <span className="price">
                          ₹{" "}
                          {(
                            (elm.price - (elm.price * elm.discount) / 100) ||
                            elm.price
                          ) * elm.quantity}.00
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                {!cartProducts.length && (
                  <div className="container">
                    <div className="row align-items-center mt-5 mb-5">
                      <div className="col-12 fs-18">Your shop cart is empty</div>
                      <div className="col-12 mt-3">
                        <Link
                          href={`/shop-default`}
                          className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                          style={{ width: "fit-content" }}
                        >
                          Explore Products!
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                <div className="coupon-box">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </button>
                  {/* New Clear Coupon Button */}
                  {couponCode.trim() !== "" && (
                    <button
                      type="button"
                      onClick={handleClearCoupon}
                      className="tf-btn btn-sm radius-3 btn-outline-secondary btn-icon animate-hover-btn ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {couponError && (
                  <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                    {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <p style={{ color: "green", fontSize: "14px", marginTop: "5px" }}>
                    {couponSuccess}
                  </p>
                )}

                <div className="d-flex justify-content-between line pb_10 pt_10">
                  <h6 className="fw-5">Subtotal</h6>
                  <h6 className="subtotal fw-5">₹ {totalPrice.toFixed(2)} INR</h6>
                </div>
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between line pb_10">
                    <h6 className="fw-5 text-green-600">Discount</h6>
                    <h6 className="discount fw-5 text-green-600">- ₹ {discountAmount.toFixed(2)} INR</h6>
                  </div>
                )}
                <div className="d-flex justify-content-between line pb_20 pt_10">
                  <h6 className="fw-5">Total</h6>
                  <h6 className="total fw-5">₹ {finalPrice.toFixed(2)} INR</h6>
                </div>
                <div className="wd-check-payment">
                  {/* <div className="fieldset-radio mb_20">
                    <input
                      required
                      type="radio"
                      name="payment"
                      id="bank"
                      className="tf-check"
                      checked={formData.paymentMethod === "bank"}
                      onChange={handlePaymentChange}
                    />
                    <label htmlFor="bank">Direct bank transfer</label>
                  </div> */}
                  <div className="fieldset-radio mb_20">
                    <input
                      required
                      type="radio"
                      name="payment"
                      id="delivery"
                      className="tf-check"
                      checked={formData.paymentMethod === "delivery"}
                      onChange={handlePaymentChange}
                    />
                    <label htmlFor="delivery">Cash on delivery</label>
                  </div>
                  <p className="text_black-2 mb_20">
                    Your personal data will be used to process your order,
                    support your experience throughout this website, and for
                    other purposes described in our&nbsp;
                    <Link
                      href={`/privacy-policy`}
                      className="text-decoration-underline"
                    >
                      privacy policy
                    </Link>
                    .
                  </p>
                  <div className="box-checkbox fieldset-radio mb_20">
                    <input
                      required
                      type="checkbox"
                      className="tf-check"
                      id="check-agree"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <label htmlFor="check-agree" className="text_black-2">
                      I have read and agree to the website&nbsp;
                      <Link
                        href={`/terms-conditions`}
                        className="text-decoration-underline"
                      >
                        terms and conditions
                      </Link>
                      .
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className={`tf-btn radius-3 btn-${
                    !agreed || authLoading || isPlacingOrder || cartProducts.length === 0
                      ? "disabled"
                      : "fill"
                  } btn-icon animate-hover-btn justify-content-center`}
                  disabled={!agreed || authLoading || isPlacingOrder || cartProducts.length === 0}
                >
                  {authLoading
                    ? "Checking login..."
                    : isPlacingOrder
                    ? "Placing Order..."
                    : "Place order"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
