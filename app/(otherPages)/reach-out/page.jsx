import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import ContactForm2 from "@/components/othersPages/contact/ContactForm2";
import Map2 from "@/components/othersPages/contact/Map2";
import React from "react";

export const metadata = {
  title: "Reach Out - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
      <Header7 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Reach Out</div>
        </div>
      </div>
      <Map2 />
      <ContactForm2 />
      <Footer1 />
    </>
  );
}
