import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import OrderDetails from "@/components/othersPages/dashboard/OrderDetails";
import AuthGuard from "@/components/Auth/AuthGuard"; // Import the AuthGuard component
import React from "react";
import Link from "next/link"; // Import Link

export const metadata = {
  title: "Order Confirmation - Rakshana Hosierys",
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
          <div className="heading text-center">Order Confirmed</div>
        </div>
      </div>
      <section className="flat-spacing-11">
        <div className="container">
          <div className="row">
            <div>
              <OrderDetails orderId={orderId} />
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <Link href={`/my-account-orders-details/${orderId}`}>
                    <button className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"> {/* Use your existing button class */}
                      View Order Details
                    </button>
                  </Link>
                </div>
            </div>
          </div>
        </div>
      </section>
      <Footer1 />
      </AuthGuard>
    </>
  );
}
