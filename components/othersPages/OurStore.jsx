import React from "react";
import Link from "next/link";
import Image from "next/image";
export default function OurStore() {
  return (
    <>
      <section className="flat-spacing-16">
        <div className="container">
          <div className="tf-grid-layout md-col-2">
            <div className="tf-ourstore-img">
              <Image
                className="lazyload"
                data-src="/images/shop/store/ourstore2.png"
                alt="our-store"
                src="/images/shop/store/ourstore2.png"
                width={720}
                height={506}
              />
            </div>
            <div className="tf-ourstore-content">
              <h5 className="mb_24">Rakshana Hosierys</h5>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Address</strong>
                </p>
                <p>No 18, 2nd St Ext, Appachi Nagar, Kongu Nagar, Tiruppur, Tamil Nadu 641607</p>
              </div>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Phone</strong>
                </p>
                <p>(+91) 94881 61177</p>
              </div>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Email</strong>
                </p>
                <p>rakshanahosierys@gmail.com</p>
              </div>
              <div className="mb_36">
                <p className="mb_15">
                  <strong>Hours</strong>
                </p>
                <p className="mb_15">Mon - Fri 9am - 8:30pm</p>
                <p>Sat - Sun Closed</p>
              </div>
              <div className="mb_30">
                <ul className="tf-social-icon d-flex gap-15 style-default">
                  <li>
                    <a
                      href="https://www.instagram.com/classyfox_india"
                      className="box-icon link round social-instagram border-line-black"
                    >
                      <i className="icon fs-16 icon-instagram" />
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <Link
                  href={`/contact-us`}
                  className="tf-btn btn-outline-dark radius-3"
                >
                  <span>Get Directions</span>
                  <i className="icon icon-arrow-right" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
