"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useCampareProductModal } from "@/store/useCampareProductModal";
import { useContextElement } from "@/context/Context";

export default function ColorCompare() {
  const { selectedCampareProduct } = useCampareProductModal();

  const { addProductToCart } = useContextElement();
  // Local state for size selection
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  // Render the modal wrapper always
  return (
    <div
      className="modal fade modalDemo tf-product-modal modal-part-content"
      id="compare_color"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {!selectedCampareProduct ? (
            <div className="p-4 text-center">Loading product data...</div>
          ) : (
            <>
              <div className="header">
                <div className="demo-title">Compare color</div>
                <span
                  className="icon-close icon-close-popup"
                  data-bs-dismiss="modal"
                />
              </div>

              <div className="tf-compare-color-wrapp">
                <div className="tf-compare-color-grid">
                  {selectedCampareProduct.colors.map((color, index) => (
                    <div className="tf-compare-color-item" key={index}>
                      <div className="tf-compare-color-top">
                        <Image
                          src={color.imgSrc || "/images/shop/products/default.jpg"}
                          alt={`Color variant - ${color.name}`}
                          width={713}
                          height={1070}
                        />
                      </div>

                      <div className="tf-compare-color-bottom">
                        <div className="tf-compare-color-color">
                          <span className={`tf-color-list-color ${color.colorClass}`} />
                          <span>{color.name}</span>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()}>
                          <select className="tf-select" name="size" required value={selectedSizeIndex}
                            onChange={(e) => setSelectedSizeIndex(Number(e.target.value))}
                          >
                            {selectedCampareProduct.sizes.map((size, i) => (
                              <option key={i} value={i}>
                                {size} - ₹{" "}
                                {(
                                  selectedCampareProduct.price -
                                  (selectedCampareProduct.price *
                                    selectedCampareProduct.discount) /
                                  100
                                ).toFixed(2)}
                              </option>
                            ))}
                          </select>
                          <br />
                          <br />
                          <button
                            type="button"
                            className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
                            onClick={() => {
                              const selectedColor = selectedCampareProduct.colors[index];
                              const selectedSize = selectedCampareProduct.sizes[selectedSizeIndex];

                              const productToAdd = {
                                ...selectedCampareProduct,
                                selectedColor,
                                selectedSize,
                                quantity: 1,
                                price: (
                                  selectedCampareProduct.price -
                                  (selectedCampareProduct.price *
                                    selectedCampareProduct.discount) /
                                  100
                                ).toFixed(2),
                              };

                              addProductToCart(productToAdd);
                            }}
                          >
                            <span>Add to cart</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
