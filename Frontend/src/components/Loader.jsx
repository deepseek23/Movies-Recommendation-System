import React from 'react';

export const Spinner = () => (
  <div className="flex justify-center items-center py-10 w-full">
    <div className="w-7 h-7 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
  </div>
);

export const SkeletonCard = () => (
  <div className="w-full aspect-2/3 rounded bg-cards animate-pulse" />
);

export const SkeletonRow = () => (
  <div className="flex gap-3 md:gap-4 overflow-hidden px-6 md:px-12 pb-3">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="min-w-30 sm:min-w-35 md:min-w-39 lg:min-w-43 shrink-0">
        <SkeletonCard />
      </div>
    ))}
  </div>
);

export const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 px-6 md:px-12 py-4">
    {[...Array(12)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
