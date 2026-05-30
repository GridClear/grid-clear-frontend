/** Dark careers CTA section. */

import { careers } from "@/content/home";

export function CareersCta() {
  return (
    <section className="relative overflow-hidden bg-black py-28 md:py-36 border-b border-white/5">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 transition-transform duration-1000 ease-out hover:scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/75" />

      <div className="relative mx-auto max-w-content border-l border-r border-white/10 px-6 md:px-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase mb-6">
          [ DEPLOYMENT // JOBS ]
        </p>
        <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-[-0.035em] text-white md:text-5xl font-heading">
          {careers.heading}
        </h2>
        <p className="mt-6 max-w-xl text-lg text-white/50 leading-relaxed font-light">{careers.subheading}</p>
        <a
          href="#"
          className="mt-10 inline-block font-mono text-[11px] font-bold tracking-widest uppercase border border-white/25 px-6 py-3.5 text-white hover:bg-white hover:text-black hover:border-white transition-all duration-200 active:translate-y-px"
        >
          View Careers →
        </a>
      </div>
    </section>
  );
}
