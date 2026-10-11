'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  duration?: number;
  onClose: () => void;
}

// Springs in from the bottom, shows the remaining time as a thin bar,
// pauses while hovered and slides away before calling onClose.
export function Toast({ message, type = 'success', duration = 4000, onClose }: ToastProps) {
  // Toasts only appear after a user action (never during SSR), so the
  // portal target can be looked up right away.
  const [portal] = useState<HTMLElement | null>(() =>
    typeof document === 'undefined' ? null : document.getElementById('toast-portal'),
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  // Callers often pass an inline arrow; keep the latest without restarting
  // the timer on every parent render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useGSAP(
    () => {
      if (!portal || !cardRef.current || !barRef.current) return;
      const close = () => onCloseRef.current();
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        timeline.current = gsap
          .timeline({ onComplete: close })
          .from(cardRef.current, { y: 32, scale: 0.94, autoAlpha: 0, duration: 0.5, ease: 'back.out(1.8)' })
          .fromTo(barRef.current, { scaleX: 1 }, { scaleX: 0, duration: duration / 1000, ease: 'none' }, '<')
          .to(cardRef.current, { y: 16, autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        const timer = window.setTimeout(close, duration);
        return () => window.clearTimeout(timer);
      });

      return () => mm.revert();
    },
    { dependencies: [portal, duration, message] },
  );

  if (!portal) return null;

  const isSuccess = type === 'success';

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
    >
      <div
        ref={cardRef}
        onMouseEnter={() => timeline.current?.pause()}
        onMouseLeave={() => timeline.current?.resume()}
        className={[
          'pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-xl backdrop-blur',
          isSuccess ? 'border-brand/25 bg-bg-card/95 text-text-base' : 'border-border-error bg-bg-card/95 text-text-base',
        ].join(' ')}
      >
        <span className={isSuccess ? 'text-brand' : 'text-text-error'} aria-hidden="true">
          {isSuccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        </span>
        <span className="text-sm font-medium">{message}</span>
        <button
          type="button"
          onClick={() => onCloseRef.current()}
          aria-label="Close"
          className="ml-1 text-text-muted transition-colors hover:text-text-secondary"
        >
          <X size={15} />
        </button>
        <div
          ref={barRef}
          aria-hidden="true"
          className={[
            'absolute bottom-0 left-0 h-0.5 w-full origin-left',
            isSuccess ? 'bg-brand' : 'bg-text-error',
          ].join(' ')}
        />
      </div>
    </div>,
    portal,
  );
}

export default Toast;
