"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/utlis/firebaseConfig";
import { collection, getDocs, query, where, limit } from "firebase/firestore";

export default function Collection() {
  const [collectionItem, setCollectionItem] = useState(null);

  useEffect(() => {
    const fetchCollectionItem = async () => {
      try {
        const q = query(
          collection(db, "bottomCollections"),  // <--- here
          where("active", "==", true),
          limit(1)
        );
        const snapshot = await getDocs(q);
        const doc = snapshot.docs[0];
        if (doc) {
          setCollectionItem({ id: doc.id, ...doc.data() });
        }
      } catch (error) {
        console.error("Error fetching bottom collection:", error);
      }
    };

    fetchCollectionItem();
  }, []);

  if (!collectionItem) return null;

  return (
    <section className="flat-spacing-19">
      <div className="container">
        <div className="tf-grid-layout md-col-2 tf-img-with-text style-1">
          <div className="tf-image-wrap wow fadeInUp" data-wow-delay="0s">
            <Image
              className="lazyload"
              data-src={collectionItem.imgSrc}
              alt={collectionItem.imgAlt || "collection-img"}
              src={collectionItem.imgSrc}
              width={800}
              height={760}
            />
          </div>
          <div className="tf-content-wrap wow fadeInUp" data-wow-delay="0s">
            <div className="heading">
              {collectionItem.heading
                .replace(/\\n/g, "\n")
                .split("\n")
                .map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
            </div>

            <p className="description">{collectionItem.description}</p>

            <Link
              href={collectionItem.buttonLink || "/about-us"}
              className="tf-btn style-2 btn-fill rounded-full animate-hover-btn"
            >
              {collectionItem.buttonText || "Read our stories"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
