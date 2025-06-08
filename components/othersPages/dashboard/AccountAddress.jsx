// components/othersPages/dashboard/AccountAddress.jsx
"use client";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/utlis/firebaseConfig"; // Ensure auth and db are imported

export default function AccountAddress() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission loading

  // Original UI states
  const [activeEdit, setactiveEdit] = useState(false); // Controls "Add a new address" form
  const [activeAdd, setactiveAdd] = useState(false); // Controls "Edit address" form

  // State for the form data (used by both add/edit forms)
  const [addressFormData, setAddressFormData] = useState({
    id: null, // Will hold doc ID if editing, null if adding new
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "India", // Default to India as per original code's initial option
    state: "",
    pinCode: "",
    phone: "",
    isDefault: false,
  });

  // --- Fetch user and their addresses on component mount ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setCurrentUser(null);
        setUserAddresses([]);
        return;
      }
      setCurrentUser(user);
      fetchUserAddresses(user.uid);
    });

    return () => unsubscribeAuth();
  }, []);

  // --- Function to fetch addresses from Firestore ---
  const fetchUserAddresses = async (uid) => {
    setLoading(true);
    setError("");
    try {
      const addressesCollectionRef = collection(db, `users/${uid}/addresses`);
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
          state: data.state || data.province || "", // Handle legacy 'province' field
          pinCode: data.pinCode || "",
          phone: data.phone || "",
          isDefault: data.isDefault || false,
        });
      });
      fetchedAddresses.sort((a, b) => (b.isDefault - a.isDefault)); // Sort to show default first
      setUserAddresses(fetchedAddresses);
    } catch (err) {
      console.error("Error fetching user addresses:", err);
      setError("Failed to load your addresses.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handle form input changes for both forms ---
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    let fieldName = id;
    if (id === "AddressZipNew" || id === "AddressZipEdit") fieldName = "pinCode";
    if (id === "check-new-address" || id === "check-edit-address") fieldName = "isDefault";
    if (id === "stateNew" || id === "stateEdit") fieldName = "state";

    setAddressFormData((prevData) => ({
      ...prevData,
      [fieldName]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Handle form submission (Add/Update Address) ---
  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    if (!currentUser) {
      setError("You must be logged in to manage addresses.");
      setIsSubmitting(false);
      return;
    }

    const requiredFields = [
      "firstName", "lastName", "address", "city", "country", "state", "pinCode", "phone",
    ];
    for (const field of requiredFields) {
      if (!addressFormData[field] || addressFormData[field].trim() === "") {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        setIsSubmitting(false);
        return;
      }
    }
    if (addressFormData.country === "---") {
      setError("Please select a valid country.");
      setIsSubmitting(false);
      return;
    }

    try {
      const addressDataToSave = { ...addressFormData };
      delete addressDataToSave.id;

      if (addressDataToSave.isDefault) {
        const batchUpdates = [];
        for (const addr of userAddresses) {
          if (addr.id !== addressFormData.id && addr.isDefault) {
            batchUpdates.push(updateDoc(doc(db, `users/${currentUser.uid}/addresses`, addr.id), { isDefault: false }));
          }
        }
        if (batchUpdates.length > 0) {
          await Promise.all(batchUpdates);
        }
      } else if (userAddresses.length === 0 || (userAddresses.length === 1 && addressFormData.id === userAddresses[0].id)) {
        addressDataToSave.isDefault = true;
      }

      if (!addressFormData.id) {
        addressDataToSave.createdAt = serverTimestamp();
        addressDataToSave.updatedAt = serverTimestamp();
        await addDoc(collection(db, `users/${currentUser.uid}/addresses`), addressDataToSave);
        setSuccessMessage("Address added successfully!");
      } else {
        addressDataToSave.updatedAt = serverTimestamp();
        await updateDoc(
          doc(db, `users/${currentUser.uid}/addresses`, addressFormData.id),
          addressDataToSave
        );
        setSuccessMessage("Address updated successfully!");
      }

      await fetchUserAddresses(currentUser.uid);
      handleCancelForms();
    } catch (err) {
      console.error("Error saving address:", err);
      setError("Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Delete Address ---
  const handleDeleteAddress = async (addressId) => {
    if (!currentUser) {
      setError("You must be logged in to delete addresses.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/addresses`, addressId));
      setSuccessMessage("Address deleted successfully!");
      await fetchUserAddresses(currentUser.uid);
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Set as Default for an existing address without opening edit form ---
  const handleSetDefault = async (addressToSetDefault) => {
    if (!currentUser) {
      setError("You must be logged in to set default addresses.");
      return;
    }
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const batchUpdates = [];
      for (const addr of userAddresses) {
        if (addr.id !== addressToSetDefault.id && addr.isDefault) {
          batchUpdates.push(updateDoc(doc(db, `users/${currentUser.uid}/addresses`, addr.id), { isDefault: false }));
        }
      }
      batchUpdates.push(updateDoc(doc(db, `users/${currentUser.uid}/addresses`, addressToSetDefault.id), { isDefault: true }));

      await Promise.all(batchUpdates);
      setSuccessMessage(`Address set as default successfully!`);
      await fetchUserAddresses(currentUser.uid);
    } catch (err) {
      console.error("Error setting default address:", err);
      setError("Failed to set address as default. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- Handle "Add a new address" button click ---
  const handleAddButtonClick = () => {
    setAddressFormData({
      id: null,
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      country: "India",
      state: "",
      pinCode: "",
      phone: "",
      isDefault: false,
    });
    setactiveEdit(true);
    setactiveAdd(false);
    setError("");
    setSuccessMessage("");
  };

  // --- Handle "Edit" button click for an existing address ---
  const handleEditButtonClick = (address) => {
    setAddressFormData({
      id: address.id,
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      address: address.address || "",
      city: address.city || "",
      country: address.country || "India",
      state: address.state || address.province || "",
      pinCode: address.pinCode || "",
      phone: address.phone || "",
      isDefault: address.isDefault || false,
    });
    setactiveAdd(true);
    setactiveEdit(false);
    setError("");
    setSuccessMessage("");
  };

  // --- Handle Cancel button for both forms ---
  const handleCancelForms = () => {
    setactiveEdit(false);
    setactiveAdd(false);
    setAddressFormData({
      id: null,
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      country: "India",
      state: "",
      pinCode: "",
      phone: "",
      isDefault: false,
    });
    setError("");
    setSuccessMessage("");
  };

  if (loading) {
    return (
      <div className="my-account-content account-address text-center">
        <p>Loading addresses...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="my-account-content account-address text-center">
        <p>Please log in to manage your addresses.</p>
      </div>
    );
  }

  return (
    <div className="my-account-content account-address">
      {error && (
        <div style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
          {error}
        </div>
      )}
      {successMessage && (
        <div style={{ color: "green", marginBottom: "15px", textAlign: "center" }}>
          {successMessage}
        </div>
      )}

      <div className="text-center widget-inner-address">
        {/* Original "Add a new address" button */}
        <button
          className="tf-btn btn-fill animate-hover-btn btn-address mb_20"
          onClick={handleAddButtonClick}
          disabled={isSubmitting || activeEdit || activeAdd}
        >
          Add a new address
        </button>

        {/* Original "Add a new address" form */}
        <form
          className="show-form-address wd-form-address"
          id="formnewAddress"
          onSubmit={handleSubmitAddress}
          style={activeEdit ? { display: "block" } : { display: "none" }}
        >
          <div className="title">Add a new address</div>
          <div className="box-field grid-2-lg">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="firstName"
                name="first name"
                value={addressFormData.firstName}
                onChange={handleChange}
                required
              />
              <label className="tf-field-label fw-4 text_black-2" htmlFor="firstName">
                First name
              </label>
            </div>
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="lastName"
                name="last name"
                value={addressFormData.lastName}
                onChange={handleChange}
                required
              />
              <label className="tf-field-label fw-4 text_black-2" htmlFor="lastName">
                Last name
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="phone"
                name="phone"
                value={addressFormData.phone}
                onChange={handleChange}
                required
              />
              <label className="tf-field-label fw-4 text_black-2" htmlFor="phone">
                Phone
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder="Door No / Street / Village / Area / Taluka" // Added placeholder
                type="text"
                id="address"
                name="address"
                value={addressFormData.address}
                onChange={handleChange}
                required
              />
              <label className="tf-field-label fw-4 text_black-2" htmlFor="address">
                Address
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="city"
                name="city"
                value={addressFormData.city}
                onChange={handleChange}
                required
              />
              <label className="tf-field-label fw-4 text_black-2" htmlFor="city">
                City
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="stateNew"
                name="state"
                value={addressFormData.state}
                onChange={handleChange}
                required
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="stateNew"
              >
                State
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="AddressZipNew"
                name="postal code"
                value={addressFormData.pinCode}
                onChange={handleChange}
                required
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="AddressZipNew"
              >
                Postal Code
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="select-custom">
              <select
                className="tf-select w-100"
                id="country"
                name="country"
                value={addressFormData.country}
                onChange={handleChange}
                required
              >
                <option value="India">India</option>
              </select>
            </div>
          </div>
          <div className="box-field text-start">
            <div className="box-checkbox fieldset-radio d-flex align-items-center gap-8">
              <input
                type="checkbox"
                id="check-new-address"
                className="tf-check"
                checked={addressFormData.isDefault}
                onChange={handleChange}
              />
              <label htmlFor="check-new-address" className="text_black-2 fw-4">
                Set as default address.
              </label>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-20">
            <button
              type="submit"
              className="tf-btn btn-fill animate-hover-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add address"}
            </button>
            <span
              className="tf-btn btn-fill animate-hover-btn btn-hide-address"
              onClick={handleCancelForms}
              style={{ cursor: "pointer" }}
            >
              Cancel
            </span>
          </div>
        </form>

        {/* Display existing addresses */}
        <h6 className="mb_20">Your Saved Addresses</h6>
        {userAddresses.length === 0 && !activeEdit && !activeAdd ? (
          <p>You have no saved addresses. Click "Add a new address" to get started.</p>
        ) : (
          <div className="address-list grid-2-lg"> {/* Added grid-2-lg for a 2-column layout */}
            {userAddresses.map((address) => (
              <div key={address.id} className="address-item border p_10 mb_20 radius-10">
                <h6 className="fw-5 mb_10">
                  {address.firstName} {address.lastName}
                  {address.isDefault && <span className="ml_10 text_primary">&nbsp;(Default)</span>}
                </h6>
                <p>{address.address}</p>
                <p>{address.city}, {address.state ? `${address.state}, ` : ''}{address.pinCode}</p>
                <p>{address.country}</p>
                <p>{address.phone}</p>

                <div className="d-flex gap-10 justify-content-center mt_10">
                  <button
                    className="tf-btn btn-fill animate-hover-btn justify-content-center btn-edit-address"
                    onClick={() => handleEditButtonClick(address)}
                    disabled={isSubmitting || activeEdit || activeAdd}
                  >
                    <span>Edit</span>
                  </button>
                  <button
                    className="tf-btn btn-outline animate-hover-btn justify-content-center"
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={isSubmitting || activeEdit || activeAdd}
                  >
                    <span>Delete</span>
                  </button>
                  {!address.isDefault && (
                    <button
                      className="tf-btn btn-outline animate-hover-btn justify-content-center"
                      onClick={() => handleSetDefault(address)}
                      disabled={isSubmitting || activeEdit || activeAdd}
                    >
                      <span>Set as Default</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Original "Edit address" form */}
        <form
          className="edit-form-address wd-form-address"
          id="formeditAddress"
          onSubmit={handleSubmitAddress}
          style={activeAdd ? { display: "block" } : { display: "none" }}
        >
          <div className="title">Edit address</div>
          <div className="box-field grid-2-lg">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="firstName"
                name="first name"
                value={addressFormData.firstName}
                onChange={handleChange}
                required
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="firstname"
              >
                First name
              </label>
            </div>
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="lastName"
                name="last name"
                value={addressFormData.lastName}
                onChange={handleChange}
                required
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="lastname"
              >
                Last name
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="phone"
                name="phone"
                value={addressFormData.phone}
                onChange={handleChange}
                required
              />
              <label className="tf-field-label fw-4 text_black-2" htmlFor="phone">
                Phone
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder="Door No / Street / Village / Area / Taluka" // Added placeholder
                type="text"
                id="address"
                name="address"
                value={addressFormData.address}
                onChange={handleChange}
                required
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="addressEdit"
              >
                Address
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="city"
                name="city"
                value={addressFormData.city}
                onChange={handleChange}
                required
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="cityEdit"
              >
                City
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="stateEdit"
                name="state"
                value={addressFormData.state}
                onChange={handleChange}
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="stateEdit"
              >
                State
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="tf-field style-1">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="AddressZipEdit"
                name="postal code"
                value={addressFormData.pinCode}
                onChange={handleChange}
                required
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="AddressZipEdit"
              >
                Postal Code
              </label>
            </div>
          </div>
          <div className="box-field">
            <div className="select-custom">
              <select
                className="tf-select w-100"
                id="country"
                name="country"
                value={addressFormData.country}
                onChange={handleChange}
                required
              >
                <option value="India">India</option>
              </select>
            </div>
          </div>

          <div className="box-field text-start">
            <div className="box-checkbox fieldset-radio d-flex align-items-center gap-8">
              <input
                type="checkbox"
                id="check-edit-address"
                className="tf-check"
                checked={addressFormData.isDefault}
                onChange={handleChange}
              />
              <label htmlFor="check-edit-address" className="text_black-2 fw-4">
                Set as default address.
              </label>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-20">
            <button
              type="submit"
              className="tf-btn btn-fill animate-hover-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update address"}
            </button>
            <span
              className="tf-btn btn-fill animate-hover-btn btn-hide-edit-address"
              onClick={handleCancelForms}
              style={{ cursor: "pointer" }}
            >
              Cancel
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}