"use client";
import { allProducts } from "@/data/products";
import { openCartModal } from "@/utlis/openCartModal";
// import { openCart } from "@/utlis/toggleCart";
import React, { useEffect } from "react";
import { useContext, useState } from "react";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const [cartProducts, setCartProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [compareItem, setCompareItem] = useState([1, 2, 3]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
useEffect(() => {
  const subtotal = cartProducts.reduce((accumulator, product) => {
    const discount = product.discount || 0; // default to 0 if no discount
    const discountedPrice = product.price * (1 - discount / 100);
    return accumulator + product.quantity * discountedPrice;
  }, 0);
  setTotalPrice(subtotal);
}, [cartProducts]);

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
  const addToWishlist = (id) => {
    if (!wishList.includes(id)) {
      setWishList((pre) => [...pre, id]);
    } else {
      setWishList((pre) => [...pre].filter((elm) => elm != id));
    }
  };
  const removeFromWishlist = (id) => {
    if (wishList.includes(id)) {
      setWishList((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };
  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const isAddedtoWishlist = (id) => {
    if (wishList.includes(id)) {
      return true;
    }
    return false;
  };
  const isAddedtoCompareItem = (id) => {
    if (compareItem.includes(id)) {
      return true;
    }
    return false;
  };
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartList"));
    if (items?.length) {
      setCartProducts(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(cartProducts));
  }, [cartProducts]);
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("wishlist"));
    if (items?.length) {
      setWishList(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishList));
  }, [wishList]);

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
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
