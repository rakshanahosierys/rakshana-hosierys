import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import React from "react";

export const metadata = {
  title: "Terms & Conditions - Rakshana Hosierys",
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
            <div className="heading text-center">Terms &amp; Conditions</div>
          </div>
        </div>
        {/* /page-title */}
        {/* main-page */}
        <section className="flat-spacing-25">
          <div className="container">
            <div className="tf-main-area-page tf-terms-conditions">
              <div className="box">
                <h4>These Terms and Conditions May Change</h4>
                <p>
                  We reserve the right to update or modify these terms and conditions at any time without prior notice. Your use of the Classy Fox website constitutes your agreement to follow and be bound by the terms and conditions as changed. We encourage you to review these terms periodically when using our website.
                </p>
              </div>
              <div className="box">
                <h4>Limitations of Liability</h4>
                <p>
                  Classy Fox is not responsible for any damages or viruses that may affect your computer, device, or other property due to your use of this website or downloading any material from it. IN NO EVENT SHALL CLASSY FOX, ITS OFFICERS, EMPLOYEES, AFFILIATES, OR PARTNERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THIS SITE OR PURCHASES MADE THROUGH IT.
                  <br />If you experience issues with the website or any product, your sole remedy is to stop using the website or request an exchange or refund in line with our return policy.
                </p>
              </div>
              <div className="box">
                <h4>Copyright and Trademark</h4>
                <p>
                  All content on this website, including images, text, design, logos, graphics, and videos, is the property of Classy Fox and is protected by copyright and trademark laws. You may not copy, modify, distribute, or republish any part of this website without prior written permission from Classy Fox.
                </p>
              </div>
              <div className="box">
                <h4>Product Information</h4>
                <p>
                  We strive to ensure that product details, descriptions, and prices are accurate. However, we reserve the right to make corrections at any time. Product colors may vary depending on your device display. Availability of items is not guaranteed and may change without notice.
                </p>
              </div>
              <div className="box">
                <h4>Shipping & Delivery</h4>
                <p>
                  Orders are shipped to the address provided by the customer. Risk of loss and title for items pass to the customer upon delivery to the carrier. Delivery timelines may vary based on location and courier service availability.
                </p>
              </div>
              <div className="box">
                <h4>Duties and Taxes</h4>
                <p>
                  For international orders, customers are responsible for any applicable duties, customs, and taxes as per their local regulations.
                </p>
              </div>
              <div className="box">
                <h4>Your Account</h4>
                <p>
                  You are responsible for maintaining the confidentiality of your account and password. By using our site, you confirm that you are of legal age and that all information you provide is truthful and accurate.
                </p>
              </div>
              <div className="box">
                <h4>Return & Exchange Policy</h4>
                <p>
                  Returns are only accepted for damaged or incorrect items, and you must contact us within 48 hours of delivery. Items must be unused and in their original condition. We do not offer refunds for sale items. Please refer to our full return policy for details.
                </p>
              </div>
              <div className="box">
                <h4>Electronic Communications</h4>
                <p>
                  By using our website or contacting us via email, you consent to receive communications from us electronically. You agree that all agreements and notifications provided electronically meet any legal requirement for written communication.
                </p>
                <p>
                  Exclusions of Warranties
                  <br />
                  All products and services on this website are provided "as is" without warranties of any kind, either express or implied. We do not guarantee uninterrupted or error-free use of the website or that defects will be corrected.
                </p>
              </div>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
