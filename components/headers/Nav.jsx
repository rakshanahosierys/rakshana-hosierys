"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { usePathname, useSearchParams } from "next/navigation"; // Import useSearchParams
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "@/utlis/firebaseConfig"; // Import your Firestore instance

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { products1 } from "@/data/products";
import { ProductCard } from "../shopCards/ProductCard";
import { Navigation } from "swiper/modules";
import {
  allHomepages,
  homeLinks,
  contactLinks,
  helpLinks,
  demoItems,
  pages,
  productDetailPages,
  productsPages,
} from "@/data/menu";

export default function Nav({ isArrow = true, textColor = "", Linkfs = "" }) {
  const pathname = usePathname();
    const searchParams = useSearchParams();

  const [dynamicShopLinks, setDynamicShopLinks] = useState([]);
  const [filterMetadataLoaded, setFilterMetadataLoaded] = useState(false); // Track if metadata is loaded

  // Fetch filter metadata for shop categories
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const docRef = doc(db, 'metadata', 'productFilters');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const categories = data.categories || [];
          const newArrivalsCount = data.newArrivalsCount || 0; // Assuming you store this count in metadata

          const filteredCategories = categories.filter(cat => cat.name !== "Men");

          // Transform categories into the format expected by your menu
          const transformedLinks = filteredCategories.map(cat => ({
            text: cat.name,
            href: `/shop-default?filter=${encodeURIComponent(cat.name)}`, // Encode category name for URL
            filterValue: cat.name, // Store the filter value for active check
          }));

          // Add "New Arrivals" as a dynamic link if needed
          transformedLinks.push({
            text: "New Arrivals",
            href: `/shop-default?filter=${encodeURIComponent("New Arrivals")}`,
            filterValue: "New Arrivals",
          });

          setDynamicShopLinks(transformedLinks);
        }
      } catch (error) {
        console.error("Error fetching filter metadata for Nav:", error);
      } finally {
        setFilterMetadataLoaded(true);
      }
    };
    fetchMetadata();
  }, []); // Run once on mount

  // isMenuActive function needs to be more robust for query parameters
  const isMenuActive = (menuItem) => {
    // For main navigation items that might have sub-menus (like "Shop", "Home")
    // This logic checks if any of the sub-links are active.
    if (Array.isArray(menuItem)) {
      return menuItem.some(item => {
        // Check for direct path match
        if (item.href?.split("/")[1] === pathname.split("/")[1]) {
          // If it's a shop-default link with a filter, check the filter param
          if (item.href.includes('/shop-default?filter=')) {
            const expectedFilterValue = item.filterValue; // Assuming item has filterValue
            const currentFilterValue = searchParams.get('filter');
            return pathname === '/shop-default' && currentFilterValue === expectedFilterValue;
          }
          return true; // It's a direct path match without a filter
        }
        // Handle nested links if any (your original complex logic)
        if (item.links && Array.isArray(item.links)) {
          return item.links.some(nestedItem => {
            if (nestedItem.href?.split("/")[1] === pathname.split("/")[1]) {
              if (nestedItem.href.includes('/shop-default?filter=')) {
                const expectedFilterValue = nestedItem.filterValue;
                const currentFilterValue = searchParams.get('filter');
                return pathname === '/shop-default' && currentFilterValue === expectedFilterValue;
              }
              return true;
            }
            return false;
          });
        }
        return false;
      });
    }

    // For individual link items (like those in sub-menus)
    if (menuItem.href) {
      // Special handling for shop-default links with filters
      if (menuItem.href.includes('/shop-default?filter=')) {
        const expectedFilterValue = menuItem.filterValue; // Assuming menuItem has filterValue
        const currentFilterValue = searchParams.get('filter');
        return pathname === '/shop-default' && currentFilterValue === expectedFilterValue;
      }
      // For other links, just check the first path segment
      return menuItem.href.split("/")[1] === pathname.split("/")[1];
    }

    return false;
  };

  // Determine if the main "Shop" link should be active based on NO query parameters
  const isShopMainLinkActive = pathname === '/shop-default' && searchParams.toString() === '';

  return (
    <>
      {" "}
      {/* <li className="menu-item">
        <a
          href="#"
          className={`item-link ${Linkfs} ${textColor} ${
            isMenuActive(allHomepages) ? "activeMenu" : ""
          } `}
        >
          Home
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu mega-menu">
          <div className="container">
            <div className="row-demo">
              {demoItems.map((item, index) => (
                <div
                  className={`demo-item ${
                    isMenuActive(item) ? "activeMenu" : ""
                  } `}
                  key={index}
                >
                  <Link href={item.href}>
                    <div className="demo-image position-relative">
                      <Image
                        className="lazyload"
                        data-src={item.src}
                        alt={item.alt}
                        src={item.src}
                        width="300"
                        height="329"
                      />
                      {item.labels && (
                        <div className="demo-label">
                          {item.labels.map((label, labelIndex) => (
                            <span
                              key={labelIndex}
                              className={label.className || undefined}
                            >
                              {label.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="demo-name">{item.name}</span>
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center view-all-demo">
              <a
                href="#modalDemo"
                data-bs-toggle="modal"
                className="tf-btn btn-xl btn-fill radius-3 animate-hover-btn fw-6"
              >
                <span>View all demos (46+)</span>
                <i className="icon icon-arrow-right" />
              </a>
            </div>
          </div>
        </div>
      </li> */}
      {/* <li className="menu-item">
        <a
          href="#"
          className={`item-link ${Linkfs} ${textColor} ${isMenuActive(productsPages) ? "activeMenu" : ""
            } `}
        >
          Shop
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu mega-menu">
          <div className="container">
            <div className="row">
              {productsPages.map((menu, index) => (
                <div className="col-lg-2" key={index}>
                  <div className="mega-menu-item">
                    <div className="menu-heading">{menu.heading}</div>
                    <ul className="menu-list">
                      {menu.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={link.href}
                            className={`menu-link-text link ${isMenuActive(link) ? "activeMenu" : ""
                              }`}
                          >
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              <div className="col-lg-3">
                <div className="collection-item hover-img">
                  <div className="collection-inner">
                    <Link
                      href={`/home-men`}
                      className="collection-image img-style"
                    >
                      <Image
                        className="lazyload"
                        data-src="/images/collections/collection-1.jpg"
                        alt="collection-demo-1"
                        src="/images/collections/collection-1.jpg"
                        width="1000"
                        height="1215"
                      />
                    </Link>
                    <div className="collection-content">
                      <Link
                        href={`/home-men`}
                        className="tf-btn hover-icon btn-xl collection-title fs-16"
                      >
                        <span>Men</span>
                        <i className="icon icon-arrow1-top-left" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="collection-item hover-img">
                  <div className="collection-inner">
                    <Link
                      href={`/shop-women`}
                      className="collection-image img-style"
                    >
                      <Image
                        className="lazyload"
                        data-src="/images/collections/collection-2.jpg"
                        alt="collection-demo-1"
                        src="/images/collections/collection-2.jpg"
                        width="500"
                        height="607"
                      />
                    </Link>
                    <div className="collection-content">
                      <Link
                        href={`/shop-women`}
                        className="tf-btn btn-xl collection-title fs-16 hover-icon"
                      >
                        <span>Women</span>
                        <i className="icon icon-arrow1-top-left" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li> */}
      {/* <li className="menu-item">
        <a
          href="#"
          className={`item-link ${Linkfs} ${textColor}  ${isMenuActive(productDetailPages) ? "activeMenu" : ""
            }`}
        >
          Products
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu mega-menu">
          <div className="container">
            <div className="row">
              {productDetailPages.map((menuItem, index) => (
                <div key={index} className="col-lg-2">
                  <div className="mega-menu-item">
                    <div className="menu-heading">{menuItem.heading}</div>
                    <ul className="menu-list">
                      {menuItem.links.map((linkItem, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={linkItem.href}
                            className={`menu-link-text link position-relative  ${isMenuActive(linkItem) ? "activeMenu" : ""
                              }`}
                          >
                            {linkItem.text}
                            {linkItem.extra}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              <div className="col-lg-4">
                <div className="menu-heading">Best seller</div>
                <div className="hover-sw-nav hover-sw-2">
                  <Swiper
                    dir="ltr"
                    modules={[Navigation]}
                    navigation={{
                      prevEl: ".snmpn1",
                      nextEl: ".snmnn1",
                    }}
                    slidesPerView={2}
                    spaceBetween={30}
                    className="swiper tf-product-header wrap-sw-over"
                  >
                    {[...products1]
                      .slice(0, 4)

                      .map((elm, i) => (
                        <SwiperSlide key={i} className="swiper-slide">
                          <ProductCard product={elm} />
                        </SwiperSlide>
                      ))}
                  </Swiper>
                  <div className="nav-sw nav-next-slider nav-next-product-header box-icon w_46 round snmpn1">
                    <span className="icon icon-arrow-left" />
                  </div>
                  <div className="nav-sw nav-prev-slider nav-prev-product-header box-icon w_46 round snmnn1">
                    <span className="icon icon-arrow-right" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li> */}
      {/* <li className="menu-item position-relative">
        <a
          href="#"
          className={`item-link ${Linkfs} ${textColor}  ${isMenuActive(pages) ? "activeMenu" : ""
            }`}
        >
          Pages
          <i className="icon icon-arrow-down" />
        </a>
        <div className="sub-menu submenu-default">
          <ul className="menu-list">
            {pages.map((item, index) => (
              <li key={index} className={item.links ? "menu-item-2 " : ""}>
                {item.href.includes("#") ? (
                  <a
                    href={item.href}
                    className={`${item.className} ${isMenuActive(item.links) ? "activeMenu" : ""
                      }`}
                  >
                    {item.text}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={`${item.className}  ${isMenuActive(item) ? "activeMenu" : ""
                      }`}
                    style={{ position: "relative" }}
                  >
                    {item.text}{" "}
                    {item.label && (
                      <div className="demo-label">
                        <span className="demo-new">{item.label}</span>
                      </div>
                    )}
                  </Link>
                )}

                {item.links && (
                  <div className="sub-menu submenu-default">
                    <ul className="menu-list">
                      {item.links.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            href={subItem.href}
                            className={`${subItem.className} ${isMenuActive(subItem) ? "activeMenu" : ""
                              }`}
                          >
                            {subItem.text}
                            {subItem.label && (
                              <div className="demo-label">
                                <span className="demo-new">
                                  {subItem.label}
                                </span>
                              </div>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </li> */}
      {/* <li className="menu-item position-relative">
        <a
          href="#"
          className={`item-link ${Linkfs} ${textColor}  ${isMenuActive(blogLinks) ? "activeMenu" : ""
            }`}
        >
          Blog
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu links-default">
          <ul className="menu-list">
            {blogLinks.map((linkItem, index) => (
              <li key={index}>
                <Link
                  href={linkItem.href}
                  className={`menu-link-text link text_black-2  ${isMenuActive(linkItem) ? "activeMenu" : ""
                    }`}
                >
                  {linkItem.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li> */}
      <li className="menu-item position-relative">
        <a
          href="/"
          className={`item-link ${Linkfs} ${textColor} ${
            isMenuActive(homeLinks) ? "activeMenu" : ""
          }`}
        >
          Home
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu links-default">
          <ul className="menu-list">
            {homeLinks.map((linkItem, index) => (
              <li key={index}>
                <Link
                  href={linkItem.href}
                  className={`menu-link-text link text_black-2 ${
                    isMenuActive(linkItem) ? "activeMenu" : ""
                  }`}
                >
                  {linkItem.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
      <li className="menu-item position-relative">
        <a
          href="/shop-default"
          className={`item-link ${Linkfs} ${textColor} ${
            isShopMainLinkActive ? "activeMenu" : "" // Main shop link active only if no filters
          }`}
        >
          Shop
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu links-default">
          <ul className="menu-list">
            {filterMetadataLoaded ? ( // Only render dynamic links once metadata is loaded
              dynamicShopLinks.map((linkItem, index) => (
                <li key={index}>
                  <Link
                    href={linkItem.href}
                    className={`menu-link-text link text_black-2 ${
                      isMenuActive(linkItem) ? "activeMenu" : ""
                    }`}
                  >
                    {linkItem.text}
                  </Link>
                </li>
              ))
            ) : (
              <li>Loading categories...</li> // Show loading state
            )}
          </ul>
        </div>
      </li>
      <li className="menu-item position-relative">
        <a
          href="/contact-us"
          className={`item-link ${Linkfs} ${textColor} ${
            isMenuActive(contactLinks) ? "activeMenu" : ""
          }`}
        >
          Contact
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu links-default">
          <ul className="menu-list">
            {contactLinks.map((linkItem, index) => (
              <li key={index}>
                <Link
                  href={linkItem.href}
                  className={`menu-link-text link text_black-2 ${
                    isMenuActive(linkItem) ? "activeMenu" : ""
                  }`}
                >
                  {linkItem.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
      <li className="menu-item position-relative">
        <a
          href="/contact-us" // This should probably be /help-center or similar if you have a help page
          className={`item-link ${Linkfs} ${textColor} ${
            isMenuActive(helpLinks) ? "activeMenu" : ""
          }`}
        >
          Help
          {isArrow ? <i className="icon icon-arrow-down" /> : ""}
        </a>
        <div className="sub-menu links-default">
          <ul className="menu-list">
            {helpLinks.map((linkItem, index) => (
              <li key={index}>
                <Link
                  href={linkItem.href}
                  className={`menu-link-text link text_black-2 ${
                    isMenuActive(linkItem) ? "activeMenu" : ""
                  }`}
                >
                  {linkItem.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
    </>
  );
}
