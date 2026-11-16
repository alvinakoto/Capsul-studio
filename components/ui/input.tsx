import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, inputMode, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      // Montants : pavé numérique avec virgule sur téléphone (type="number" seul
      // ouvre le clavier complet sur iPhone)
      inputMode={inputMode ?? (type === "number" ? "decimal" : undefined)}
      data-slot="input"
      className={cn(
        "h-[42px] pointer-coarse:min-h-11 w-full min-w-0 rounded-[9px] border border-[var(--cs-line)] bg-white px-3 py-1 text-[14px] font-semibold text-[var(--cs-navy)] tabular-nums transition-[border-color,box-shadow,background-color] outline-none hover:border-[#D3CDC1] focus-visible:border-[var(--cs-navy)] focus-visible:shadow-[0_0_0_3px_rgba(14,34,64,.08)] placeholder:font-medium placeholder:text-[#A9A49A] file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
