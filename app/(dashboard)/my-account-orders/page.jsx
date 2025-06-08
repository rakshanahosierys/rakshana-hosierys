import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import Orders from "@/components/othersPages/dashboard/Orders";
import AuthGuard from "@/components/Auth/AuthGuard"; // Import the AuthGuard component
import React from "react";

export const metadata = {
  title: "My Account Orders - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
    <AuthGuard>
      <Header7 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">My Orders</div>
        </div>
      </div>
      <section className="flat-spacing-11">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <DashboardNav />
            </div>
            <div className="col-lg-9">
              <Orders />
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
      </AuthGuard>
    </>
  );
}
