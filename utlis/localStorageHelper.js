// src/utils/localStorageHelper.js

const RECENT_PRODUCTS_KEY = "recentlyViewedProducts";
const MAX_RECENT_PRODUCTS = 8; // Adjust this limit as needed

/**
 * Retrieves the list of recently viewed products from localStorage.
 * @returns {Array<Object>} An array of product objects.
 */
export const getRecentlyViewedProducts = () => {
  if (typeof window === "undefined") {
    return []; // Return empty array if not in browser environment
  }
  try {
    const storedProducts = localStorage.getItem(RECENT_PRODUCTS_KEY);
    return storedProducts ? JSON.parse(storedProducts) : [];
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
};

/**
 * Adds a product to the recently viewed list in localStorage.
 * It ensures uniqueness and maintains a maximum limit.
 * @param {Object} product - The product object to add.
 * It should at least have an 'id' property.
 */
export const addProductToRecentlyViewed = (product) => {
  if (typeof window === "undefined" || !product || !product.id) {
    return; // Do nothing if not in browser or product/id is missing
  }

  let products = getRecentlyViewedProducts();

  // Remove the product if it already exists to move it to the front
  products = products.filter((p) => p.id !== product.id);

  // Add the new product to the beginning of the array
  products.unshift(product);

  // Trim the array to the maximum limit
  if (products.length > MAX_RECENT_PRODUCTS) {
    products = products.slice(0, MAX_RECENT_PRODUCTS);
  }

  try {
    localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
};

/**
 * Clears the recently viewed products from localStorage.
 */
export const clearRecentlyViewedProducts = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(RECENT_PRODUCTS_KEY);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};