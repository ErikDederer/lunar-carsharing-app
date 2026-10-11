'use client';

import { useRef } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

// Success mark that draws itself: ring first, then the tick, with a small pop.
export function AnimatedCheck({ size = 44 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const paths = gsap.utils.toArray<SVGPathElement | SVGCircleElement>('[data-draw]');
        paths.forEach((p) => {
          const length = p.getTotalLength();
          gsap.set(p, { strokeDasharray: length, strokeDashoffset: length });
        });
        gsap
          .timeline()
          .from(ref.current, { scale: 0.6, autoAlpha: 0, duration: 0.35, ease: 'back.out(2)' })
          .to(paths[0], { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, '<0.05')
          .to(paths[1], { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }, '-=0.15');
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle data-draw cx="26" cy="26" r="23" stroke="var(--brand)" strokeWidth="3" />
      <path
        data-draw
        d="M15 27l7 7 15-16"
        stroke="var(--brand)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
