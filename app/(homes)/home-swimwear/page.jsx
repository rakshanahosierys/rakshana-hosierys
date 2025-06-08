import Announcmentbar from "@/components/common/Announcmentbar";
import Footer1 from "@/components/footers/Footer1";
import Header4 from "@/components/headers/Header4";
import Banner from "@/components/homes/home-swimwear/Banner";
import Collections from "@/components/homes/home-swimwear/Collections";
import CollectionsGrid from "@/components/homes/home-swimwear/CollectionsGrid";
import Features from "@/components/homes/home-swimwear/Features";
import Hero from "@/components/homes/home-swimwear/Hero";
import Products from "@/components/homes/home-swimwear/Products";
import Shopgram from "@/components/homes/home-swimwear/Shopgram";
import Testimonials from "@/components/homes/home-swimwear/Testimonials";
import React from "react";
export const metadata = {
  title: "Home Swimmwear || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-main">
        <Announcmentbar bgColor=" bg_dark" />
        <Header4 />
        <Hero />
        <Products />
        <Collections />
        <Banner />
        <CollectionsGrid />
        <Features />
        <Testimonials />
        <Shopgram />
        <Footer1 bgColor="background-gray md-pb-70" />
      </div>
    </>
  );
}
