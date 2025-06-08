// components/common/CartLength.jsx (or wherever this component is)
'use client';

import { useContextElement } from "@/context/Context";
import React from "react";

export default function CartLength() {
  // Assuming your cart context provides `cart` as an array of items,
  // or `cartItems` if it's named differently. Adjust as per your Context.
  const { cartProducts } = useContextElement(); // Or { cartItems } if that's what your context provides

  // Calculate the total quantity of items in the cart
  // Assuming each cart item has a 'quantity' property.
  const totalQuantity = cartProducts ? cartProducts.length : 0;

  // Conditionally render the count
  return (
    <>
      {totalQuantity > 0 && (
        <span className="count-box">
          {totalQuantity}
        </span>
      )}
    </>
  );
}