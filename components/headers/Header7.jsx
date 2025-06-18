"use client";

import React, { useState, useRef, useEffect } from "react"; // Import useState, useRef, useEffect
import { usePathname, useSearchParams } from "next/navigation";
import Nav from "./Nav";
import Image from "next/image";
import Link from "next/link";
import CartLength from "../common/CartLength";
import WishlistLength from "../common/WishlistLength";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext"; // Import useAuth from your Firebase AuthContext
import styles from './Header7.module.css'; // Create this CSS module for Header7 specific styles
import { useContextElement } from "@/context/Context";


export default function Header7() {
  const { wishList, cartProducts } = useContextElement(); // Get the raw lists from context

  const wishlistCount = wishList ? wishList.length : 0;
  const cartTotalQuantity = cartProducts ? cartProducts.length : 0;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { openLoginModal, closeLoginModal } = useModal();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth(); // Get user, isAuthenticated, logout, loading from AuthContext

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for closing dropdown on outside click

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault(); // Prevent default link/button behavior
    try {
      await logout(); // Call the logout function from AuthContext
      setIsDropdownOpen(false); // Close dropdown after logout
    } catch (error) {
      console.error("Error logging out:", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <header id="header" className="header-default header-style-2">
      <div className="main-header line">
        <div className="container-full px_15 lg-px_40">
          <div className="row wrapper-header align-items-center">
            <div className="col-xl-5 tf-md-hidden">
              <ul className="header-list-categories">
                <li className={`categories-item ${pathname === '/' ? 'active' : ''}`}>
                  <Link href={`/`} className="text-uppercase">
                    Classy Fox
                  </Link>
                </li>
                <li className={`categories-item ${pathname === '/shop-default' && searchParams.toString() === ''
                  ? 'active'
                  : ''
                  }`}>
                  <Link href={`/shop-default`} className="text-uppercase">
                    Shop
                  </Link>
                </li>
                {/* <li className={`categories-item ${pathname === '/shop-default' && searchParams.get('filter') === 'Men'
                  ? 'active'
                  : ''
                  }`}>
                  <Link href={`/shop-default?filter=Men`} className="text-uppercase">
                    Men
                  </Link>
                </li> */}
                <li className={`categories-item ${pathname === '/shop-default' && searchParams.get('filter') === 'Women'
                  ? 'active'
                  : ''
                  }`}>
                  <Link href={`/shop-default?filter=Women`} className="text-uppercase">
                    Women
                  </Link>
                </li>
                <li className={`categories-item ${pathname === '/shop-default' && searchParams.get('filter') === 'Kids'
                  ? 'active'
                  : ''
                  }`}>
                  <Link href={`/shop-default?filter=Kids`} className="text-uppercase">
                    Kids
                  </Link>
                </li>
                <li className={`categories-item ${pathname === '/store-locations' ? 'active' : ''}`}>
                  <Link href={`/store-locations`} className="text-uppercase">
                    Find a Store
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-md-4 col-3 tf-lg-hidden">
              <a
                href="#mobileMenu"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={16}
                  viewBox="0 0 24 16"
                  fill="none"
                >
                  <path
                    d="M2.00056 2.28571H16.8577C17.1608 2.28571 17.4515 2.16531 17.6658 1.95098C17.8802 1.73665 18.0006 1.44596 18.0006 1.14286C18.0006 0.839753 17.8802 0.549063 17.6658 0.334735C17.4515 0.120408 17.1608 0 16.8577 0H2.00056C1.69745 0 1.40676 0.120408 1.19244 0.334735C0.978109 0.549063 0.857702 0.839753 0.857702 1.14286C0.857702 1.44596 0.978109 1.73665 1.19244 1.95098C1.40676 2.16531 1.69745 2.28571 2.00056 2.28571ZM0.857702 8C0.857702 7.6969 0.978109 7.40621 1.19244 7.19188C1.40676 6.97755 1.69745 6.85714 2.00056 6.85714H22.572C22.8751 6.85714 23.1658 6.97755 23.3801 7.19188C23.5944 7.40621 23.7148 7.6969 23.7148 8C23.7148 8.30311 23.5944 8.59379 23.3801 8.80812C23.1658 9.02245 22.8751 9.14286 22.572 9.14286H2.00056C1.69745 9.14286 1.40676 9.02245 1.19244 8.80812C0.978109 8.59379 0.857702 8.30311 0.857702 8ZM0.857702 14.8571C0.857702 14.554 0.978109 14.2633 1.19244 14.049C1.40676 13.8347 1.69745 13.7143 2.00056 13.7143H12.2863C12.5894 13.7143 12.8801 13.8347 13.0944 14.049C13.3087 14.2633 13.4291 14.554 13.4291 14.8571C13.4291 15.1602 13.3087 15.4509 13.0944 15.6653C12.8801 15.8796 12.5894 16 12.2863 16H2.00056C1.69745 16 1.40676 15.8796 1.19244 15.6653C0.978109 15.4509 0.857702 15.1602 0.857702 14.8571Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
            <div className="col-xl-2 col-md-4 col-6 text-center">
              <Link href={`/`} className="logo-header">
                <Image
                  alt="logo"
                  className="logo"
                  src="/images/logo/rakshana-hosierys-logo.svg"
                  width={169}
                  height={21}
                />
              </Link>
            </div>
            <div className="col-xl-5 col-md-4 col-3">
              <ul className="nav-icon d-flex justify-content-end align-items-center gap-20">
                <li className="nav-search">
                  <a
                    href="#canvasSearch"
                    data-bs-toggle="offcanvas"
                    aria-controls="offcanvasLeft"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-search" />
                  </a>
                </li>
                {/* Account/Login Section - Conditional Rendering */}
                <li className={`${styles.accountDropdownContainer} nav-account`} ref={dropdownRef}>
                  {authLoading ? (
                    // Show a loading spinner or skeleton while auth status is being determined
                    <div className={styles.spinner}></div>
                  ) : isAuthenticated ? (
                    // User is logged in, show dropdown with avatar/icon
                    <div
                      className={styles.userMenu}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      aria-haspopup="true"
                      aria-expanded={isDropdownOpen ? "true" : "false"}
                    >
                      <div className={styles.avatar}>
                        {/* Display user's photoURL or a default icon/initials */}
                        {user?.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt="User Avatar"
                            width={32}
                            height={32}
                            className={styles.avatarImage}
                          />
                        ) : (
                          // Fallback to the default icon or user's first initial
                          <i className="icon icon-account" />
                        )}
                      </div>
                      
                      {isDropdownOpen && (
                        <ul className={styles.dropdownMenu}>
                          <li>
                            <span className={styles.userName}>
                              {user?.displayName || user?.email?.split('@')[0] || 'Account'}
                            </span>
                          </li>
                          <li>
                            <Link href="/my-account" onClick={() => setIsDropdownOpen(false)}>
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <Link href="/my-account-orders" onClick={() => setIsDropdownOpen(false)}>
                              My Orders
                            </Link>
                          </li>
                          {/* Add more links as needed */}
                          <li>
                            <button onClick={handleLogout}>Logout</button>
                          </li>
                        </ul>
                      )}
                    </div>
                  ) : (
                    // User is not logged in, show login/register link or icon
                    <a
                      href= {`/login?redirect=${encodeURIComponent(pathname)}`}
                      className="nav-icon-item"
                    >
                      <i className="icon icon-account" />
                    </a>
                  )}
                </li>
                <li className={`nav-wishlist ${wishlistCount === 0 ? 'no-items' : ''}`}> {/* Add 'no-items' class */}
                  <Link href={`/wishlist`} className="nav-icon-item">
                    <i className="icon icon-heart" />
                    {wishlistCount > 0 && ( // Only render span if count > 0
                      <span className="count-box">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li className={`nav-cart ${cartTotalQuantity === 0 ? 'no-items' : ''}`}> {/* Add 'no-items' class */}
                  <a
                    href="#shoppingCart"
                    data-bs-toggle="modal"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-bag" />
                    {cartTotalQuantity > 0 && ( // Only render span if count > 0
                      <span className="count-box">
                        {cartTotalQuantity}
                      </span>
                    )}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="header-bottom line">
        <div className="container-full px_15 lg-px_40">
          <div className="wrapper-header d-flex justify-content-center align-items-center">
            <nav className="box-navigation text-center">
              <ul className="box-nav-ul d-flex align-items-center justify-content-center gap-30">
                <Nav />
              </ul>
            </nav>
            <ul className="header-list-categories tf-lg-hidden">
              <li className={`categories-item ${pathname === '/' ? 'active' : ''}`}>
                <Link href={`/`} className="text-uppercase">
                  Classy Fox
                </Link>
              </li>
              <li className={`categories-item ${pathname === '/shop-default' && searchParams.toString() === ''
                ? 'active'
                : ''
                }`}>
                <Link href={`/shop-default`} className="text-uppercase">
                  Shop
                </Link>
              </li>
              {/* <li className={`categories-item ${pathname === '/shop-default' && searchParams.get('filter') === 'Men'
                ? 'active'
                : ''
                }`}>
                <Link href={`/shop-default?filter=Men`} className="text-uppercase">
                  Men
                </Link>
              </li> */}
              <li className={`categories-item ${pathname === '/shop-default' && searchParams.get('filter') === 'Women'
                ? 'active'
                : ''
                }`}>
                <Link href={`/shop-default?filter=Women`} className="text-uppercase">
                  Women
                </Link>
              </li>
              <li className={`categories-item ${pathname === '/shop-default' && searchParams.get('filter') === 'Kids'
                ? 'active'
                : ''
                }`}>
                <Link href={`/shop-default?filter=Kids`} className="text-uppercase">
                  Kids
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}