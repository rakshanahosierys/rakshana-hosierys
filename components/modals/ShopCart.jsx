"use client";
import { useState, useEffect, useRef } from "react";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Firebase and Firestore
import { db } from '@/utlis/firebaseConfig'; // Adjust this path to your firebase config file
import { collection, query, where, getDocs } from 'firebase/firestore';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

export default function ShopCart() {
  const [agreed, setAgreed] = useState(true);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  // New state to manage the open/closed state of the "Add Order Note" section
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  const { cartProducts, totalPrice, setCartProducts, setQuickViewItem, orderNotes, setOrderNotes } =
    useContextElement();

  /**
   * Sets the quantity for a product in the cart.
   * @param {string} productId - The ID of the product.
   * @param {number} quantity - The new quantity.
   * @param {object} selectedColor - The selected color object of the product.
   * @param {string} selectedSize - The selected size of the product.
   */
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

  /**
   * Removes a product from the cart.
   * @param {string} productId - The ID of the product to remove.
   * @param {object} selectedColor - The selected color object of the product.
   * @param {string} selectedSize - The selected size of the product.
   */
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

  // The ref is still useful if you need direct DOM access for other reasons,
  // but for class manipulation, state is preferred.
  // We'll keep it here in case the class manipulation was part of a larger animation library.
  const addNoteRef = useRef(null);

  // Effect hook to fetch best seller products from Firestore on component mount
  useEffect(() => {
    const fetchBestSellerProducts = async () => {
      try {
        // Reference to the 'products' collection in Firestore
        const productsCollectionRef = collection(db, 'products');
        // Query to filter for products where 'isBestSeller' is true
        const q = query(productsCollectionRef, where('isBestSeller', '==', true));
        // Execute the query and get the documents
        const querySnapshot = await getDocs(q);

        // Map the documents to product objects, including their ID
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBestSellerProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching best seller products:', error);
      }
    };

    fetchBestSellerProducts();
  }, []); // Empty dependency array ensures this runs only once on mount

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
                        el: ".spdsc1",
                      }}
                      className="swiper tf-cart-slide"
                    >
                      {/* Use bestSellerProducts here */}
                      {bestSellerProducts.slice(0, 2).map((elm, i) => (
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
                                href={`/product-detail/${elm.id}`}
                              >
                                {elm.title}
                              </Link>
                              <div className="price">
                                ₹ {elm.price ? elm.price.toFixed(2) : '0.00'}
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
                    // Toggle the state when this button is clicked
                    onClick={() => setIsAddNoteOpen(true)}
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
                {/* Conditionally apply the "open" class based on isAddNoteOpen state */}
                <div
                  className={`tf-mini-cart-tool-openable add-note ${isAddNoteOpen ? 'open' : ''}`}
                  ref={addNoteRef}
                >
                  <div
                    className="overplay tf-mini-cart-tool-close"
                    // Set the state to false to close the section
                    onClick={() => setIsAddNoteOpen(false)}
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
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      name="note"
                      id="Cart-note"
                      placeholder="How can we help you?"  
                    />
                    <div className="tf-cart-tool-btns justify-content-center">
                      <div
                        className="tf-mini-cart-tool-primary text-center w-100 fw-6 tf-mini-cart-tool-close "
                        // Set the state to false to close the section
                        onClick={() => setIsAddNoteOpen(false)}
                      >
                        Close
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
