"use client";
import { useState } from "react";
import { useContextElement } from "@/context/Context";
import { products1 } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
export default function ShopCart() {
  const [agreed, setAgreed] = useState(true);
  const { cartProducts, totalPrice, setCartProducts, setQuickViewItem } =
    useContextElement();
  const setQuantity = (productId, quantity, selectedColor, selectedSize) => {
    if (quantity >= 1) {
      setCartProducts((prev) =>
        prev.map((item) => {
          if (
            item.id === productId &&
            item.selectedColor?.name === selectedColor?.name &&
            item.selectedSize === selectedSize
          ) {
            return { ...item, quantity };
          }
          return item;
        })
      );
    }
  };
  const removeFromCart = (productId, selectedColor, selectedSize) => {
    setCartProducts((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === productId &&
            item.selectedColor?.name === selectedColor?.name &&
            item.selectedSize === selectedSize
          )
      )
    );
  };

  const addNoteRef = useRef();
  const addGiftRef = useRef();

  return (
    <div className="modal fullRight fade modal-shopping-cart" id="shoppingCart">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="header">
            <div className="title fw-5">Shopping cart</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="wrap">
            <div className="tf-mini-cart-threshold">
              <div className="tf-progress-bar">
                <span style={{ width: `${Math.min((totalPrice / 2000) * 100, 100)}%` }}>
                  <div className="progress-car">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={21}
                      height={14}
                      viewBox="0 0 21 14"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 0.875C0 0.391751 0.391751 0 0.875 0H13.5625C14.0457 0 14.4375 0.391751 14.4375 0.875V3.0625H17.3125C17.5867 3.0625 17.845 3.19101 18.0104 3.40969L20.8229 7.12844C20.9378 7.2804 21 7.46572 21 7.65625V11.375C21 11.8582 20.6082 12.25 20.125 12.25H17.7881C17.4278 13.2695 16.4554 14 15.3125 14C14.1696 14 13.1972 13.2695 12.8369 12.25H7.72563C7.36527 13.2695 6.39293 14 5.25 14C4.10706 14 3.13473 13.2695 2.77437 12.25H0.875C0.391751 12.25 0 11.8582 0 11.375V0.875ZM2.77437 10.5C3.13473 9.48047 4.10706 8.75 5.25 8.75C6.39293 8.75 7.36527 9.48046 7.72563 10.5H12.6875V1.75H1.75V10.5H2.77437ZM14.4375 8.89937V4.8125H16.8772L19.25 7.94987V10.5H17.7881C17.4278 9.48046 16.4554 8.75 15.3125 8.75C15.0057 8.75 14.7112 8.80264 14.4375 8.89937ZM5.25 10.5C4.76676 10.5 4.375 10.8918 4.375 11.375C4.375 11.8582 4.76676 12.25 5.25 12.25C5.73323 12.25 6.125 11.8582 6.125 11.375C6.125 10.8918 5.73323 10.5 5.25 10.5ZM15.3125 10.5C14.8293 10.5 14.4375 10.8918 14.4375 11.375C14.4375 11.8582 14.8293 12.25 15.3125 12.25C15.7957 12.25 16.1875 11.8582 16.1875 11.375C16.1875 10.8918 15.7957 10.5 15.3125 10.5Z"
                      />
                    </svg>
                  </div>
                </span>
              </div>
              <div className="tf-progress-msg">
                {totalPrice >= 2000 ? (
                  <span className="fw-6">You have unlocked Free Shipping! 🎉</span>
                ) : (
                  <>
                    Buy <span className="price fw-6">₹ {(2000 - totalPrice).toFixed(2)}</span> more to enjoy
                    <span className="fw-6"> Free Shipping</span>
                  </>
                )}
              </div>
            </div>
            <div className="tf-mini-cart-wrap">
              <div className="tf-mini-cart-main">
                <div className="tf-mini-cart-sroll">
                  <div className="tf-mini-cart-items">
                    {cartProducts.map((elm, i) => (
                      <div key={`${elm.id}-${elm.selectedColor?.name}-${elm.selectedSize}`} className="tf-mini-cart-item">
                        <div className="tf-mini-cart-image">
                          <Link href={`/product-detail/${elm.id}`}>
                            <Image
                              alt="image"
                              src={elm.imgSrc}
                              width={668}
                              height={932}
                              style={{ objectFit: "cover" }}
                            />
                          </Link>
                        </div>
                        <div className="tf-mini-cart-info">
                          <Link
                            className="title link"
                            href={`/product-detail/${elm.id}`}
                          >
                            {elm.title}
                          </Link>
                          <div className="meta-variant">{elm.selectedColor?.name} - {elm.selectedSize}</div>
                          <div className="price fw-6">
                            Price: ₹ {((elm.price - (elm.price * elm.discount) / 100) || elm.price).toFixed(2)} | Estimate: ₹ {(
                              ((elm.price - (elm.price * elm.discount) / 100) || elm.price) * elm.quantity
                            ).toFixed(2)}
                          </div>
                          <div className="tf-mini-cart-btns">
                            <div className="wg-quantity small">
                              <span
                                className="btn-quantity minus-btn"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity - 1, elm.selectedColor, elm.selectedSize)
                                }
                              >
                                -
                              </span>

                              <input
                                type="text"
                                name="number"
                                value={elm.quantity}
                                min={1}
                                onChange={(e) =>
                                  setQuantity(elm.id, Number(e.target.value), elm.selectedColor, elm.selectedSize)
                                }
                              />

                              <span
                                className="btn-quantity plus-btn"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity + 1, elm.selectedColor, elm.selectedSize)
                                }
                              >
                                +
                              </span>
                            </div>
                            <div
                              className="tf-mini-cart-remove"
                              style={{ cursor: "pointer" }}
                              onClick={() => removeFromCart(elm.id, elm.selectedColor, elm.selectedSize)}
                            >
                              Remove
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!cartProducts.length && (
                      <div className="container">
                        <div className="row align-items-center mt-5 mb-5">
                          <div className="col-12 fs-18">
                            Your shop cart is empty
                          </div>
                          <div className="col-12 mt-3">
                            <Link
                              href={`/shop-default`}
                              className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                              style={{ width: "fit-content" }}
                            >
                              Explore Products!
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="tf-minicart-recommendations">
                    <div className="tf-minicart-recommendations-heading">
                      <div className="tf-minicart-recommendations-title">
                        You may also like
                      </div>
                      <div className="sw-dots small style-2 cart-slide-pagination spdsc1" />
                    </div>
                    <Swiper
                      dir="ltr"
                      modules={[Pagination]}
                      pagination={{
                        clickable: true,
                        clickable: true,
                        el: ".spdsc1",
                      }}
                      className="swiper tf-cart-slide"
                    >
                      {products1.slice(0, 2).map((elm, i) => (
                        <SwiperSlide key={i} className="swiper-slide">
                          <div className="tf-minicart-recommendations-item">
                            <div className="tf-minicart-recommendations-item-image">
                              <Link href={`/product-detail/${elm.id}`}>
                                <Image
                                  alt="image"
                                  src={elm.imgSrc}
                                  width={720}
                                  height={1005}
                                />
                              </Link>
                            </div>
                            <div className="tf-minicart-recommendations-item-infos flex-grow-1">
                              <Link
                                className="title"
                                href={`/product-detail/${1}`}
                              >
                                {elm.title}
                              </Link>
                              <div className="price">
                                ₹ {elm.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="tf-minicart-recommendations-item-quickview">
                              <a
                                href="#quick_view"
                                data-bs-toggle="modal"
                                onClick={() => setQuickViewItem(elm)}
                                className="btn-show-quickview quickview hover-tooltip"
                              >
                                <span className="icon icon-view" />
                              </a>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              </div>
              <div className="tf-mini-cart-bottom">
                <div className="tf-mini-cart-tool">
                  <div
                    className="tf-mini-cart-tool-btn btn-add-note"
                    onClick={() => addNoteRef.current.classList.add("open")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={18}
                      viewBox="0 0 16 18"
                      fill="currentColor"
                    >
                      <path d="M5.12187 16.4582H2.78952C2.02045 16.4582 1.39476 15.8325 1.39476 15.0634V2.78952C1.39476 2.02045 2.02045 1.39476 2.78952 1.39476H11.3634C12.1325 1.39476 12.7582 2.02045 12.7582 2.78952V7.07841C12.7582 7.46357 13.0704 7.77579 13.4556 7.77579C13.8407 7.77579 14.1529 7.46357 14.1529 7.07841V2.78952C14.1529 1.25138 12.9016 0 11.3634 0H2.78952C1.25138 0 0 1.25138 0 2.78952V15.0634C0 16.6015 1.25138 17.8529 2.78952 17.8529H5.12187C5.50703 17.8529 5.81925 17.5407 5.81925 17.1555C5.81925 16.7704 5.50703 16.4582 5.12187 16.4582Z" />
                      <path d="M15.3882 10.0971C14.5724 9.28136 13.2452 9.28132 12.43 10.0965L8.60127 13.9168C8.51997 13.9979 8.45997 14.0979 8.42658 14.2078L7.59276 16.9528C7.55646 17.0723 7.55292 17.1993 7.58249 17.3207C7.61206 17.442 7.67367 17.5531 7.76087 17.6425C7.84807 17.7319 7.95768 17.7962 8.07823 17.8288C8.19879 17.8613 8.32587 17.8609 8.44621 17.8276L11.261 17.0479C11.3769 17.0158 11.4824 16.9543 11.5675 16.8694L15.3882 13.0559C16.2039 12.2401 16.2039 10.9129 15.3882 10.0971ZM10.712 15.7527L9.29586 16.145L9.71028 14.7806L12.2937 12.2029L13.2801 13.1893L10.712 15.7527ZM14.4025 12.0692L14.2673 12.204L13.2811 11.2178L13.4157 11.0834C13.6876 10.8115 14.1301 10.8115 14.402 11.0834C14.6739 11.3553 14.6739 11.7977 14.4025 12.0692Z" />
                    </svg>
                  </div>
                  <div
                    className="tf-mini-cart-tool-btn btn-add-gift"
                    onClick={() => addGiftRef.current.classList.add("open")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={17}
                      height={18}
                      viewBox="0 0 17 18"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.99566 2.73409C2.99566 0.55401 5.42538 -0.746668 7.23916 0.463462L8.50073 1.30516L9.7623 0.463462C11.5761 -0.746668 14.0058 0.55401 14.0058 2.73409V3.24744H14.8225C15.9633 3.24744 16.8881 4.17233 16.8881 5.31312V6.82566C16.8881 7.21396 16.5734 7.52873 16.1851 7.52873H15.8905V15.1877C15.8905 15.1905 15.8905 15.1933 15.8905 15.196C15.886 16.7454 14.6286 18 13.0782 18H3.92323C2.37003 18 1.11091 16.7409 1.11091 15.1877V7.52877H0.81636C0.42806 7.52877 0.113281 7.21399 0.113281 6.82569V5.31316C0.113281 4.17228 1.03812 3.24744 2.179 3.24744H2.99566V2.73409ZM4.40181 3.24744H7.79765V2.52647L6.45874 1.63317C5.57987 1.0468 4.40181 1.67677 4.40181 2.73409V3.24744ZM9.20381 2.52647V3.24744H12.5996V2.73409C12.5996 1.67677 11.4216 1.0468 10.5427 1.63317L9.20381 2.52647ZM2.179 4.6536C1.81472 4.6536 1.51944 4.94888 1.51944 5.31316V6.12261H5.73398L5.734 4.6536H2.179ZM5.73401 7.52877V13.9306C5.73401 14.1806 5.86682 14.4119 6.08281 14.5379C6.29879 14.6639 6.56545 14.6657 6.78312 14.5426L8.50073 13.5715L10.2183 14.5426C10.436 14.6657 10.7027 14.6639 10.9187 14.5379C11.1346 14.4119 11.2674 14.1806 11.2674 13.9306V7.52873H14.4844V15.1603C14.4844 15.1627 14.4843 15.1651 14.4843 15.1675V15.1877C14.4843 15.9643 13.8548 16.5938 13.0782 16.5938H3.92323C3.14663 16.5938 2.51707 15.9643 2.51707 15.1877V7.52877H5.73401ZM15.482 6.12258V5.31312C15.482 4.94891 15.1867 4.6536 14.8225 4.6536H11.2674V6.12258H15.482ZM9.86129 4.6536H7.14017V12.7254L8.15469 12.1518C8.36941 12.0304 8.63204 12.0304 8.84676 12.1518L9.86129 12.7254V4.6536Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="tf-mini-cart-bottom-wrap">
                  <div className="tf-cart-totals-discounts">
                    <div className="tf-cart-total">Subtotal</div>
                    <div className="tf-totals-total-value fw-6">
                      ₹ {totalPrice.toFixed(2)} INR
                    </div>
                  </div>
                  <div className="tf-cart-tax">
                    Taxes and <a href="/shipping-delivery">shipping</a> calculated at checkout
                  </div>
                  <div className="tf-mini-cart-line" />
                  <div className="tf-cart-checkbox">
                    <div className="tf-checkbox-wrapp">
                      <input
                        type="checkbox"
                        id="CartDrawer-Form_agree"
                        name="agree_checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                      />
                      <div>
                        <i className="icon-check" />
                      </div>
                    </div>
                    <label htmlFor="CartDrawer-Form_agree">
                      I agree with the&nbsp;
                      <a href="/terms-conditions" title="Terms of Service">
                        terms and conditions
                      </a>
                    </label>
                  </div>
                  <div className="tf-mini-cart-view-checkout">
                    <Link
                      href={`/view-cart`}
                      className="tf-btn btn-outline radius-3 link w-100 justify-content-center"
                    >
                      View cart
                    </Link>
                    <Link
                      href={agreed ? `/checkout` : `#`}
                      className={`tf-btn btn-${!agreed ? "disabled" : "fill"} animate-hover-btn radius-3 w-100 justify-content-center}`}
                      onClick={(e) => {
                        if (!agreed) e.preventDefault();
                      }}
                    >
                     Check out
                    </Link>
                  </div>
                </div>
                </div>
              <div
                className="tf-mini-cart-tool-openable add-note"
                ref={addNoteRef}
              >
                <div
                  className="overplay tf-mini-cart-tool-close"
                  onClick={() => addNoteRef.current.classList.remove("open")}
                />
                <div className="tf-mini-cart-tool-content">
                  <label htmlFor="Cart-note" className="tf-mini-cart-tool-text">
                    <div className="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={18}
                        viewBox="0 0 16 18"
                        fill="currentColor"
                      >
                        <path d="M5.12187 16.4582H2.78952C2.02045 16.4582 1.39476 15.8325 1.39476 15.0634V2.78952C1.39476 2.02045 2.02045 1.39476 2.78952 1.39476H11.3634C12.1325 1.39476 12.7582 2.02045 12.7582 2.78952V7.07841C12.7582 7.46357 13.0704 7.77579 13.4556 7.77579C13.8407 7.77579 14.1529 7.46357 14.1529 7.07841V2.78952C14.1529 1.25138 12.9016 0 11.3634 0H2.78952C1.25138 0 0 1.25138 0 2.78952V15.0634C0 16.6015 1.25138 17.8529 2.78952 17.8529H5.12187C5.50703 17.8529 5.81925 17.5407 5.81925 17.1555C5.81925 16.7704 5.50703 16.4582 5.12187 16.4582Z" />
                        <path d="M15.3882 10.0971C14.5724 9.28136 13.2452 9.28132 12.43 10.0965L8.60127 13.9168C8.51997 13.9979 8.45997 14.0979 8.42658 14.2078L7.59276 16.9528C7.55646 17.0723 7.55292 17.1993 7.58249 17.3207C7.61206 17.442 7.67367 17.5531 7.76087 17.6425C7.84807 17.7319 7.95768 17.7962 8.07823 17.8288C8.19879 17.8613 8.32587 17.8609 8.44621 17.8276L11.261 17.0479C11.3769 17.0158 11.4824 16.9543 11.5675 16.8694L15.3882 13.0559C16.2039 12.2401 16.2039 10.9129 15.3882 10.0971ZM10.712 15.7527L9.29586 16.145L9.71028 14.7806L12.2937 12.2029L13.2801 13.1893L10.712 15.7527ZM14.4025 12.0692L14.2673 12.204L13.2811 11.2178L13.4157 11.0834C13.6876 10.8115 14.1301 10.8115 14.402 11.0834C14.6739 11.3553 14.6739 11.7977 14.4025 12.0692Z" />
                      </svg>
                    </div>
                    <span>Add Order Note</span>
                  </label>
                  <textarea
                    name="note"
                    id="Cart-note"
                    placeholder="How can we help you?"
                    defaultValue={""}
                  />
                  <div className="tf-cart-tool-btns justify-content-center">
                    <div
                      className="tf-mini-cart-tool-primary text-center w-100 fw-6 tf-mini-cart-tool-close "
                      onClick={() =>
                        addNoteRef.current.classList.remove("open")
                      }
                    >
                      Close
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="tf-mini-cart-tool-openable add-gift"
                ref={addGiftRef}
              >
                <div
                  className="overplay tf-mini-cart-tool-close"
                  onClick={() => addGiftRef.current.classList.remove("open")}
                />
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="tf-product-form-addgift"
                >
                  <div className="tf-mini-cart-tool-content">
                    <div className="tf-mini-cart-tool-text">
                      <div className="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.65957 3.64545C4.65957 0.73868 7.89921 -0.995558 10.3176 0.617949L11.9997 1.74021L13.6818 0.617949C16.1001 -0.995558 19.3398 0.73868 19.3398 3.64545V4.32992H20.4286C21.9498 4.32992 23.1829 5.56311 23.1829 7.08416V9.10087C23.1829 9.61861 22.7632 10.0383 22.2454 10.0383H21.8528V20.2502C21.8528 20.254 21.8527 20.2577 21.8527 20.2614C21.8467 22.3272 20.1702 24 18.103 24H5.89634C3.82541 24 2.14658 22.3212 2.14658 20.2502V10.0384H1.75384C1.23611 10.0384 0.816406 9.61865 0.816406 9.10092V7.08421C0.816406 5.56304 2.04953 4.32992 3.57069 4.32992H4.65957V3.64545ZM6.53445 4.32992H11.0622V3.36863L9.27702 2.17757C8.10519 1.39573 6.53445 2.2357 6.53445 3.64545V4.32992ZM12.9371 3.36863V4.32992H17.4649V3.64545C17.4649 2.2357 15.8942 1.39573 14.7223 2.17756L12.9371 3.36863ZM3.57069 6.2048C3.08499 6.2048 2.69128 6.59851 2.69128 7.08421V8.16348H8.31067L8.3107 6.2048H3.57069ZM8.31071 10.0384V18.5741C8.31071 18.9075 8.48779 19.2158 8.77577 19.3838C9.06376 19.5518 9.4193 19.5542 9.70953 19.3901L11.9997 18.0953L14.2898 19.3901C14.58 19.5542 14.9356 19.5518 15.2236 19.3838C15.5115 19.2158 15.6886 18.9075 15.6886 18.5741V10.0383H19.9779V20.2137C19.9778 20.2169 19.9778 20.2201 19.9778 20.2233V20.2502C19.9778 21.2857 19.1384 22.1251 18.103 22.1251H5.89634C4.86088 22.1251 4.02146 21.2857 4.02146 20.2502V10.0384H8.31071ZM21.308 8.16344V7.08416C21.308 6.59854 20.9143 6.2048 20.4286 6.2048H15.6886V8.16344H21.308ZM13.8138 6.2048H10.1856V16.9672L11.5383 16.2024C11.8246 16.0405 12.1748 16.0405 12.461 16.2024L13.8138 16.9672V6.2048Z"
                          />
                        </svg>
                      </div>
                      <div className="tf-gift-wrap-infos">
                        <p>Do you want a gift wrap?</p>
                        Only
                        <span className="price fw-6"> ₹5.00</span>
                      </div>
                    </div>
                    <div className="tf-cart-tool-btns">
                      <button
                        type="submit"
                        className="tf-btn fw-6 w-100 justify-content-center btn-fill animate-hover-btn radius-3"
                      >
                        <span>Add a gift wrap</span>
                      </button>
                      <div
                        className="tf-mini-cart-tool-primary text-center w-100 fw-6 tf-mini-cart-tool-close"
                        onClick={() =>
                          addGiftRef.current.classList.remove("open")
                        }
                      >
                        Cancel
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
