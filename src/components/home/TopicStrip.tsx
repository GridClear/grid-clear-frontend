"use client";

/** Horizontal topic pill strip synced with carousel. */

import { topics } from "@/content/home";

interface TopicStripProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export function TopicStrip({ activeId, onSelect }: TopicStripProps) {
  return (
    <div className="border-b border-black/5 bg-white py-3">
      <div className="mx-auto max-w-content border-l border-r border-black/10 overflow-x-auto px-6 md:px-10">
        <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-black/40">
          <span className="hidden lg:inline mr-4 select-none font-bold text-black/50">{"// TOPIC INDEX"}</span>
          {topics.map((topic, i) => (
            <div key={topic.id} className="flex items-center gap-1.5 shrink-0">
              {i > 0 && <span className="text-black/15 px-1 select-none">/</span>}
              <button
                key={topic.id}
                type="button"
                onClick={() => onSelect(topic.id)}
                className={`shrink-0 px-3.5 py-1.5 text-[11px] border transition-all duration-200 ${
                  activeId === topic.id
                    ? "bg-black border-black text-white font-semibold"
                    : "border-transparent text-black/70 hover:border-black/15 hover:text-black"
                }`}
              >
                {topic.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
