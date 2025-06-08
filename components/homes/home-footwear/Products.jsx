"use client";

import ProductCard32 from "@/components/shopCards/ProductCard32";
import { products60 } from "@/data/products";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Products() {
  return (
    <section className="flat-spacing-26">
      <div className="container">
        <div className="flat-animate-tab">
          <ul
            className="widget-tab-3 d-flex justify-content-center wow fadeInUp"
            data-wow-delay="0s"
          >
            <li className="nav-tab-item">
              <a href="#bestSeller" className="active">
                Best seller
              </a>
            </li>
            <li className="nav-tab-item">
              <a href="#newArrivals">New arrivals</a>
            </li>
            <li className="nav-tab-item">
              <a href="#onSale">On Sale</a>
            </li>
          </ul>
          <div className="tab-content">
            <div className="tab-pane active show">
              <div className="wrap-carousel">
                <Swiper
                  dir="ltr"
                  className="swiper tf-sw-product-sell-1"
                  slidesPerView={4} // Equivalent to data-preview={4}
                  spaceBetween={30} // Equivalent to data-space-lg={30}
                  breakpoints={{
                    1024: {
                      slidesPerView: 4, // Equivalent to data-tablet={3}
                    },
                    640: {
                      slidesPerView: 3, // Equivalent to data-tablet={3}
                    },
                    0: {
                      slidesPerView: 2, // Equivalent to data-mobile={2}
                      spaceBetween: 15, // Equivalent to data-space-md={15}
                    },
                  }}
                  modules={[Pagination]}
                  pagination={{
                    clickable: true,
                    el: ".spd338",
                  }}
                >
                  {products60.map((product, i) => (
                    <SwiperSlide key={i}>
                      <ProductCard32 product={product} />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="sw-dots style-2 sw-pagination-sell-1 justify-content-center spd338" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
