'use client';

import type { MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Soft brand-coloured light that follows the cursor across the card.
// Pure CSS variables — no re-renders while the mouse moves.
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  }

  return (
    <div
      onMouseMove={handleMove}
      className={cn(
        'group/spot relative overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background:
            'radial-gradient(260px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--brand) 16%, transparent), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
