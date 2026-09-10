import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "full" | "icon" | "wordmark"
  size?: "sm" | "md" | "lg" | "xl"
  theme?: "dark" | "light" | "auto"
  className?: string
}

const sizes = {
  sm: { icon: 28, text1: "text-sm", text2: "text-[9px]" },
  md: { icon: 36, text1: "text-base", text2: "text-[10px]" },
  lg: { icon: 48, text1: "text-xl", text2: "text-xs" },
  xl: { icon: 64, text1: "text-3xl", text2: "text-sm" },
}

/** SVG icon — Isometric 3D box forming D and M monograms with a top circuit network */
export function DepotManagerIcon({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Glowing cyan-blue gradient for the "M" side and circuits */}
        <linearGradient id="cyanBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        {/* Premium metallic silver/slate gradient for high-contrast "D" side on dark/light */}
        <linearGradient id="silverSlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>

      {/* TOP FACE: Isometric network mesh / rhombus */}
      <polygon
        points="50,14 82,30 50,46 18,30"
        fill="none"
        stroke="url(#cyanBlueGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Network mesh connection lines */}
      <line x1="50" y1="14" x2="50" y2="46" stroke="url(#cyanBlueGrad)" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      <line x1="18" y1="30" x2="82" y2="30" stroke="url(#cyanBlueGrad)" strokeWidth="1.2" />
      <line x1="34" y1="22" x2="66" y2="38" stroke="url(#cyanBlueGrad)" strokeWidth="1.2" />
      <line x1="34" y1="38" x2="66" y2="22" stroke="url(#cyanBlueGrad)" strokeWidth="1.2" />

      {/* Mesh Nodes (Dots) */}
      <circle cx="50" cy="30" r="3" fill="#0EA5E9" />
      <circle cx="34" cy="22" r="2" fill="#0EA5E9" />
      <circle cx="66" cy="22" r="2" fill="#0EA5E9" />
      <circle cx="34" cy="38" r="2" fill="#0EA5E9" />
      <circle cx="66" cy="38" r="2" fill="#0EA5E9" />
      <circle cx="50" cy="14" r="2" fill="#0EA5E9" />
      <circle cx="50" cy="46" r="2" fill="#0EA5E9" />

      {/* LEFT FACE: Monogram "D" */}
      {/* Outer D path */}
      <path
        d="M16,36 L45,50 L45,82 L16,68 Z"
        fill="none"
        stroke="url(#silverSlateGrad)"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Inner D detail path */}
      <path
        d="M24,45 L37,51 L37,73 L24,67 Z"
        fill="none"
        stroke="url(#silverSlateGrad)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Dot on the outer left edge */}
      <circle cx="16" cy="52" r="2.5" fill="#94A3B8" />

      {/* RIGHT FACE: Monogram "M" */}
      {/* Outer M path in brilliant cyan-blue */}
      <path
        d="M55,50 L55,82 L65,77 L65,57 L75,62 L75,82 L84,77 L84,45"
        fill="none"
        stroke="url(#cyanBlueGrad)"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* BOTTOM-UP ARROW */}
      {/* Diagonal line */}
      <line
        x1="28"
        y1="90"
        x2="48"
        y2="72"
        stroke="#0EA5E9"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Bottom anchor dot */}
      <circle cx="28" cy="90" r="3.5" fill="#0EA5E9" />
      {/* Arrowhead */}
      <polygon points="48,68 49,76 43,72" fill="#0EA5E9" />
    </svg>
  )
}

/** Full logo with icon + wordmark */
export function DepotManagerLogo({
  variant = "full",
  size = "md",
  theme = "auto",
  className,
}: LogoProps) {
  const s = sizes[size]

  let textColor = "text-slate-950 dark:text-white"
  let subColor = "text-brand-cyan"

  if (theme === "light") {
    textColor = "text-white"
    subColor = "text-brand-cyan"
  } else if (theme === "dark") {
    textColor = "text-slate-950"
    subColor = "text-brand-cyan"
  }

  if (variant === "icon") {
    return <DepotManagerIcon size={s.icon} className={className} />
  }

  if (variant === "wordmark") {
    return (
      <div className={cn("flex flex-col leading-none", className)}>
        <span className={cn("font-black tracking-tight", s.text1, textColor)}>DEPOT</span>
        <span className={cn("font-black tracking-tight", s.text1, subColor)}>MANAGER</span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img src="/logo1.png" alt="Depot Manager Logo" className="h-16 object-contain" />
    </div>
  )
}

/** Premium Sidebar Logo: Brand Icon + Full Logo on Two Lines */
export function SidebarLogo() {
  return (
    <div className="flex items-left justify-left w-full py-2">
      <img src="/logo1.png" alt="Depot Manager Logo" className="h-16 object-contain" />
    </div>
  )
}

export default DepotManagerLogo
