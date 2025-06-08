"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ShareModal() {
  const pathname = usePathname();
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    // Build full URL (assumes client-side)
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin + pathname);
    }
  }, [pathname]);

  // Copy to clipboard handler
  const handleCopyClick = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  // Social share URLs using the currentUrl
  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`,
    instagram: `https://www.instagram.com/`, // Instagram does not have official share URL
    tiktok: `https://www.tiktok.com/`, // TikTok no official share URL for pages
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}`,
  };

  return (
    <div
      className="modal modalCentered fade modalDemo tf-product-modal modal-part-content"
      id="share_social"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">Share</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="overflow-y-auto">
            <ul className="tf-social-icon d-flex gap-10">
              <li>
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-facebook bg_line"
                >
                  <i className="icon icon-fb" />
                </a>
              </li>
              <li>
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-twiter bg_line"
                >
                  <i className="icon icon-Icon-x" />
                </a>
              </li>
              <li>
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-instagram bg_line"
                >
                  <i className="icon icon-instagram" />
                </a>
              </li>
              <li>
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-tiktok bg_line"
                >
                  <i className="icon icon-tiktok" />
                </a>
              </li>
              <li>
                <a
                  href={socialLinks.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-pinterest bg_line"
                >
                  <i className="icon icon-pinterest-1" />
                </a>
              </li>
            </ul>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="form-share"
              method="post"
              acceptCharset="utf-8"
            >
              <fieldset>
                <input
                  type="text"
                  value={currentUrl}
                  readOnly
                  tabIndex={0}
                  aria-required="true"
                />
              </fieldset>
              <div className="button-submit">
                <button
                  className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                  type="button"
                  onClick={handleCopyClick}
                >
                  Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
