import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[140px] w-full min-w-0 resize-y rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3.5 py-2.5 text-[15px] text-[#0f172a] shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-all duration-[180ms] ease-out outline-none placeholder:text-[#94a3b8] focus-visible:border-[#60a5fa] focus-visible:ring-4 focus-visible:ring-[#2563eb]/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:opacity-50 md:text-sm dark:border-[rgba(148,163,184,0.18)] dark:bg-[rgba(15,23,42,0.75)] dark:text-[#f8fafc] dark:placeholder:text-slate-500 dark:focus-visible:border-blue-400/60 dark:focus-visible:ring-blue-500/20 dark:disabled:bg-[#1e293b]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
