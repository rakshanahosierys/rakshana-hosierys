import Features from "@/components/common/Features";
import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import Announcment from "@/components/homes/multi-brand/Announcment";
import BannerCollection from "@/components/homes/multi-brand/BannerCollection";
import Collection2 from "@/components/homes/home-8/Collection2";
import Categories from "@/components/homes/multi-brand/Categories";
import Categories2 from "@/components/homes/multi-brand/Categories2";
import Collection from "@/components/homes/multi-brand/Collection";

import Hero from "@/components/homes/multi-brand/Hero";
import Products from "@/components/homes/multi-brand/Products";
import Testimonials from "@/components/homes/multi-brand/Testimonials";
import React from "react";

export const metadata = {
  title: "Rakshana Hosierys - Classy Fox",
  description: "Explore your true style",
};
export default function page() {
  return (
    <>
      <Announcment />
      <Header7 />
      <Categories />
      <Hero />
      <div className="mt-5"></div>
      <Collection2 />
      <Categories2 />
      <BannerCollection />
      <Products />
      <Collection />
      <div className="mt-5"></div>
      <Testimonials />
      <div className="mt-5"></div>
      <Features />
      <Footer1 bgColor="background-gray" />
    </>
  );
}
