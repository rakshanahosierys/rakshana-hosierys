// components/common/WishlistLength.jsx (or wherever this component is)
'use client';

import { useContextElement } from "@/context/Context";
import React from "react";

export default function WishlistLength() {
  const { wishList } = useContextElement(); // Assuming wishList is an array of IDs

  // Get the actual count
  const count = wishList ? wishList.length : 0;

  // Conditionally render the count
  return (
    <>
      {count > 0 && (
        <span className="count-box">
          {count}
        </span>
      )}
    </>
  );
}