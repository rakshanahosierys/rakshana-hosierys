import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import Announcment from "@/components/homes/multi-brand/Announcment";
import StoreLocations from "@/components/othersPages/StoreLocations";
import React from "react";

export const metadata = {
  title: "Store Locations - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
      <Announcment />
      <Header7 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Store locations</div>
        </div>
      </div>

      <StoreLocations />
      <Footer1 />
    </>
  );
}
