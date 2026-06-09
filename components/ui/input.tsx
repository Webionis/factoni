import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3.5 py-2 text-[15px] text-[#0f172a] shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-[border-color,box-shadow,background-color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:border-[#60a5fa] focus-visible:ring-4 focus-visible:ring-[#2563eb]/18 focus-visible:shadow-[0_0_0_1px_rgba(37,99,235,0.08),0_2px_8px_rgba(37,99,235,0.06)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:border-[rgba(148,163,184,0.18)] dark:bg-[rgba(15,23,42,0.75)] dark:text-[#f8fafc] dark:placeholder:text-slate-500 dark:focus-visible:border-blue-400/60 dark:focus-visible:ring-blue-500/22 dark:focus-visible:shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_2px_12px_rgba(37,99,235,0.08)] dark:disabled:bg-[#1e293b]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
