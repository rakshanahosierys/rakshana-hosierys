"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utlis/firebaseConfig";

export default function ProductSinglePrevNext({ currentId }) {
  const [ids, setIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const fetchIndex = async () => {
      const ref = doc(db, "metadata", "productIndex");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const productIds = snap.data().ids || [];
        setIds(productIds);
        setCurrentIndex(productIds.indexOf(currentId));
      }
    };

    fetchIndex();
  }, [currentId]);

  if (currentIndex === -1 || ids.length === 0) return null;

  const prevId = currentIndex > 0 ? ids[currentIndex - 1] : ids[0];
  const nextId = currentIndex < ids.length - 1 ? ids[currentIndex + 1] : ids[ids.length - 1];

  return (
    <div className="tf-breadcrumb-prev-next">
      <Link
        href={`/product-detail/${prevId}`}
        className="tf-breadcrumb-prev hover-tooltip center"
      >
        <i className="icon icon-arrow-left" />
      </Link>
      <Link href="/shop-default" className="tf-breadcrumb-back hover-tooltip center">
        <i className="icon icon-shop" />
      </Link>
      <Link
        href={`/product-detail/${nextId}`}
        className="tf-breadcrumb-next hover-tooltip center"
      >
        <i className="icon icon-arrow-right" />
      </Link>
    </div>
  );
}
