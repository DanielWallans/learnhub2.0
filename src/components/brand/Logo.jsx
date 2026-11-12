import { cn } from "@/lib/utils";

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" className="fill-lime" />
      <path d="M8 6.5v11h8" stroke="#0A0A0B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15.5" cy="8" r="1.6" fill="#0A0A0B" />
    </svg>
  );
}

export function Logo({ className }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-ink-50">learnhub</span>
    </span>
  );
}
