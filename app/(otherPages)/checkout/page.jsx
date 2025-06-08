import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import Checkout from "@/components/othersPages/Checkout";
import React from "react";

export const metadata = {
  title: "Check out- Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
      <Header7 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Check Out</div>
        </div>
      </div>

      <Checkout />
      <Footer1 />
    </>
  );
}
