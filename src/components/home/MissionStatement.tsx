/** Mission statement band — light gray background. */

import { mission } from "@/content/home";

export function MissionStatement() {
  return (
    <section className="bg-gc-light border-b border-black/5 py-24 md:py-32">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <div className="border-t border-b border-black/10 py-12 md:py-16">
          <p className="font-mono text-[10px] tracking-[0.25em] text-black/50 uppercase mb-8">
            [ DIRECTIVE // 01.MISSION ]
          </p>
          <h2 className="max-w-5xl text-3xl font-bold leading-tight tracking-[-0.03em] text-black md:text-5xl lg:text-[56px] font-heading">
            {mission.text}
          </h2>
        </div>
      </div>
    </section>
  );
}
