"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const CONSOLE_NAV = [
  { label: "Command Center", href: "/dashboard" },
  { label: "Collision Map", href: "/collision-map" },
] as const;

interface ConsoleShellProps {
  title: string;
  children: React.ReactNode;
  /** Right-side status line (optional). */
  status?: React.ReactNode;
}

export function ConsoleShell({ title, children, status }: ConsoleShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-[#050506] text-white font-mono antialiased selection:bg-gc-accent selection:text-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-6 md:px-10 backdrop-blur-sm z-40">
        <div className="flex items-center gap-4 md:gap-6 min-w-0">
          <Link href="/" className="shrink-0">
            <Logo variant="light" />
          </Link>
          <span className="hidden md:inline h-4 w-px bg-white/15 shrink-0" />
          <span className="hidden md:inline text-[10px] tracking-[0.2em] text-white/40 uppercase truncate">
            {title}
          </span>
          <nav className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
            {CONSOLE_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 text-[9px] uppercase tracking-wider border transition-colors ${
                    active
                      ? "border-gc-accent/50 bg-gc-accent/10 text-white"
                      : "border-white/10 text-white/45 hover:border-white/25 hover:text-white/80"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4 text-[9px] text-white/30 tracking-widest uppercase shrink-0">
          {status}
          <Link
            href="/"
            className="border border-white/20 px-3 py-1.5 text-white/60 hover:text-white hover:border-white/40 transition-colors"
          >
            Home
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col min-h-0">{children}</div>
    </div>
  );
}
