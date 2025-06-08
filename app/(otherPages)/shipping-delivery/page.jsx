import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import React from "react";

export const metadata = {
  title: "Shipping Delivery - Rakshana Hosierys",
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
            <div className="heading text-center">Shipping &amp; Delivery</div>
          </div>
        </div>
        {/* /page-title */}
        {/* main-page */}
        <section className="flat-spacing-25">
          <div className="container">
            <div className="tf-main-area-page tf-page-delivery">
              <div className="box">
                <h4>Fast & Reliable Shipping</h4>
                <p>We ship all prepaid orders the same day, using the best available courier service based on your location and shipping preference — ensuring quick and efficient delivery every time.</p>
              </div>
              <div className="box">
                <h4>Delivery</h4>
                <p>
                  Standard delivery time: 3–7 business days depending on your location.
                </p>
                <p>
                  Free shipping on all orders above ₹999.
                </p>
                <p>
                  All shipments include a tracking number for real-time updates.
                </p>
              </div>
              <div className="box">
                <h4>Returns</h4>
                <p>Returns are accepted only if the item is damaged or incorrectly delivered.</p>
                <p>You must raise a return request within 48 hours of delivery.</p>
                <p>Items must be returned unused, in original condition and with tags intact.</p>
                <p>Once approved, we offer a full refund or store credit.</p>
                <p>Return shipping costs are the responsibility of the customer (unless the error is on our side).</p>
                <p>Sale items are final and cannot be returned or exchanged.</p>
              </div>
              <div className="box">
                <h4>Help</h4>
                <p>
                  If you have any questions or concerns about this Privacy Policy, please contact us at:
                </p>
                <p>
                  Email:
                  <a href="mailto:rakshanahosierys@gmail.com" className="cf-mail">
                    rakshanahosierys@gmail.com
                  </a>
                </p>
                <p>Phone: (+91) 94881 61177</p>
              </div>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
