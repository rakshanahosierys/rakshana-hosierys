// app/my-account-reviews/page.jsx
import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import MyReviews from "@/components/othersPages/dashboard/MyReviews"; // Import the new component
import AuthGuard from "@/components/Auth/AuthGuard";
import React from "react";

export const metadata = {
  title: "My Reviews - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};

export default function MyReviewsPage() {
  return (
    <>
      <AuthGuard>
        <Header7 />
        <div className="tf-page-title">
          <div className="container-full">
            <div className="heading text-center">My Reviews</div>
          </div>
        </div>
        <section className="flat-spacing-11">
          <div className="container">
            <div className="row">
              <div className="col-lg-3">
                <DashboardNav /> {/* DashboardNav handles navigation */}
              </div>
              <div className="col-lg-9">
                <MyReviews /> {/* Render the new MyReviews component */}
              </div>
            </div>
          </div>
        </section>
        <Footer1 />
      </AuthGuard>
    </>
  );
}