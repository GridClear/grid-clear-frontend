"use client";

/** Scroll-aware header — transparent over hero, solid on scroll. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NavOverlay } from "./NavOverlay";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [hasAnnouncement, setHasAnnouncement] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("gc-announcement-dismissed");
    setHasAnnouncement(dismissed !== "true");

    const handleDismiss = () => setHasAnnouncement(false);
    window.addEventListener("gc-announcement-dismissed", handleDismiss);
    return () => {
      window.removeEventListener("gc-announcement-dismissed", handleDismiss);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 border-b text-white ${
          scrolled 
            ? "bg-black/90 backdrop-blur-md border-white/5" 
            : "bg-transparent border-white/10"
        }`}
        style={{ top: scrolled ? "0px" : (hasAnnouncement ? "40px" : "0px") }}
      >
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6 md:px-10">
          <Link href="/" aria-label="GridClear homepage">
            <Logo variant="light" />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden px-5 py-2.5 font-mono text-[11px] font-medium tracking-widest uppercase transition-colors duration-200 sm:inline-block border bg-white border-white text-black hover:bg-transparent hover:text-white"
            >
              Command Center
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="flex h-10 w-10 items-center justify-center border transition-colors duration-200 border-white/20 text-white hover:bg-white/10"
              aria-label="Show navigation"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </header>

      <NavOverlay open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
