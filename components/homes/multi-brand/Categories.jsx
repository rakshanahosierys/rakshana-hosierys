"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/utlis/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Categories() {
  const [circles, setCircles] = useState([]);

useEffect(() => {
  const fetchCollections = async () => {
    try {
      const q = query(
        collection(db, "collectionCircles"),
        where("active", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCircles(items);
    } catch (error) {
      console.error("Error fetching active collection circles:", error);
    }
  };

  fetchCollections();
}, []);

  return (
    <section className="flat-spacing-20">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="tf-categories-wrap">
              <div className="tf-categories-container">
                {circles.map((item) => (
                  <div
                    key={item.id}
                    className="collection-item-circle hover-img position-relative"
                  >
                    <Link
                      href={item.href}
                      className="collection-image img-style"
                    >
                      <Image
                        className="lazyload"
                        data-src={item.imgSrc}
                        alt={item.alt}
                        src={item.imgSrc}
                        width="160"
                        height="160"
                      />
                    </Link>
                    {item.hasSale && (
                      <div
                        className="has-saleoff-wrap "
                        style={{ position: "absolute", top: 0 }}
                      >
                        <div className="sale-off fw-5">{item.saleText}% off</div>
                      </div>
                    )}
                    <div className="collection-content text-center">
                      <Link href={item.href} className="link title fw-6">
                        {item.title}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tf-shopall-wrap">
                <div className="collection-item-circle tf-shopall">
                  <Link
                    href={`/shop-default`}
                    className="collection-image img-style tf-shopall-icon"
                  >
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                  <div className="collection-content text-center">
                    <Link href={`/shop-default`} className="link title fw-6">
                      Shop all
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}