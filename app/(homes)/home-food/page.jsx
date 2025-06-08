import Announcmentbar from "@/components/common/Announcmentbar";
import Marquee from "@/components/common/Marquee";
import Footer1 from "@/components/footers/Footer1";
import Header4 from "@/components/headers/Header4";
import Banner from "@/components/homes/home-food/Banner";
import Banner2 from "@/components/homes/home-food/Banner2";
import Features from "@/components/homes/home-food/Features";
import Hero from "@/components/homes/home-food/Hero";
import Process from "@/components/homes/home-food/Process";
import Products from "@/components/homes/home-food/Products";
import Testimonials from "@/components/homes/home-food/Testimonials";
import React from "react";
export const metadata = {
  title: "Home Food || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Announcmentbar bgColor="announcement-bar-black bg_green-7" />
      <Header4 />
      <Hero />
      <Features />
      <Banner />
      <Products />
      <Testimonials />
      <Process />
      <Banner2 />
      <Marquee parentClass="flat-spacing-1 tf-marquee marquee-lg space-1" />
      <Footer1 />
    </>
  );
}
