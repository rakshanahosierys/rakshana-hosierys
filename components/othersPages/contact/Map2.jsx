import { socialLinksWithBorder } from "@/data/socials";
import React from "react";

export default function Map2() {
  return (
    <section className="flat-spacing-9">
      <div className="container">
        <div className="tf-grid-layout gap-0 lg-col-2">
          <div className="w-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3914.9558766107757!2d77.34738589999999!3d11.1166642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba907b9d4e656ab%3A0xcf67adeb51a2d090!2sRakshana%20Hosiery!5e0!3m2!1sen!2sin!4v1746948145230!5m2!1sen!2sin"
              width="100%"
              height={894}
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="tf-content-left has-mt">
            <div className="sticky-top">
              <h5 className="mb_20">Visit Our Store</h5>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Address</strong>
                </p>
                <p>No 18, 2nd St Ext, Appachi Nagar, Kongu Nagar, Tiruppur, Tamil Nadu 641607</p>
              </div>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Phone</strong>
                </p>
                <p>(+91) 94881 61177</p>
              </div>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Email</strong>
                </p>
                <p>rakshanahosierys@gmail.com</p>
              </div>
              <div className="mb_36">
                <p className="mb_15">
                  <strong>Open Time</strong>
                </p>
                <p className="mb_15">Mon - Fri 9am - 8:30pm</p>
                <p>Sat - Sun Closed</p>
              </div>
              <div>
                <ul className="tf-social-icon d-flex gap-20 style-default">
                  {socialLinksWithBorder.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className={`box-icon link round ${link.className} ${link.borderClass}`}
                      >
                        <i
                          className={`icon ${link.iconSize} ${link.iconClass}`}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
