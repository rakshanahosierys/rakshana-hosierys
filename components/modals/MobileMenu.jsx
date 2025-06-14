"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation"; // Import useSearchParams
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "@/utlis/firebaseConfig"; // Import your Firestore instance

import LanguageSelect from "../common/LanguageSelect";
import CurrencySelect from "../common/CurrencySelect";
import { useAuth } from "@/context/AuthContext"; // Import useAuth from your Firebase AuthContext

// Assuming navItems is a static array defined elsewhere,
// we'll modify it dynamically or create a dynamic version for the shop section.
import { navItems as staticNavItems } from "@/data/menu"; // Rename to avoid conflict

export default function MobileMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Get the search params object

  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // State for dynamic shop links
  const [dynamicShopLinks, setDynamicShopLinks] = useState([]);
  const [isDynamicShopLinksLoaded, setIsDynamicShopLinksLoaded] = useState(false);

  // Fetch filter metadata for shop categories
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const docRef = doc(db, 'metadata', 'productFilters');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const categories = data.categories || [];

          const transformedLinks = categories.map(cat => ({
            label: cat.name, // Using 'label' for menu items
            href: `/shop-default?filter=${encodeURIComponent(cat.name)}`,
            filterValue: cat.name, // Store the filter value for active check
          }));

          // Add "New Arrivals" as a dynamic link
          transformedLinks.push({
            label: "New Arrivals",
            href: `/shop-default?filter=${encodeURIComponent("New Arrivals")}`,
            filterValue: "New Arrivals",
          });

          // Add the "Shop All" link
          transformedLinks.unshift({
            label: "Shop All",
            href: "/shop-default",
            filterValue: null, // Indicates no specific filter
          });

          setDynamicShopLinks(transformedLinks);
        }
      } catch (error) {
        console.error("Error fetching filter metadata for MobileMenu:", error);
      } finally {
        setIsDynamicShopLinksLoaded(true);
      }
    };
    fetchMetadata();
  }, []); // Run once on mount

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      setIsUserDropdownOpen(false); // Close dropdown after logout
    } catch (error) {
      console.error("Error logging out:", error);
      // Optionally show an error message
    }
  };

  // Refactored isMenuActive function for better readability and query param handling
  const isMenuActive = (menuItem) => {
    // Helper to check a single link's active state
    const checkSingleLinkActive = (href, itemFilterValue) => {
      if (!href) return false;

      const [basePath] = href.split('?');
      const targetPathname = basePath; // Use full base path for comparison

      // Check if the current URL's pathname matches the target link's base path
      if (targetPathname !== pathname) {
        return false;
      }

      // If it's a shop-default link, check for filter query parameter
      if (targetPathname === '/shop-default') {
        const currentFilterValue = searchParams.get('filter');

        // Case 1: Target link is '/shop-default' (Shop All)
        if (itemFilterValue === null) { // This indicates the "Shop All" link
          return currentFilterValue === null || currentFilterValue === ''; // Active if no filter param
        }
        // Case 2: Target link has a specific filter param
        return currentFilterValue === itemFilterValue;
      }

      // For other links (non-shop-default), simple pathname match is enough
      return true;
    };

    // Case 1: menuItem is a single link object (e.g., { href: '/about', label: 'About' })
    if (menuItem.href) {
      return checkSingleLinkActive(menuItem.href, menuItem.filterValue);
    }

    // Case 2: menuItem is a group of links (e.g., { id: 'shop', label: 'Shop', links: [...] })
    if (menuItem.links && Array.isArray(menuItem.links)) {
      // Recursively check if any sub-link is active
      return menuItem.links.some(link => isMenuActive(link));
    }

    // Fallback for unexpected menuItem structures
    return false;
  };

// Dynamically create the full navigation structure including dynamic shop links
  const mobileNavItems = staticNavItems.map(item => {
    // CHANGE THIS LINE to match the ID from your navItems:
    if (item.id === 'dropdown-menu-two') { // Now correctly targets the 'Shop' item
      return {
        ...item,
        links: isDynamicShopLinksLoaded ? dynamicShopLinks : [{ label: "Loading...", href: "#" }]
      };
    }
    return item;
  });

  return (
    <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
      <span
        className="icon-close icon-close-popup"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      />
      <div className="mb-canvas-content">
        <div className="mb-body">
          <ul className="nav-ul-mb" id="wrapper-menu-navigation">
            {mobileNavItems.map((item, i) => ( // Use mobileNavItems here
              <li key={i} className="nav-mb-item">
                <a
                  href={`#${item.id}`}
                  className={`collapsed mb-menu-link current ${
                    isMenuActive(item) ? "activeMenu" : ""
                  }`}
                  data-bs-toggle="collapse"
                  aria-expanded="true"
                  aria-controls={item.id}
                >
                  <span>{item.label}</span>
                  <span className="btn-open-sub" />
                </a>
                <div id={item.id} className="collapse">
                  <ul className="sub-nav-menu">
                    {item.links.map((subItem, i2) => (
                      <li key={i2}>
                        {subItem.links ? ( // Check for nested sub-menus
                          <>
                            <a
                              href={`#${subItem.id}`}
                              className={`sub-nav-link collapsed ${
                                isMenuActive(subItem) ? "activeMenu" : ""
                              }`}
                              data-bs-toggle="collapse"
                              aria-expanded="true"
                              aria-controls={subItem.id}
                            >
                              <span>{subItem.label}</span>
                              <span className="btn-open-sub" />
                            </a>
                            <div id={subItem.id} className="collapse">
                              <ul className="sub-nav-menu sub-menu-level-2">
                                {subItem.links.map((innerItem, i3) => (
                                  <li key={i3}>
                                    <Link
                                      href={innerItem.href}
                                      className={`sub-nav-link ${
                                        isMenuActive(innerItem)
                                          ? "activeMenu"
                                          : ""
                                      }`}
                                    >
                                      {innerItem.label}
                                      {innerItem.demoLabel && (
                                        <div className="demo-label">
                                          <span className="demo-new">New</span>
                                        </div>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          // Direct link
                          <Link
                            href={subItem.href}
                            className={`sub-nav-link ${
                              isMenuActive(subItem) ? "activeMenu" : ""
                            }`}
                          >
                            {subItem.label}
                            {subItem.demoLabel && (
                              <div className="demo-label">
                                <span className="demo-new">New</span>
                              </div>
                            )}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
          <div className="mb-other-content">
            <div className="d-flex group-icon">
              <Link href={`/wishlist`} className="site-nav-icon">
                <i className="icon icon-heart" />
                Wishlist
              </Link>
              <Link href={`/home-search`} className="site-nav-icon">
                <i className="icon icon-search" />
                Search
              </Link>
            </div>
            <div className="mb-notice">
              <Link href={`/contact-us`} className="text-need">
                Need help ?
              </Link>
            </div>
            <ul className="mb-info">
              <li>
                Address: No 18, 2nd St Ext, Appachi Nagar, Kongu Nagar, Tiruppur, Tamil Nadu 641607
              </li>
              <li>
                Email: <b>rakshanahosierys@gmail.com</b>
              </li>
              <li>
                Phone: <b>(+91) 94881 61177</b>
              </li>
            </ul>
          </div>
        </div>
        <div className="mb-bottom">
          {/* Conditional rendering for Login/Account */}
          {authLoading ? (
            <div className="mobile-menu-spinner"></div>
          ) : isAuthenticated ? (
            <div className="mobile-user-menu-container" ref={userDropdownRef}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                }}
                className="site-nav-icon mobile-user-menu-trigger"
              >
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="User Avatar"
                    width={24}
                    height={24}
                    className="mobile-avatar-image"
                  />
                ) : (
                  <i className="icon icon-account" />
                )}
                <span className="mobile-user-name">
                  {user?.displayName || user?.email?.split('@')[0] || 'Account'}
                </span>
                <span className={`mobile-dropdown-arrow ${isUserDropdownOpen ? 'arrow-up' : 'arrow-down'}`} />
              </a>

              {isUserDropdownOpen && (
                <ul className="nav-ul-mb">
                  <li className="nav-mb-item">
                    <Link href="/my-account" onClick={() => setIsUserDropdownOpen(false)}>
                      My Profile
                    </Link>
                  </li>
                  <li className="nav-mb-item">
                    <Link href="/my-account-orders" onClick={() => setIsUserDropdownOpen(false)}>
                      My Orders
                    </Link>
                  </li>
                  <li className="nav-mb-item">
                    <Link href="" onClick={handleLogout}>Logout </Link>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link href={`/login`} className="site-nav-icon">
              <i className="icon icon-account" />
              Login
            </Link>
          )}
          <div className="bottom-bar-language">
            <div className="tf-currencies">
              <CurrencySelect />
            </div>
            <div className="tf-languages">
              <LanguageSelect
                parentClassName={
                  "image-select center style-default type-languages"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}