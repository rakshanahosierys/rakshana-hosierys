// components/ToolbarShop.jsx
'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utlis/firebaseConfig";
import { useRouter } from 'next/navigation';

export default function ToolbarShop() {
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const docRef = doc(db, 'metadata', 'productFilters');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const categories = data.categories || [];

          const transformedLinks = categories.map(cat => ({
            name: cat.name,
            href: `/shop-default?filter=${encodeURIComponent(cat.name)}`,
            image: cat.image,
          }));

          transformedLinks.push({
            name: "New Arrivals",
            href: `/shop-default?filter=${encodeURIComponent("New Arrivals")}`,
            image: "/images/shop/cate/new-arrivals-sq.jpg",
          });

          setDynamicCategories(transformedLinks);
        }
      } catch (error) {
        console.error("Error fetching categories for ToolbarShop:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = async (e, href) => {
    e.preventDefault(); // Prevent default Link navigation immediately

    const offcanvasElement = document.getElementById('toolbarShopmb');
    if (offcanvasElement) {
      try {
        const { Offcanvas } = await import('bootstrap');
        
        // IMPORTANT: Delay the Bootstrap action slightly
        setTimeout(() => {
          const bsOffcanvas = Offcanvas.getInstance(offcanvasElement) || new Offcanvas(offcanvasElement);
          bsOffcanvas.hide();
        }, 100); // Small delay, 100ms often works for hydration
      } catch (importError) {
        console.error("Error importing or using Bootstrap Offcanvas:", importError);
      }
    }

    router.push(href); // Navigate immediately
  };

  return (
    <div
      className="offcanvas offcanvas-start canvas-mb toolbar-shop-mobile"
      id="toolbarShopmb"
    >
      <span
        className="icon-close icon-close-popup"
        data-bs-dismiss="offcanvas" // Keep this on the close button
        aria-label="Close"
      />
      <div className="mb-canvas-content">
        <div className="mb-body">
          <ul className="nav-ul-mb" id="wrapper-menu-navigation">
            {isLoadingCategories ? (
              <li className="nav-mb-item">Loading categories...</li>
            ) : (
              dynamicCategories.map((category, index) => (
                <li key={index} className="nav-mb-item">
                  <Link
                    href={category.href}
                    className="tf-category-link mb-menu-link"
                    onClick={(e) => handleCategoryClick(e, category.href)} // Use the new handler
                  >
                    <div className="image">
                      <Image
                        alt={category.name}
                        src={category.image}
                        width={40}
                        height={48}
                      />
                    </div>
                    <span>{category.name}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="mb-bottom">
          <Link
            href={`/shop-default`}
            className="tf-btn fw-5 btn-line"
            // REMOVE data-bs-dismiss="offcanvas" from here
            onClick={(e) => handleCategoryClick(e, `/shop-default`)} // Apply the handler
          >
            View all collection
            <i className="icon icon-arrow1-top-left" />
          </Link>
        </div>
      </div>
    </div>
  );
}