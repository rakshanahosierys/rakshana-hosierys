import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import Register from "@/components/othersPages/Register";
import React from "react";

export const metadata = {
  title: "Register - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
      <Header7 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Register</div>
        </div>
      </div>

      <Register />
      <Footer1 />
    </>
  );
}
