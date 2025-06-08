import React, { useRef } from 'react';
import { ProductCard } from "../shopCards/ProductCard";
import Productcard23 from "../shopCards/Productcard23";
import ProductNotFound from "../othersPages/productNotFound"; // Make sure the path is correct

export default function ProductGrid({
  gridItems = 4, allproducts = [],
  onClearFilter
}) {

  if (!allproducts.length) {
    return <ProductNotFound onClearFilter={onClearFilter} />;
  }
  return (
    <>
      {gridItems == 1 ? (
        <div className="grid-layout" data-grid="grid-list">
          {/* card product 1 */}
          {allproducts.map((elm, i) => (
            <Productcard23 product={elm} key={i} />
          ))}
          {/* card product 2 */}
        </div>
      ) : (
        <div
          className="grid-layout wrapper-shop"
          data-grid={`grid-${gridItems}`}
        >
          {/* card product 1 */}
          {allproducts.map((elm, i) => (
            <ProductCard product={elm} key={i} />
          ))}
        </div>
      )}
    </>
  );
}
