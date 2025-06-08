"use client";

import { useEffect, useState } from "react";
import ProductReviews from "./ProductReviews"; // Import the ProductReviews component

const tabs = [
  { title: "Description", active: true },
  { title: "Additional Information", active: false },
  { title: "Reviews", active: false}, // New Reviews tab
  { title: "Shipping Delivery", active: false },
  { title: "Delivery Return", active: false },
  { title: "Privacy Policy", active: false },
  { title: "Terms and Conditions", active: false },
];

export default function ShopDetailsTab({ product }) {
  const [currentTab, setCurrentTab] = useState(1);

  return (
    <section
      className="flat-spacing-17 pt_0"
      style={{ maxWidth: "100vw", overflow: "clip" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="widget-tabs style-has-border">
              <ul className="widget-menu-tab">
                {tabs.map((elm, i) => (
                  <li
                    key={i}
                    onClick={() => setCurrentTab(i + 1)}
                    className={`item-title ${currentTab == i + 1 ? "active" : ""
                      } `}
                  >
                    <span className="inner">{elm.title}</span>
                  </li>
                ))}
              </ul>
              <div className="widget-content-tab">
                <div
                  className={`widget-content-inner ${currentTab == 1 ? "active" : ""
                    } `}
                >
                  <div className="">
                    <p className="mb_30">
                      {product.description}
                    </p>
                    <div className="tf-product-des-demo">
                      <div className="right">
                        <h3 className="fs-16 fw-5">Features</h3>
                        <ul>
                          <li>Front button placket</li>
                          <li>Adjustable sleeve tabs</li>
                          <li>Babaton embroidered crest at placket and hem</li>
                        </ul>
                        <h3 className="fs-16 fw-5">Materials Care</h3>
                        <ul className="mb-0">
                          <li>Content: 100% LENZING™ ECOVERO™ Viscose</li>
                          <li>Care: Hand wash</li>
                          <li>Imported</li>
                        </ul>
                      </div>
                      <div className="left">
                        <h3 className="fs-16 fw-5">Materials Care</h3>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-machine" />
                          </div>
                          <span>Machine wash max. 30ºC. Short spin.</span>
                        </div>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-iron" />
                          </div>
                          <span>Iron maximum 110ºC.</span>
                        </div>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-bleach" />
                          </div>
                          <span>Do not bleach/bleach.</span>
                        </div>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-dry-clean" />
                          </div>
                          <span>Do not dry clean.</span>
                        </div>
                        <div className="d-flex gap-10 align-items-center">
                          <div className="icon">
                            <i className="icon-tumble-dry" />
                          </div>
                          <span>Tumble dry, medium hear.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${currentTab == 2 ? "active" : ""
                    } `}
                >
                  <table className="tf-pr-attrs">
                    <tbody>
                      <tr className="tf-attr-pa-color">
                        <th className="tf-attr-label">Color</th>
                        <td className="tf-attr-value">
                          <p>{product?.colors?.map(c => c.name).join(", ") || ""}</p>
                        </td>
                      </tr>
                      <tr className="tf-attr-pa-size">
                        <th className="tf-attr-label">Size</th>
                        <td className="tf-attr-value">
                          <p>{product?.sizes?.join(", ") || ""}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Tab 3: Reviews - NEW TAB */}
                <div
                  className={`widget-content-inner ${currentTab === 3 ? "active" : ""}`}
                >
                  <ProductReviews productId={product.id} />
                </div>

                {/* --- Shipping Delivery --- */}
                <div className={`widget-content-inner ${currentTab == 4 ? "active" : ""}`}>
                  <div className="tf-page-privacy-policy">
                    <div className="title">Shipping Delivery</div>
                    <p>
                      Learn about how we handle shipping, processing times, and courier
                      partners. Our shipping process is designed to get your order to you
                      quickly and safely.
                    </p>
                    <a href="/shipping-delivery" className="btn-link">Read more</a>
                  </div>
                </div>

                {/* --- Delivery Return --- */}
                <div className={`widget-content-inner ${currentTab == 5 ? "active" : ""}`}>
                  <div className="tf-page-privacy-policy">
                    <div className="title">Delivery Return</div>
                    <p>
                      We accept returns within 7 days of delivery under certain conditions.
                      Read our full return policy to learn how to request a return or
                      exchange.
                    </p>
                    <a href="/delivery-return" className="btn-link">Read more</a>
                  </div>
                </div>

                {/* --- Privacy Policy --- */}
                <div className={`widget-content-inner ${currentTab == 6 ? "active" : ""}`}>
                  <div className="tf-page-privacy-policy">
                    <div className="title">Privacy Policy</div>
                    <p>
                      Your data is safe with us. We follow best practices to ensure your
                      personal information is protected. Learn how we store, use, and manage
                      your data.
                    </p>
                    <a href="/privacy-policy" className="btn-link">Read more</a>
                  </div>
                </div>

                {/* --- Terms and Conditions --- */}
                <div className={`widget-content-inner ${currentTab == 7 ? "active" : ""}`}>
                  <div className="tf-page-privacy-policy">
                    <div className="title">Terms and Conditions</div>
                    <p>
                      Please review our website terms and conditions which govern your use
                      of our platform, services, and content. By using our website, you
                      agree to comply.
                    </p>
                    <a href="/terms-conditions" className="btn-link">Read more</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
