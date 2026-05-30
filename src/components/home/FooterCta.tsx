/** Footer CTA band with dashboard link. */

import Link from "next/link";
import { footerCta } from "@/content/home";

export function FooterCta() {
  return (
    <section className="bg-black py-24 md:py-32 border-b border-white/5">
      <div className="mx-auto flex max-w-content flex-col items-start gap-8 px-6 md:flex-row md:items-center md:justify-between md:px-10">
        <Link
          href={footerCta.primary.href}
          className="text-3xl font-extrabold text-white tracking-[-0.035em] hover:text-white/85 transition-all duration-200 md:text-5xl font-heading"
        >
          {footerCta.primary.label}
        </Link>
        <a
          href={footerCta.secondary.href}
          className="font-mono text-xs uppercase tracking-widest text-white/40 hover:text-white border-b border-transparent hover:border-white/50 transition-all duration-200"
        >
          {footerCta.secondary.label}
        </a>
      </div>
    </section>
  );
}
