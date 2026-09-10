"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-slate-100",
      className
    )}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Track className="h-full w-full">
      <ProgressPrimitive.Indicator
        className="h-full bg-primary transition-all duration-500 ease-in-out"
        style={{ width: `${value || 0}%` }}
      />
    </ProgressPrimitive.Track>
  </ProgressPrimitive.Root>
))
Progress.displayName = "Progress"

export { Progress }
