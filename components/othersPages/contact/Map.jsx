import React from "react";

export default function Map() {
  return (
    <div className="w-100">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3914.9558766107757!2d77.34738589999999!3d11.1166642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba907b9d4e656ab%3A0xcf67adeb51a2d090!2sRakshana%20Hosiery!5e0!3m2!1sen!2sin!4v1746948145230!5m2!1sen!2sin"
        width="100%"
        height={646}
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
