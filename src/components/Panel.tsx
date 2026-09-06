import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export default function Panel({ title, icon, children, className = '', action }: PanelProps) {
  return (
    <div className={`glass-card glass-card-hover p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-cyan">{icon}</span>}
          <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
