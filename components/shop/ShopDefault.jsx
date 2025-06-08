// components/ShopDefault.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "@/utlis/firebaseConfig";
import ProductGrid from './ProductGrid';
import Pagination from '../common/Pagination';
import ShopFilter from './ShopFilter';
import Sorting from './Sorting';
import { layouts } from '@/data/shop';
import { useSearchParams } from 'next/navigation'; // <--- IMPORT THIS

export default function ShopDefault() {
  const shopFilterRef = useRef();
  const [gridItems, setGridItems] = useState(4);
  const [products, setProducts] = useState([]);
  const [finalSorted, setFinalSorted] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // READ THE URL PARAMETER HERE
  const searchParams = useSearchParams();
  const initialFilterCategoryName = searchParams.get('filter'); // Gets the value of 'filter' (e.g., "Men")

  // Derived pagination
  const totalPages = Math.ceil(finalSorted.length / itemsPerPage);
  const paginatedProducts = finalSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
      setFinalSorted(productList);
    };
    fetchProducts();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [finalSorted]);

  return (
    <>
      <section className="flat-spacing-2">
        <div className="container">
          <div className="tf-shop-control grid-3 align-items-center">
            <div className="tf-control-filter">
              <a
                href="#filterShop"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
                className="tf-btn-filter"
              >
                <span className="icon icon-filter" />
                <span className="text">Filter</span>
              </a>
            </div>
            <ul className="tf-control-layout d-flex justify-content-center">
              {layouts.map((layout, index) => (
                <li
                  key={index}
                  className={`tf-view-layout-switch ${layout.className} ${
                    gridItems === layout.dataValueGrid ? 'active' : ''
                  }`}
                  onClick={() => setGridItems(layout.dataValueGrid)}
                >
                  <div className="item">
                    <span className={`icon ${layout.iconClass}`} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="tf-control-sorting d-flex justify-content-end">
              <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                <Sorting setFinalSorted={setFinalSorted} products={products} />
              </div>
            </div>
          </div>
          <div className="wrapper-control-shop">
            <ProductGrid allproducts={paginatedProducts} gridItems={gridItems} onClearFilter={() => shopFilterRef.current?.clearFilter()}/>

            {finalSorted.length > itemsPerPage && (
              <ul className="tf-pagination-wrap tf-pagination-list tf-pagination-btn">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </ul>
            )}
          </div>
        </div>
      </section>
      <ShopFilter ref={shopFilterRef} products={products} setFinalSorted={setFinalSorted} initialFilterCategoryName={initialFilterCategoryName} />
    </>
  );
}