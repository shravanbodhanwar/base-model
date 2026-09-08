import * as React from "react"
import { cn } from "../../lib/utils"

export function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin", className)}
      {...props}
    />
  )
}
