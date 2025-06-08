import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";

import Compare from "@/components/othersPages/Compare";
import React from "react";

export const metadata = {
  title: "Campare - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};

export default function page() {
  return (
    <>
      <Header7 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Compare Products</div>
        </div>
      </div>

      <Compare />
      <Footer1 />
    </>
  );
}
