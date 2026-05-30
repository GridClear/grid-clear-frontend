"use client";

/** Full-screen navigation overlay — two real pages plus latest news. */

import Link from "next/link";
import { X } from "lucide-react";
import { latestNews, navLinks } from "@/content/home";

interface NavOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function NavOverlay({ open, onClose }: NavOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[#0a0a0a] text-white">
      <div className="flex h-16 items-center justify-between px-6 md:px-10">
        <div className="w-24" />
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center border border-white/20 hover:bg-white/10"
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mx-auto grid max-w-content gap-12 px-6 pb-16 md:grid-cols-2 md:px-10">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-white/40 uppercase">
            {"// NAVIGATE"}
          </p>
          <nav className="mt-8 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="block text-4xl font-extrabold tracking-[-0.03em] text-white transition-colors hover:text-white/70 md:text-5xl font-heading"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="mb-6 font-mono text-[10px] font-bold tracking-widest text-white/40 uppercase">
            {"// LATEST NEWS"}
          </h2>
          <div className="space-y-8">
            {latestNews.map((item) => (
              <a key={item.title} href={item.href} className="group block">
                <p className="font-mono text-[10px] text-white/40">{item.source.toUpperCase()}</p>
                <p className="mt-2 text-lg font-bold leading-snug text-white font-heading group-hover:text-white/80 transition-colors">
                  {item.title}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/50">{item.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
