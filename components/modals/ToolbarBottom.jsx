"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CartLength from "../common/CartLength";
import WishlistLength from "../common/WishlistLength";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import styles from './ToolbarBottom.module.css'; // Import the CSS module

export default function ToolbarBottom() {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const { openLoginModal } = useModal();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    e.preventDefault();
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error logging out:", error);
      // Optionally show an error message
    }
  };

  return (
    <div className="tf-toolbar-bottom type-1150">
      <div className="toolbar-item active">
        <a
          href="#toolbarShopmb"
          data-bs-toggle="offcanvas"
          aria-controls="offcanvasLeft"
        >
          <div className="toolbar-icon">
            <i className="icon-shop" />
          </div>
          <div className="toolbar-label">Shop</div>
        </a>
      </div>

      <div className="toolbar-item">
        <a
          href="#canvasSearch"
          data-bs-toggle="offcanvas"
          aria-controls="offcanvasLeft"
        >
          <div className="toolbar-icon">
            <i className="icon-search" />
          </div>
          <div className="toolbar-label">Search</div>
        </a>
      </div>

      {/* Account/Login Section - Now with consistent root element */}
      <div className={`${styles.accountDropdownContainer} toolbar-item`} ref={dropdownRef}>
        {authLoading ? (
          <div className={styles.spinnerWrapper}>
            <div className={styles.spinner}></div>
            <div className={styles.toolbarLabel}>Loading</div>
          </div>
        ) : isAuthenticated ? (
          <div
            className={styles.userMenu} // Apply styles to make it look like a button/link
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen ? "true" : "false"}
          >
            <div className="toolbar-icon">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="User Avatar"
                  width={24}
                  height={24}
                  className={styles.avatarImage}
                />
              ) : (
                <i className="icon-account" />
              )}
            </div>
            <div className={styles.toolbarLabel}>
              {user?.displayName || user?.email?.split('@')[0] || 'Account'}
            </div>

            {isDropdownOpen && (
              <ul className={styles.dropdownMenu}>
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
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <div // Changed from <a> to <div> for consistency and controlled onClick
            className={styles.userMenu} // Apply styles to make it look like a button/link
            onClick={(e) => {
              e.preventDefault(); // Prevent default anchor behavior if it were an <a>
              openLoginModal();
            }}
          >
            <div className="toolbar-icon">
              <i className="icon-account" />
            </div>
            <div className={styles.toolbarLabel}>Account</div>
          </div>
        )}
      </div>

      <div className="toolbar-item">
        <Link href={`/wishlist`}>
          <div className="toolbar-icon">
            <i className="icon-heart" />
            <div className="toolbar-count">
              <WishlistLength />
            </div>
          </div>
          <div className="toolbar-label">Wishlist</div>
        </Link>
      </div>

      <div className="toolbar-item">
        <a href="#shoppingCart" data-bs-toggle="modal">
          <div className="toolbar-icon">
            <i className="icon-bag" />
            <div className="toolbar-count">
              <CartLength />
            </div>
          </div>
          <div className="toolbar-label">Cart</div>
        </a>
      </div>
    </div>
  );
}