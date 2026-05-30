"use client";

/** GridClear logo — Palantir-style circle mark + wordmark. */

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export function Logo({ className = "", variant = "light" }: LogoProps) {
  const color = variant === "light" ? "#ffffff" : "#000000";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="9" stroke={color} strokeWidth="1.5" />
        <path
          d="M11 2 A9 9 0 0 1 11 20"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="11" cy="11" r="2.5" fill="#ea580c" />
      </svg>
      <span
        className="text-[17px] font-semibold tracking-[-0.02em]"
        style={{ color }}
      >
        GridClear
      </span>
    </span>
  );
}
