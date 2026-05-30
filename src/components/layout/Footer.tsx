/** Slim footer — logo, one-liner, social, and the command-center link. */

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { socialLinks } from "@/content/home";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-content border-l border-r border-black/10 px-6 py-16 md:px-10">
        <div className="flex flex-col gap-6 border-b border-black/5 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <Logo variant="dark" />
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-black/60">
              Autonomous scene clearance that reopens collision-closed roads in minutes,
              not hours.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-[10px] tracking-widest uppercase text-gc-muted">
            <span className="text-black/30">CONNECT:</span>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-black/70 hover:text-black transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-widest uppercase text-gc-muted">
          <p>© 2026 GridClear Technologies Inc. All rights reserved.</p>
          <Link href="/dashboard" className="font-bold text-black hover:text-black/70 transition-colors">
            [ ENTER COMMAND CENTER ]
          </Link>
        </div>
      </div>
    </footer>
  );
}
