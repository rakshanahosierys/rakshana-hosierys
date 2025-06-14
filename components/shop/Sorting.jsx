"use client";
import { sortingOptions } from "@/data/shop";
import React, { useEffect, useState } from "react";

export default function Sorting({ products, setFinalSorted }) {
  const [selectedOptions, setSelectedOptions] = useState(sortingOptions[0]);

  useEffect(() => {
    if (selectedOptions.text == "Default") {
      setFinalSorted([...products]);
    } else if (selectedOptions.text == "Alphabetically, A-Z") {
      setFinalSorted(
        [...products].sort((a, b) => a.title.localeCompare(b.title))
      );
    } else if (selectedOptions.text == "Alphabetically, Z-A") {
      setFinalSorted(
        [...products].sort((a, b) => b.title.localeCompare(a.title))
      );
    } else if (selectedOptions.text == "Price, low to high") {
      setFinalSorted([...products].sort((a, b) => a.price - b.price));
    } else if (selectedOptions.text == "Price, high to low") {
      setFinalSorted([...products].sort((a, b) => b.price - a.price));
    } else if (selectedOptions.text === "Newest") {
      setFinalSorted(
        [...products].sort(
          (a, b) =>
            b.productCreatedAt.toDate() - a.productCreatedAt.toDate()
        )
      );
    } else if (selectedOptions.text === "Oldest") {
      setFinalSorted(
        [...products].sort(
          (a, b) =>
            a.productCreatedAt.toDate() - b.productCreatedAt.toDate()
        )
      );
    }
  }, [products, selectedOptions]);

  return (
    <>
      {" "}
      <div className="btn-select">
        <span className="text-sort-value">{selectedOptions.text}</span>
        <span className="icon icon-arrow-down" />
      </div>
      <div className="dropdown-menu">
        {sortingOptions.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedOptions(item)}
            className={`select-item ${item == selectedOptions ? "active" : ""}`}
          >
            <span className="text-value-item">{item.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
