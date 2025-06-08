"use client";
import Drift from "drift-zoom";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Slider1ZoomOuter({
  currentColor,
  handleColor = () => { },
  firstImage,
  images,
}) {
  const [updatedImages, setUpdatedImages] = useState(() => {
    if (!images || images.length === 0) return [];

    // Insert firstImage if it's unique and not already in images
    const alreadyExists = images.some((img) => img.src === firstImage);

    if (firstImage && !alreadyExists) {
      return [
        {
          id: 0,
          src: firstImage,
          dataValue: 'default',
          width: 720,
          height: 1005,
        },
        ...images,
      ];
    }

    return images;
  });

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const swiperRef = useRef(null);
  useEffect(() => {
    if (!currentColor || !swiperRef.current) return;

    // Find the matching image index
    const matchIndex = updatedImages.findIndex(
      (img) =>
        img.dataValue?.toLowerCase?.() === currentColor.toLowerCase?.()
    );

    if (matchIndex !== -1) {
      swiperRef.current.slideTo(matchIndex); // Update Swiper to show the correct image
    }
  }, [currentColor, updatedImages]);
  useEffect(() => {
    // Function to initialize Drift
    const imageZoom = () => {
      const driftAll = document.querySelectorAll(".tf-image-zoom");
      const pane = document.querySelector(".tf-zoom-main");

      driftAll.forEach((el) => {
        new Drift(el, {
          zoomFactor: 2,
          paneContainer: pane,
          inlinePane: false,
          handleTouch: false,
          hoverBoundingBox: true,
          containInline: true,
        });
      });
    };
    imageZoom();
    const zoomElements = document.querySelectorAll(".tf-image-zoom");

    const handleMouseOver = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) {
        parent.classList.add("zoom-active");
      }
    };

    const handleMouseLeave = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) {
        parent.classList.remove("zoom-active");
      }
    };

    zoomElements.forEach((element) => {
      element.addEventListener("mouseover", handleMouseOver);
      element.addEventListener("mouseleave", handleMouseLeave);
    });

    // Cleanup event listeners on component unmount
    return () => {
      zoomElements.forEach((element) => {
        element.removeEventListener("mouseover", handleMouseOver);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []); // Empty dependency array to run only once on mount

  return (
    <>
      <Swiper
        dir="ltr"
        direction="vertical"
        spaceBetween={10}
        slidesPerView={6}
        className="tf-product-media-thumbs other-image-zoom"
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        breakpoints={{
          0: {
            direction: "horizontal",
          },
          1150: {
            direction: "vertical",
          },
        }}
      >
        {updatedImages.map((slide, index) => (
          <SwiperSlide key={index} className="stagger-item">
            <div className="item">
              <Image
                className="lazyload"
                data-src={slide.src}
                alt={""}
                src={slide.src} // Optional fallback for non-lazy loading
                width={slide.width}
                height={slide.height}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Gallery>
        <Swiper
          dir="ltr"
          spaceBetween={10}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          className="tf-product-media-main"
          id="gallery-swiper-started"
          thumbs={{ swiper: thumbsSwiper }}
          modules={[Thumbs, Navigation]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => {
            if (updatedImages[swiper.activeIndex]?.dataValue) {
              handleColor(updatedImages[swiper.activeIndex].dataValue);
            }
          }}
        >
          {updatedImages.map((slide, index) => (
            <SwiperSlide key={index}>
              <Item
                original={slide.src}
                thumbnail={slide.src}
                width={slide.width}
                height={slide.height}
              >
                {({ ref, open }) => (
                  <a
                    className="item"
                    data-pswp-width={slide.width}
                    data-pswp-height={slide.height}
                    onClick={open}
                  >
                    <Image
                      className="tf-image-zoom lazyload"
                      data-zoom={slide.src}
                      data-src={slide.src}
                      ref={ref}
                      alt="image"
                      width={slide.width}
                      height={slide.height}
                      src={slide.src} // Optional fallback for non-lazy loading
                    />
                  </a>
                )}
              </Item>
            </SwiperSlide>
          ))}

          {/* Navigation buttons */}
          <div className="swiper-button-next button-style-arrow thumbs-next"></div>
          <div className="swiper-button-prev button-style-arrow thumbs-prev"></div>
        </Swiper>{" "}
      </Gallery>
    </>
  );
}
