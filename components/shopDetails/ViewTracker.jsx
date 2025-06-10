// src/components/shopDetails/ViewTracker.jsx
"use client"; // This directive makes it a Client Component

import { useEffect } from 'react';
import { addProductToRecentlyViewed } from '@/utlis/localStorageHelper';

/**
 * A Client Component to track product views and update localStorage.
 * This component should be rendered on the product detail page.
 * It's intentionally a minimalist component that doesn't render any UI,
 * but only performs a side effect (updating local storage and SWR cache).
 */
export default function ViewTracker({ product }) {
  useEffect(() => {
    if (product && product.id) {
      // Add the product to recently viewed list in localStorage
      addProductToRecentlyViewed(product);

      // Trigger SWR revalidation for the 'recentlyViewedProducts-carousel' key
      // This will cause the RecentProducts component to re-fetch from localStorage
      // and update its display.
      //mutate('recentlyViewedProducts-carousel');
    }
  }, [product]); // Dependency array: run effect when 'product' prop changes

  // This component doesn't render any visible UI
  return null;
}