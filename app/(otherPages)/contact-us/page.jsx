import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import ContactForm from "@/components/othersPages/contact/ContactForm";
import Map from "@/components/othersPages/contact/Map";
import React from "react";

export const metadata = {
  title: "Contact Us - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
      <Header7 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Contact Us</div>
        </div>
      </div>

      <Map />
      <ContactForm />
      <Footer1 />
    </>
  );
}
