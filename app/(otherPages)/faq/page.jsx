import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import Faq1 from "@/components/othersPages/faq/Faq1";
import Faq2 from "@/components/othersPages/faq/Faq2";
import Faq3 from "@/components/othersPages/faq/Faq3";
import React from "react";
import Link from "next/link";
export const metadata = {
  title: "FAQ - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
      <Header7 />
      <>
        <div className="tf-page-title style-2">
          <div className="container-full">
            <div className="heading text-center">FAQ</div>
          </div>
        </div>
        {/* /page-title */}
        {/* FAQ */}
        <section className="flat-spacing-11">
          <div className="container">
            <div className="tf-accordion-wrap d-flex justify-content-between">
              <div className="content">
                <Faq1 />
                <Faq2 />
                <Faq3 />
              </div>
              <div className="box tf-other-content radius-10 bg_grey-8">
                <h5 className="mb_20">Have a question</h5>
                <p className="text_black-2 mb_40">
                  If you have a question or need assistance, feel free to reach out to us through our contact form or email.
We're here to help and will get back to you as soon as possible.
                </p>
                <div className="d-flex gap-20 align-items-center">
                  <Link
                    href={`/contact-us`}
                    className="tf-btn radius-3 btn-fill animate-hover-btn justify-content-center"
                  >
                    Contact us
                  </Link>
                  <Link href={`/reach-out`} className="tf-btn btn-line">
                    Reach Out
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
