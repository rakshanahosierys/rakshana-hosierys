"use client";
import React from "react";

export default function Pagination({ currentPage, totalPages, setCurrentPage }) {
  const pagesToShow = [];

  if (currentPage > 1) pagesToShow.push(currentPage - 1);
  pagesToShow.push(currentPage);
  if (currentPage < totalPages) pagesToShow.push(currentPage + 1);

  return (
    <>
      {/* Previous Button */}
      <li className={currentPage === 1 ? "disabled" : ""}>
        <a
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          className="pagination-link animate-hover-btn"
          aria-disabled={currentPage === 1}
        >
          <span className="icon icon-arrow-left" />
        </a>
      </li>

      {/* Centered page numbers */}
      {pagesToShow.map((page) => (
        <li key={page} className={currentPage === page ? "active" : ""}>
          <a
            className={`pagination-link animate-hover-btn ${currentPage === page ? "current-page" : ""}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </a>
        </li>
      ))}

      {/* Next Button */}
      <li className={currentPage === totalPages ? "disabled" : ""}>
        <a
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          className="pagination-link animate-hover-btn"
          aria-disabled={currentPage === totalPages}
        >
          <span className="icon icon-arrow-right" />
        </a>
      </li>
    </>
  );
}
