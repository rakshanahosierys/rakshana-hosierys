import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import React from "react";

export const metadata = {
  title: "Delivery Return - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};

export default function page() {
  return (
    <>
      <Header7 />
      <>
        {/* page-title */}
        <div className="tf-page-title style-2">
          <div className="container-full">
            <div className="heading text-center">Delivery Return</div>
          </div>
        </div>
        {/* /page-title */}
        {/* main-page */}
        <section className="flat-spacing-25">
          <div className="container">
            <div className="tf-main-area-page tf-page-delivery">
              <div className="box">
                <h4>Delivery</h4>
                <ul className="tag-list">
                  <li>All orders are shipped with trusted logistics partners and include tracking numbers for your convenience.</li>
                  <li>Free shipping on orders above ₹999 across India.</li>
                  <li>Delivery typically takes 3–7 business days, depending on your location.</li>
                </ul>
              </div>
              <div className="box">
                <h4>Returns</h4>
                <ul className="tag-list">
                  <li>
                    Returns are accepted only if the product is damaged or you receive the wrong item.
                  </li>
                  <li>
                    Please notify us within 48 hours of delivery to be eligible for a return.
                  </li>
                  <li>
                    Returned items must be unused, unwashed, and in original packaging with all tags intact.
                  </li>
                  <li>Once approved, you can choose between a full refund or store credit.</li>
                  <li>Shipping charges for returns are borne by the customer, unless the return is due to our error.</li>
                  <li>Sale items are final and non-returnable.</li>
                </ul>
              </div>
              <div className="box">
                <h4>Help</h4>
                <p>
                  We're here for you! Reach out with any questions or concerns.
                </p>
                <p className="text_black-2">Email: rakshanahosierys@gmail.com</p>
                <p className="text_black-2">Phone: (+91) 94881 61177</p>
              </div>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
