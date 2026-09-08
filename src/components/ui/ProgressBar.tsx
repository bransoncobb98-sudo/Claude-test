import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  className?: string;
  colorClassName?: string;
}

export function ProgressBar({ value, label, className, colorClassName }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2.5 w-full overflow-hidden rounded-full bg-brand-navy-50"
      >
        <div
          className={cn('h-full rounded-full bg-brand-navy-600 transition-all', colorClassName)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
