/** Partner testimonials section. */

import { testimonials } from "@/content/home";

export function Testimonials() {
  return (
    <section className="bg-white py-24 md:py-32 border-b border-black/5">
      <div className="mx-auto max-w-content border-l border-r border-black/10 px-6 md:px-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-black/50 uppercase mb-4">
          {"// FIELD TESTIMONIALS"}
        </p>
        <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-black md:text-4xl font-heading">
          {testimonials.heading}
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 border border-black/10 divide-y md:divide-y-0 md:divide-x divide-black/10">
          {testimonials.quotes.map((quote) => (
            <blockquote
              key={quote.author}
              className="p-8 md:p-12 bg-gc-light/10 hover:bg-gc-light/35 transition-colors duration-250 flex flex-col justify-between"
            >
              <p className="text-xl md:text-2xl leading-relaxed tracking-tight text-black/80 font-heading font-medium">
                &ldquo;{quote.text}&rdquo;
              </p>
              <footer className="mt-10 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-black/60">
                <p className="font-bold text-black">[ AUTH // {quote.author} ]</p>
                <p className="text-gc-muted mt-1 select-none">{"// ORG // "}{quote.org}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
