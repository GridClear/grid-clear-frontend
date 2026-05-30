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

  const isLight = !scrolled;

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-[var(--announcement-height,0px)] z-50 transition-all duration-300 border-b ${
          isLight 
            ? "bg-transparent border-white/10" 
            : "bg-white/85 backdrop-blur-md border-black/5"
        }`}
        style={{ "--announcement-height": "40px" } as React.CSSProperties}
      >
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6 md:px-10">
          <Link href="/" aria-label="GridClear homepage">
            <Logo variant={isLight ? "light" : "dark"} />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={`hidden px-5 py-2.5 font-mono text-[11px] font-medium tracking-widest uppercase transition-colors duration-200 sm:inline-block border ${
                isLight
                  ? "bg-white border-white text-black hover:bg-transparent hover:text-white"
                  : "bg-black border-black text-white hover:bg-transparent hover:text-black"
              }`}
            >
              Command Center
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className={`flex h-10 w-10 items-center justify-center border transition-colors duration-200 ${
                isLight
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-black/10 text-black hover:bg-black/5"
              }`}
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
