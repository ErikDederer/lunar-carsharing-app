import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

// The light that runs around the edge of a button (from Magic UI's
// ShimmerButton), usable on any element: <button>, <Link>, ...
// The host needs `shimmerHostClass` and the CSS variables from
// `shimmerVars()`; `--bg` is the fill (can change on hover).

export const shimmerHostClass =
  'group/shimmer relative isolate z-0 overflow-hidden [background:var(--bg)] [border-radius:var(--radius)]';

export function shimmerVars({
  color = '#fff7ed',
  radius = '10px',
  speed = '2.8s',
  cut = '0.07em',
}: { color?: string; radius?: string; speed?: string; cut?: string } = {}): CSSProperties {
  return {
    '--spread': '90deg',
    '--shimmer-color': color,
    '--radius': radius,
    '--speed': speed,
    '--cut': cut,
  } as CSSProperties;
}

export function ShimmerLayers({ highlight = true }: { highlight?: boolean }) {
  return (
    <>
      {/* spark: a conic light sliding along the edge */}
      <span
        aria-hidden="true"
        className="@container-[size] pointer-events-none absolute inset-0 -z-30 overflow-visible blur-[2px] motion-reduce:hidden"
      >
        <span className="animate-shimmer-slide absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none]">
          <span className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </span>
      </span>
      {/* inner highlight for depth */}
      {highlight && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 [border-radius:var(--radius)]',
            'shadow-[inset_0_-8px_10px_#ffffff1f,inset_0_1px_0_#ffffff40] transition-shadow duration-300',
            'group-hover/shimmer:shadow-[inset_0_-6px_10px_#ffffff3f,inset_0_1px_0_#ffffff55]'
          )}
        />
      )}
      {/* backdrop: the fill, inset so only the edge shows the spark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]"
      />
    </>
  );
}
