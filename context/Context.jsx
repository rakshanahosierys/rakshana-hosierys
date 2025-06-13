"use client";
import { allProducts } from "@/data/products";
import { openCartModal } from "@/utlis/openCartModal";
import React, { useEffect } from "react";
import { useContext, useState } from "react";

const dataContext = React.createContext();

export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const [cartProducts, setCartProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [compareItem, setCompareItem] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderNotes, setOrderNotes] = useState(""); // Add this line for order notes

  // Effect to calculate total price whenever cartProducts change
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      const discount = product.discount || 0; // default to 0 if no discount
      const discountedPrice = product.price * (1 - discount / 100);
      return accumulator + product.quantity * discountedPrice;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  // Functions for cart management
  const addProductToCart = (product, selectedColor, selectedSize, qty = 1) => {
    const existingIndex = cartProducts.findIndex(
      (p) =>
        p.id === product.id &&
        p.selectedColor?.name === selectedColor?.name &&
        p.selectedSize === selectedSize
    );

    if (existingIndex !== -1) {
      const updatedCart = [...cartProducts];
      updatedCart[existingIndex].quantity += qty;
      setCartProducts(updatedCart);
    } else {
      const newItem = {
        ...product,
        quantity: qty,
        selectedColor,
        selectedSize,
      };
      setCartProducts((prev) => [...prev, newItem]);
    }

    openCartModal();
  };

  const isAddedToCartProducts = (product, selectedColor, selectedSize, qty = null) => {
    const existingItem = cartProducts.find(
      (p) =>
        p.id === product.id &&
        p.selectedColor?.name === selectedColor?.name &&
        p.selectedSize === selectedSize
    );

    if (!existingItem) return false;
    if (qty !== null && existingItem.quantity === qty) return "same";
    return "update"; // same variant but quantity differs
  };

  const updateQuantity = (product, selectedColor, selectedSize, qty) => {
    const updatedCart = [...cartProducts];
    const index = updatedCart.findIndex(
      (p) =>
        p.id === product.id &&
        p.selectedColor?.name === selectedColor?.name &&
        p.selectedSize === selectedSize
    );

    if (index !== -1) {
      updatedCart[index].quantity = qty;
      setCartProducts(updatedCart);
      openCartModal();
    } else {
      // Optional: auto add if not found
      addProductToCart(product, selectedColor, selectedSize, qty);
    }
  };

  // Functions for wishlist management
  const addToWishlist = (id) => {
    if (!wishList.includes(id)) {
      setWishList((pre) => [...pre, id]);
    } else {
      setWishList((pre) => [...pre].filter((elm) => elm !== id));
    }
  };

  const removeFromWishlist = (id) => {
    if (wishList.includes(id)) {
      setWishList((pre) => [...pre.filter((elm) => elm !== id)]);
    }
  };

  const isAddedtoWishlist = (id) => {
    return wishList.includes(id);
  };

  // Functions for compare item management
  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };

  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm !== id)]);
    }
  };

  const isAddedtoCompareItem = (id) => {
    return compareItem.includes(id);
  };

  // --- Local Storage Effects ---

  // Load cart products from local storage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const items = JSON.parse(localStorage.getItem("cartList"));
      if (items && items.length) { // Ensure items exist and are not empty
        setCartProducts(items);
      }
    }
  }, []);

  // Save cart products to local storage whenever cartProducts change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cartList", JSON.stringify(cartProducts));
    }
  }, [cartProducts]);

  // Load wishlist from local storage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const items = JSON.parse(localStorage.getItem("wishlist"));
      if (items && items.length) { // Ensure items exist and are not empty
        setWishList(items);
      }
    }
  }, []);

  // Save wishlist to local storage whenever wishList changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(wishList));
    }
  }, [wishList]);

    // Load compareItem from local storage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const items = JSON.parse(localStorage.getItem("compareItem"));
      if (items && items.length) { // Ensure items exist and are not empty
        setCompareItem(items);
      }
    }
  }, []);

    // Save compareItem to local storage whenever compareItem changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("compareItem", JSON.stringify(compareItem));
    }
  }, [compareItem]);

  // New: Load order notes from local storage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const notes = localStorage.getItem("orderNotes");
      if (notes) {
        setOrderNotes(notes);
      }
    }
  }, []);

  // New: Save order notes to local storage whenever orderNotes change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("orderNotes", orderNotes);
    }
  }, [orderNotes]);


  const contextElement = {
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    removeFromWishlist,
    addToWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromCompareItem,
    compareItem,
    setCompareItem,
    updateQuantity,
    orderNotes, // Expose orderNotes
    setOrderNotes, // Expose setOrderNotes
  };

  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}