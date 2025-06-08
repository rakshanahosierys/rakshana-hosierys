"use client";
import React, { useState } from "react";

export default function StoreLocations() {
  const [activeTab, setActiveTab] = useState(1);
  return (
    <section className="flat-spacing-16">
      <div className="container">
        <div className="row widget-tabs">
          <div className="col-xl-4 col-md-5 col-12">
            <div className="tf-store-list d-flex gap-10 flex-column widget-menu-tab">
              <div
                className={`tf-store-item item-title ${
                  activeTab == 1 ? "active" : ""
                }  default`}
                onClick={() => setActiveTab(1)}
              >
                <h6 className="tf-store-title">
                  <div className="icon">
                    <i className="icon-place" />
                  </div>
                  Rakshana Hosierys
                </h6>
                <div className="tf-store-info">
                  <span>Address</span>
                  <p>No 18, 2nd St Ext, Appachi Nagar, Kongu Nagar, Tiruppur, Tamil Nadu 641607</p>
                </div>
                <div className="tf-store-info">
                  <span>Phone</span>
                  <p>(+91) 94881 61177</p>
                </div>
                <div className="tf-store-info">
                  <span>Email</span>
                  <p>rakshanahosierys@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-8 col-md-7 col-12">
            <div className="widget-content-tab">
              <div
                className={`widget-content-inner ${
                  activeTab == 1 ? "active" : ""
                }  p-0`}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3914.9558766107757!2d77.34738589999999!3d11.1166642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba907b9d4e656ab%3A0xcf67adeb51a2d090!2sRakshana%20Hosiery!5e0!3m2!1sen!2sin!4v1746948145230!5m2!1sen!2sin"
                  width="100%"
                  height={978}
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
