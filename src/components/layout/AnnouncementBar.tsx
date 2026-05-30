"use client";

/** Dismissible top announcement bar. */

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { announcement } from "@/content/home";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("gc-announcement-dismissed");
    if (dismissed === "true") setVisible(false);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("gc-announcement-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative z-[60] flex h-10 items-center justify-center bg-[#050506] border-b border-white/5 px-12 text-center font-mono text-[10px] sm:text-[11px] tracking-widest text-white uppercase">
      <a href={announcement.href} className="hover:text-white/80 transition-colors flex items-center gap-1.5 sm:gap-2">
        <span className="text-white/40 hidden md:inline">{"// SYSTEM NOTIFICATION:"}</span>
        <span className="underline underline-offset-4">{announcement.text}</span>
      </a>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-4 flex h-8 w-8 items-center justify-center text-white/40 hover:text-white transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
