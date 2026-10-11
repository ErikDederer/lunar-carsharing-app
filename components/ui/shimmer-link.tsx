import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ShimmerLayers, shimmerHostClass, shimmerVars } from './shimmer-layers';

type Tone = 'brand' | 'light';

const TONES: Record<Tone, { fill: string; color: string; className: string }> = {
  // orange fill, warm light
  brand: {
    fill: '[--bg:var(--brand)] hover:[--bg:var(--brand-hover)]',
    color: '#fff7ed',
    className:
      'text-white shadow-[0_8px_20px_-8px_rgba(234,124,17,0.6)] hover:shadow-[0_12px_26px_-10px_rgba(234,124,17,0.65)]',
  },
  // white fill on coloured sections, brand light
  light: {
    fill: '[--bg:#ffffff] hover:[--bg:#fff7ed]',
    color: '#ea7c11',
    className: 'text-landing-cta-text shadow-[0_8px_20px_-10px_rgba(17,24,39,0.35)]',
  },
};

// A link that looks and moves like the ShimmerButton CTA.
export function ShimmerLink({
  tone = 'brand',
  radius = '12px',
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { tone?: Tone; radius?: string }) {
  const t = TONES[tone];
  return (
    <Link
      {...props}
      style={{ ...shimmerVars({ color: t.color, radius }), ...props.style }}
      className={cn(
        shimmerHostClass,
        t.fill,
        t.className,
        'inline-flex items-center justify-center gap-2 border border-white/10 font-semibold',
        'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0',
        className
      )}
    >
      <ShimmerLayers />
      {children}
    </Link>
  );
}
