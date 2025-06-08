import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import OurStore from "@/components/othersPages/OurStore";
import React from "react";

export const metadata = {
  title: "Our Store - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
      <Header7 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Our Store</div>
        </div>
      </div>

      <OurStore />
      <Footer1 />
    </>
  );
}
