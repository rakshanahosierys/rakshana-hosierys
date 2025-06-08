import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import React from "react";

export const metadata = {
  title: "Privacy Policy - Rakshana Hosierys",
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
            <div className="heading text-center">Privacy Policy</div>
          </div>
        </div>
        {/* /page-title */}
        {/* main-page */}
        <section className="flat-spacing-25">
          <div className="container">
            <div className="tf-main-area-page">
              <h4>Classy Fox Privacy Policy</h4>
              <p>
                Classy Fox, along with its parent, subsidiary, and affiliated companies (referred to as “we,” “our,” or “us”), operates this website and is committed to protecting your privacy. This Privacy Policy outlines how information is collected, used, and shared when you interact with our platform. Please review this policy carefully. Your continued use of our website indicates that you accept the terms described below.
                <br />
                This Privacy Policy applies to information collected by us and our affiliates:
                <br />
                (i)Through this website.
                (ii)Through our customer service team connected to this website.
                (iii)Through data shared in our retail stores (if applicable).
                (iv)Through promotions, offers, or other marketing activities.
                (v)We are not responsible for the privacy practices of third-party websites, even if linked through our site.
              </p>
              <p>
                Information We Collect
                <br />
                We may collect personal information such as your name, email address, phone number, shipping/billing address, and payment details when you:
                <br />
                (i)Visit our site
                (ii)Place an order
                (iii)Subscribe to emails or newsletters
                (iv)Participate in a promotion or giveaway
                (v)Contact our support team
              </p>
              <p>
                How We Use Your Information
                <br />
                Your information may be used to:
                <br />
                (i)Fulfill and deliver orders
                (ii)Communicate updates or offers
                (iii)Improve user experience and services
                (iv)Send marketing communications (with your consent)
                (v)Provide customer support
              </p>
              <p>
                Sharing Information
                <br />
                We do not sell your personal data. However, we may share your information with select third-party vendors who help operate our website, process orders, or provide services. These vendors are obligated to keep your information secure and confidential.
              </p>
              <p>
                Changes to This Policy
                <br />
                We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted here with an updated effective date. Continued use of our website after any update indicates your agreement with the revised terms.
              </p>
              <p>
                Your Choices
                <br />
                You can: <br />
                (i)Opt out of marketing emails at any time
                (ii)Request to view, update, or delete your personal information
                (iii)Control cookies and tracking preferences via your browser
              </p>
              <p>
                Contact Us
                <br />
                If you have any questions or concerns about this Privacy Policy, please contact us at:
                <br />Email: rakshanahosierys@gmail.com
                <br />Address: No 18, 2nd St Ext, Appachi Nagar, Kongu Nagar, Tiruppur, Tamil Nadu 641607
                <br />Phone: (+91) 94881 61177
              </p>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
