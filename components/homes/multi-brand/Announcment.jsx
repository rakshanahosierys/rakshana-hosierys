"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { db } from "@/utlis/firebaseConfig"; // Your firebase setup path
import { collection, query, where, onSnapshot } from "firebase/firestore";

const fetcher = () => Promise.resolve([]);

function useRealtimeAnnouncements() {
  const { data, mutate } = useSWR(["announcements", true], fetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
    dedupingInterval: 60000, // avoid too many revalidations
  });

  useEffect(() => {
    const q = query(collection(db, "announcements"), where("active", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcements = snapshot.docs.map((doc) => doc.data().text);
      // Update SWR cache with new data but don't revalidate (false)
      mutate(announcements, false);
    });

    return () => unsubscribe();
  }, [mutate]);

  return data;
}

export default function Announcement() {
  const announcements = useRealtimeAnnouncements();

  useEffect(() => {
    const closeTimestamp = localStorage.getItem("announcementClosedAt");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (closeTimestamp) {
      const elapsed = now - parseInt(closeTimestamp, 10);
      if (elapsed < oneDay) {
        // Hide announcement bar if closed less than 24h ago
        const bar = document.querySelector(".announcement-bar");
        if (bar) bar.style.display = "none";
        return;
      } else {
        localStorage.removeItem("announcementClosedAt");
      }
    }

    // Setup close button event listeners
    const closeAnnouncement = () => {
      document.querySelectorAll(".close-announcement-bar").forEach((btn) => {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          const announcementBar = this.closest(".announcement-bar");
          if (!announcementBar) return;

          const height = announcementBar.offsetHeight + "px";
          announcementBar.style.marginTop = `-${height}`;

          setTimeout(() => {
            announcementBar.style.display = "none";
            announcementBar.remove();
            localStorage.setItem("announcementClosedAt", Date.now().toString());
          }, 600);
        });
      });
    };

    closeAnnouncement();

    // Cleanup event listeners on unmount or announcement change
    return () => {
      document.querySelectorAll(".close-announcement-bar").forEach((btn) => {
        btn.replaceWith(btn.cloneNode(true)); // Remove all attached listeners
      });
    };
  }, [announcements]);

  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="announcement-bar bg_dark">
      <div className="wrap-announcement-bar">
        <div className="box-sw-announcement-bar">
          {(() => {
            const totalToRender = 12;
            const ann = announcements.length > totalToRender
              ? announcements.slice(0, totalToRender)
              : Array.from({ length: Math.ceil(totalToRender / announcements.length) })
                .flatMap(() => announcements)
                .slice(0, totalToRender);

            return ann.map((text, index) => (
              <div className="announcement-bar-item" key={index}>
                <p>{text}</p>
              </div>
            ));
          })()}
        </div>
      </div>
      <span className="icon-close close-announcement-bar" />
    </div>
  );
}