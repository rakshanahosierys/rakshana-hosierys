// components/SearchModal.jsx
'use client';

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
// REMOVE THIS LINE: import { tfLoopItems } from "@/data/products";
import { doc, getDoc, collection, getDocs } from "firebase/firestore"; // Add collection, getDocs
import { db } from "@/utlis/firebaseConfig";
import { useRouter } from 'next/navigation';

export default function SearchModal() {
  const router = useRouter();
  const [dynamicQuickLinks, setDynamicQuickLinks] = useState([]);
  const [isLoadingQuickLinks, setIsLoadingQuickLinks] = useState(true);

  // NEW STATES for Firestore products
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
        console.error("Error fetching quick links for SearchModal:", error);
      } finally {
        setIsLoadingQuickLinks(false);
      }
    };
    fetchQuickLinks();
  }, []);

  // --- NEW: Fetch all products from Firestore on component mount ---
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoadingAllProducts(true);
      try {
        const productsCol = collection(db, 'products'); // 'products' is your Firestore collection name
        const productSnapshot = await getDocs(productsCol);
        const productsList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllFirestoreProducts(productsList);
      } catch (error) {
        console.error("Error fetching all products from Firestore:", error);
      } finally {
        setIsLoadingAllProducts(false);
      }
    };
    fetchAllProducts();
  }, []); // Empty dependency array means this runs once on mount

  // --- Common Helper to Close Modal ---
  const closeSearchModal = async () => {
    const offcanvasElement = document.getElementById('canvasSearch');
    if (offcanvasElement) {
      try {
        const { Offcanvas } = await import('bootstrap');
        return new Promise(resolve => {
          setTimeout(() => {
            const bsOffcanvas = Offcanvas.getInstance(offcanvasElement) || new Offcanvas(offcanvasElement);
            bsOffcanvas.hide();
            resolve();
          }, 100);
        });
      } catch (importError) {
        console.error("Error importing or using Bootstrap Offcanvas:", importError);
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  };

  // --- Click Handlers for Links ---
  const handleQuickLinkClick = async (e, href) => {
    e.preventDefault();
    await closeSearchModal();
    router.push(href);
  };

  const handleProductLinkClick = async (e, productId) => {
    e.preventDefault();
    await closeSearchModal();
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

    // IMPORTANT: Filter against allFirestoreProducts now!
    const filtered = allFirestoreProducts.filter(product =>
      (product.title && product.title.toLowerCase().includes(lowerCaseQuery)) ||
      (product.description && product.description.toLowerCase().includes(lowerCaseQuery)) ||
      (product.category && product.category.toLowerCase().includes(lowerCaseQuery))
      // Add more fields if needed (e.g., product.brand, product.tags)
    );

    setSearchResults(filtered);
    setIsSearching(false);
  }, [allFirestoreProducts]); // Depend on allFirestoreProducts so search updates if products change

  const debouncedPerformSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedPerformSearch(query);
  };

  const handleSearchFormSubmit = async (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <div className="offcanvas offcanvas-end canvas-search" id="canvasSearch">
      <div className="canvas-wrapper">
        <header className="tf-search-head">
          <div className="title fw-5">
            Search our site
            <div className="close">
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
          </div>
          <div className="tf-search-sticky">
            <form
              onSubmit={handleSearchFormSubmit}
              className="tf-mini-search-frm"
            >
              <fieldset className="text">
                <input
                  type="text"
                  placeholder="Search"
                  className=""
                  name="text"
                  tabIndex={0}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  aria-required="true"
                  required
                />
              </fieldset>
              <button className="" type="submit">
                <i className="icon-search" />
              </button>
            </form>
          </div>
        </header>
        <div className="canvas-body p-0">
          <div className="tf-search-content">
            {/* Always display Quick links */}
            <div className="tf-col-quicklink">
              <div className="tf-search-content-title fw-5">Quick link</div>
              <ul className="tf-quicklink-list">
                {isLoadingQuickLinks ? (
                  <li className="tf-quicklink-item">Loading quick links...</li>
                ) : (
                  dynamicQuickLinks.map((linkItem, index) => (
                    <li key={index} className="tf-quicklink-item">
                      <Link
                        href={linkItem.href}
                        className=""
                        onClick={(e) => handleQuickLinkClick(e, linkItem.href)}
                      >
                        {linkItem.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {searchQuery.trim() !== '' ? ( // Display search results if search query is NOT empty
              <div className="tf-search-results">
                <div className="tf-search-content-title fw-5">
                  Search Results for "{searchQuery}"
                </div>
                {isSearching || isLoadingAllProducts ? ( // Show loading if searching or if products are still loading
                  <p>Loading results...</p>
                ) : searchResults.length > 0 ? (
                  <div className="tf-search-results-inner">
                    {searchResults.map((product, index) => (
                      // Ensure product.id exists; Firebase docs have it
                      <div className="tf-loop-item" key={product.id || index}>
                        <div className="image">
                          <Link href={`/product-detail/${product.id}`} onClick={(e) => handleProductLinkClick(e, product.id)}>
                            <Image
                              alt={product.imgAlt || product.title} // Fallback alt text
                              src={product.imgSrc}
                              width={product.imgWidth || 40} // Provide default width/height if not always in Firebase
                              height={product.imgHeight || 48}
                            />
                          </Link>
                        </div>
                        <div className="content">
                          <Link href={`/product-detail/${product.id}`} onClick={(e) => handleProductLinkClick(e, product.id)}>
                            {product.title}
                          </Link>
                          <div className="tf-product-info-price">
                            {product.isOnSale ? (
                              <>
                                <div className="compare-at-price">
                                  ₹{product.compareAtPrice?.toFixed(2)}
                                </div>
                                <div className="price-on-sale fw-6">
                                  ₹{product.salePrice?.toFixed(2)}
                                </div>
                              </>
                            ) : (
                              <div className="price fw-6">
                                ₹{product.price?.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No products found for "{searchQuery}".</p>
                )}
              </div>
            ) : ( // Display "Need some inspiration?" ONLY if search query IS empty
              <div className="tf-col-content">
                <div className="tf-search-content-title fw-5">
                  Need some inspiration?
                </div>
                <div className="tf-search-hidden-inner">
                  {isLoadingAllProducts ? (
                    <p>Loading inspiration products...</p>
                  ) : (
                    // Display a subset of allFirestoreProducts (e.g., first 6)
                    allFirestoreProducts.slice(0, 6).map((product, index) => (
                      <div className="tf-loop-item" key={product.id || index}>
                        <div className="image">
                          <Link href={`/product-detail/${product.id}`} onClick={(e) => handleProductLinkClick(e, product.id)}>
                            <Image
                              alt={product.imgAlt || product.title}
                              src={product.imgSrc}
                              width={product.imgWidth || 40}
                              height={product.imgHeight || 48}
                            />
                          </Link>
                        </div>
                        <div className="content">
                          <Link href={`/product-detail/${product.id}`} onClick={(e) => handleProductLinkClick(e, product.id)}>
                            {product.title}
                          </Link>
                          <div className="tf-product-info-price">
                            {product.isOnSale ? (
                              <>
                                <div className="compare-at-price">
                                  ₹{product.compareAtPrice?.toFixed(2)}
                                </div>
                                <div className="price-on-sale fw-6">
                                  ₹{product.salePrice?.toFixed(2)}
                                </div>
                              </>
                            ) : (
                              <div className="price fw-6">
                                ₹{product.price?.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
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