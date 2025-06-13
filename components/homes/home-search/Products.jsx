// app/search/page.jsx or pages/search.jsx
'use client';

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/utlis/firebaseConfig"; // Ensure this path is correct for your project
import { useRouter } from 'next/navigation'; // For Next.js App Router
import { ProductCard } from "../../shopCards/ProductCard";

export default function Products() {
  const router = useRouter();
  const [dynamicQuickLinks, setDynamicQuickLinks] = useState([]);
  const [isLoadingQuickLinks, setIsLoadingQuickLinks] = useState(true);

  const [allFirestoreProducts, setAllFirestoreProducts] = useState([]);
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Quick Links Fetching ---
  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        const docRef = doc(db, 'metadata', 'productFilters');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const categories = data.categories || [];

          const transformedLinks = categories.map(cat => ({
            name: cat.name,
            href: `/shop-default?filter=${encodeURIComponent(cat.name)}`,
          }));

          transformedLinks.push({
            name: "New Arrivals",
            href: `/shop-default?filter=${encodeURIComponent("New Arrivals")}`,
          });

          setDynamicQuickLinks(transformedLinks);
        }
      } catch (error) {
        console.error("Error fetching quick links for Search Page:", error);
      } finally {
        setIsLoadingQuickLinks(false);
      }
    };
    fetchQuickLinks();
  }, []);

  // --- Fetch all products from Firestore on component mount ---
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoadingAllProducts(true);
      try {
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(productsCol);
        const productsList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllFirestoreProducts(productsList);
      } catch (error) {
        console.error("Error fetching all products from Firestore for Search Page:", error);
      } finally {
        setIsLoadingAllProducts(false);
      }
    };
    fetchAllProducts();
  }, []); // Empty dependency array means this runs once on mount

  // --- Click Handlers for Links ---
  // No modal to close, so directly navigate
  const handleQuickLinkClick = (e, href) => {
    e.preventDefault();
    router.push(href);
  };

  const handleProductLinkClick = (e, productId) => {
    e.preventDefault();
    router.push(`/product-detail/${productId}`);
  };

  // --- Search Logic (Debounce) ---
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  const performSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lowerCaseQuery = query.toLowerCase();

    const filtered = allFirestoreProducts.filter(product =>
      (product.title && product.title.toLowerCase().includes(lowerCaseQuery)) ||
      (product.description && product.description.toLowerCase().includes(lowerCaseQuery)) ||
      (product.category && product.category.toLowerCase().includes(lowerCaseQuery))
    );

    setSearchResults(filtered);
    setIsSearching(false);
  }, [allFirestoreProducts]);

  const debouncedPerformSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedPerformSearch(query);
  };

  const handleSearchFormSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <div className="flat-spacing-8 page-search-inner">
      <div className="tf-search-head">
        <form
          onSubmit={handleSearchFormSubmit}
          className="tf-mini-search-frm"
        >
          <fieldset className="text">
            <input
              required
              type="text"
              placeholder="Search"
              className=""
              name="text"
              tabIndex={0}
              value={searchQuery} // Controlled input
              onChange={handleSearchInputChange}
              aria-required="true"
            />
          </fieldset>
          <button className="" type="submit">
            <i className="icon-search" />
          </button>
        </form>
        {/* Quick links adapted from SearchModal */}
        <div className="tf-col-quicklink px_15">
          <span className="title">Quick link:</span>
          {isLoadingQuickLinks ? (
            <span>Loading quick links...</span>
          ) : (
            dynamicQuickLinks.map((linkItem, index) => (
              <React.Fragment key={index}>
                <Link
                  href={linkItem.href}
                  onClick={(e) => handleQuickLinkClick(e, linkItem.href)}
                >
                  {linkItem.name}
                </Link>
                {index < dynamicQuickLinks.length - 1 && ","}
                &nbsp;
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-12">
            {searchQuery.trim() !== '' ? (
              // Display search results if search query is NOT empty
              <div className="tf-search-results">
                <div className="tf-search-content-title">
                  Search Results for "{searchQuery}"
                </div>
                {isSearching || isLoadingAllProducts ? (
                  <p>Loading results...</p>
                ) : searchResults.length > 0 ? (
                  <div className="tf-search-results-inner row"> {/* Added row for grid layout */}
                    {searchResults.map((product) => (
                      <div key={product.id} className="col-lg-3 col-md-4 col-6"> {/* Grid columns */}
                        {/* Render ProductCard here, passing the product data */}
                        {/* Make sure ProductCard component is available or inline the rendering */}
                        <ProductCard product={product} onProductClick={() => handleProductLinkClick(null, product.id)}/>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No products found for "{searchQuery}".</p>
                )}
              </div>
            ) : (
              // Display "Need some inspiration?" ONLY if search query IS empty
              <div className="tf-col-content">
                <div className="tf-search-content-title">
                  Need some inspiration?
                </div>
                <div className="tf-search-hidden-inner row"> {/* Added row for grid layout */}
                  {isLoadingAllProducts ? (
                    <p>Loading inspiration products...</p>
                  ) : (
                    allFirestoreProducts.slice(0, 8).map((product) => ( // Display a few inspiration products
                      <div key={product.id} className="col-lg-3 col-md-4 col-6"> {/* Grid columns */}
                        <ProductCard product={product} onProductClick={() => handleProductLinkClick(null, product.id)}/>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}