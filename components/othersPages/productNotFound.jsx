import Image from "next/image";
import React from "react";

export default function notFound({ onClearFilter }) {
    return (
        <>
            <section className="page-404-wrap">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="image">
                                <Image
                                    alt="image"
                                    src="/images/item/noproduct.svg"
                                    width="394"
                                    height="319"
                                />
                            </div>
                            <div className="title">Oops...No products found.</div>
                            <p>
                                Sorry, no products match your current filters. Try adjusting your selections or visit our homepage to explore the latest collections.
                            </p>
                            <a className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                                onClick={onClearFilter}>Clear Filter</a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
