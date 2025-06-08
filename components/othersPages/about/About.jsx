import React from "react";
import Image from "next/image";
export default function About() {
  return (
    <>
      <section className="flat-spacing-23 flat-image-text-section">
        <div className="container">
          <div className="tf-grid-layout md-col-2 tf-img-with-text style-4">
            <div className="tf-image-wrap">
              <Image
                className="lazyload w-100"
                data-src="/images/collections/collection-69.jpg"
                alt="collection-img"
                src="/images/collections/collection-69.jpg"
                width={600}
                height={499}
              />
            </div>
            <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
              <div>
                <div className="heading">Established - 2000</div>
                <div className="text">
                  Established with a vision to make high-quality fashion accessible,
                  <br className="d-xl-block d-none" />
                  Rakshana Hosierys has become a trusted name in
                  <br className="d-xl-block d-none" />
                  both wholesale and retail clothing.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flat-spacing-15">
        <div className="container">
          <div className="tf-grid-layout md-col-2 tf-img-with-text style-4">
            <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
              <div>
                <div className="heading">Our mission</div>
                <div className="text">
                  To deliver premium fashion that blends comfort,
                  <br className="d-xl-block d-none" />
                  style, and affordability—empowering every customer to 
                  <br className="d-xl-block d-none" />
                  look and feel their best.
                </div>
              </div>
            </div>
            <div className="grid-img-group">
              <div className="tf-image-wrap box-img item-1">
                <div className="img-style">
                  <Image
                    className="lazyload"
                    src="/images/collections/collection-71.jpg"
                    data-=""
                    alt="img-slider"
                    width={337}
                    height={388}
                  />
                </div>
              </div>
              <div className="tf-image-wrap box-img item-2">
                <div className="img-style">
                  <Image
                    className="lazyload"
                    src="/images/collections/collection-70.jpg"
                    data-=""
                    alt="img-slider"
                    width={400}
                    height={438}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
