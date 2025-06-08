import Features from "@/components/common/Features2";
import Footer2 from "@/components/footers/Footer2";
import Header18 from "@/components/headers/Header18";
import Topbar4 from "@/components/headers/Topbar4";
import Banner from "@/components/homes/home-book-store/Banner";
import Banner2 from "@/components/homes/home-book-store/Banner2";
import Categories from "@/components/homes/home-book-store/Categories";
import Collections from "@/components/homes/home-book-store/Collections";
import Hero from "@/components/homes/home-book-store/Hero";
import Locations from "@/components/homes/home-book-store/Locations";
import Products from "@/components/homes/home-book-store/Products";
import Products2 from "@/components/homes/home-book-store/Products2";
import Testimonials from "@/components/homes/home-book-store/Testimonials";
import React from "react";
export const metadata = {
  title: "Home Bookstore || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-13">
        <Topbar4 />
        <Header18 />
        <Hero />
        <Collections />
        <Categories />
        <Banner />
        <Products />
        <Banner2 />
        <Products2 />
        <Testimonials />
        <Locations />
        <Features bgColor="flat-spacing-3 flat-iconbox bg_f3f4f7" />
        <Footer2 />
      </div>
    </>
  );
}
