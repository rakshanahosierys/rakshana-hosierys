import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import OrderDetails from "@/components/othersPages/dashboard/OrderDetails";
import AuthGuard from "@/components/Auth/AuthGuard"; // Import the AuthGuard component
import React from "react";

export const metadata = {
  title: "My Orders - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};

export default function page({ params }) {
    const { id: orderId } = params; // Extract the 'id' from params and rename it to orderId

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
              <OrderDetails orderId={orderId} />
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
      </AuthGuard>
    </>
  );
}
