import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-slate-200/60 rounded-xl ${className}`} />
  );
};

export const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8 w-full animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="glass-card p-6 rounded-[2rem] h-36 flex flex-col justify-between">
          <Skeleton className="h-3 w-1/2 rounded-full" />
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-2 w-1/4 rounded-full" />
        </div>
      ))}
    </div>
    <div className="glass-card p-8 rounded-[2rem] h-96 flex flex-col gap-6">
      <Skeleton className="h-6 w-1/4 rounded-lg mb-2" />
      <div className="flex flex-col gap-4 flex-1">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
      </div>
    </div>
  </div>
);
