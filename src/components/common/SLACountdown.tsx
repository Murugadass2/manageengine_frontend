import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SLACountdownProps {
  targetDate: string;
  isResolved?: boolean;
  resolvedAt?: string | null;
  className?: string;
  compact?: boolean;
}

export const SLACountdown: React.FC<SLACountdownProps> = ({
  targetDate,
  isResolved = false,
  resolvedAt,
  className = '',
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
    totalSeconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0, isOverdue: false, totalSeconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = isResolved && resolvedAt ? new Date(resolvedAt).getTime() : new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      const isOverdue = diff < 0;
      const absDiff = Math.abs(diff);

      const hours = Math.floor(absDiff / (1000 * 60 * 60));
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours,
        minutes,
        seconds,
        isOverdue,
        totalSeconds: Math.floor(diff / 1000),
      });
    };

    calculateTime();
    if (!isResolved) {
      const interval = setInterval(calculateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [targetDate, isResolved, resolvedAt]);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedTime = `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;

  if (isResolved) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>SLA Met (Resolved)</span>
      </div>
    );
  }

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono text-xs font-medium px-2 py-0.5 rounded ${
          timeLeft.isOverdue
            ? 'bg-rose-100 text-rose-700 font-semibold animate-pulse'
            : timeLeft.totalSeconds < 7200
            ? 'bg-amber-100 text-amber-800'
            : 'bg-emerald-50 text-emerald-700'
        } ${className}`}
      >
        <Clock className="w-3 h-3" />
        {timeLeft.isOverdue ? `-${formattedTime}` : formattedTime}
      </span>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 text-center transition-all ${
        timeLeft.isOverdue
          ? 'bg-rose-50/80 border-rose-300 text-rose-900 shadow-sm'
          : timeLeft.totalSeconds < 7200
          ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-sm'
          : 'bg-gold-50/60 border-gold-300/80 text-navy-950 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-center justify-center gap-2 mb-1.5">
        {timeLeft.isOverdue ? (
          <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
        ) : (
          <Clock className="w-4 h-4 text-gold-600" />
        )}
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-600">
          {timeLeft.isOverdue ? 'SLA Breached' : 'SLA Remaining'}
        </span>
      </div>
      <div className={`text-2xl font-bold font-mono tracking-wider ${timeLeft.isOverdue ? 'text-rose-600' : 'text-navy-900'}`}>
        {formattedTime}
      </div>
      <div className="text-[11px] text-slate-500 font-medium mt-1">
        {timeLeft.isOverdue ? 'Overdue Deadline' : 'Time Remaining'}
      </div>
    </div>
  );
};
