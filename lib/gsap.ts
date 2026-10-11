'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Registered once on the client. useGSAP reverts every tween/trigger it
// created on unmount, so route changes never leave stale ScrollTriggers.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// All motion runs inside gsap.matchMedia(MOTION_OK): with the OS setting
// "reduce motion" nothing animates and content is simply shown.
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export { gsap, ScrollTrigger, useGSAP };
