import React from 'react'

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-slate-450 dark:text-slate-500 font-medium max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 mt-1 md:mt-0 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
