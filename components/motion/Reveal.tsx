'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from '@/lib/gsap';

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  // Animate these descendants instead of the direct children
  selector?: string;
  stagger?: number;
  y?: number;
  // Re-run when this changes (e.g. the ids of a loaded list). Polling the
  // same data again keeps it stable, so visible items don't re-animate.
  watch?: string | number;
}

// Fades and lifts items into view as they scroll in, in a quick stagger.
// Server-rendered content stays visible without JavaScript; items are only
// hidden right before they animate.
export function Reveal({ children, className, as: Tag = 'div', selector, stagger = 0.08, y = 24, watch }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Only items that haven't been revealed yet — appended results
        // ("load more", a new booking) animate, the rest stays put.
        const items = gsap.utils
          .toArray<HTMLElement>(selector ? root.querySelectorAll(selector) : root.children)
          .filter((el) => !el.dataset.revealed);
        if (items.length === 0) return;
        gsap.set(items, { autoAlpha: 0, y });
        ScrollTrigger.batch(items, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => {
            batch.forEach((el) => ((el as HTMLElement).dataset.revealed = '1'));
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger, overwrite: true });
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [watch] },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
