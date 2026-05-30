"use client";

import { useEffect, useState } from "react";

/** Whether the top announcement bar is shown (client-only, avoids hydration mismatch). */

export function useAnnouncementVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => {
      setVisible(sessionStorage.getItem("gc-announcement-dismissed") !== "true");
    };
    sync();
    window.addEventListener("gc-announcement-dismissed", sync);
    return () => window.removeEventListener("gc-announcement-dismissed", sync);
  }, []);

  return visible;
}
