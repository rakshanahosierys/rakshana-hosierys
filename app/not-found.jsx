import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import Image from "next/image";
import Link from "next/link";
import React from "react";
export const metadata = {
  title: "Page Not Found - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function notFound() {
  return (
    <>
      <Header7 />
      <section className="page-404-wrap">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="image">
                <Image
                  alt="image"
                  src="/images/item/404.svg"
                  width="394"
                  height="319"
                />
              </div>
              <div className="title">Oops...That link is broken.</div>
              <p>
                Sorry for the inconvenience. Go to our homepage to check out our
                latest collections.
              </p>
              <Link
                href="/"
                className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
