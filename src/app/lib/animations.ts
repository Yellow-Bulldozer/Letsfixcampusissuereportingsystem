/**
 * Shared Framer Motion animation variants & helpers
 * Used across all pages for consistent, smooth animations
 */

/* ── Common easing ── */
export const easeOutExpo = [0.22, 1, 0.36, 1] as const;
export const springConfig = { type: 'spring', stiffness: 400, damping: 30 };
export const softSpring = { type: 'spring', stiffness: 260, damping: 24 };

/* ── Page-level entrance ── */
export const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo }
  }
};

/* ── Stagger container ── */
export const staggerContainer = (stagger = 0.08, delayChildren = 0.05) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren }
  }
});

/* ── Child item variants ── */
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo }
  }
};

export const fadeScale = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: easeOutExpo }
  }
};

export const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: easeOutExpo }
  }
};

export const slideRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: easeOutExpo }
  }
};

/* ── Panel slide (for auth page switching) ── */
export const panelVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: easeOutExpo }
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.28, ease: easeOutExpo }
  })
};

/* ── Modal / overlay ── */
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const modalVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: easeOutExpo }
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.97,
    transition: { duration: 0.25, ease: easeOutExpo }
  }
};

/* ── Hover spring card ── */
export const hoverCard = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: {
    y: -5,
    boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
    transition: softSpring
  }
};

/* ── Vote bounce ── */
export const voteBounce = {
  rest: { scale: 1 },
  tap: { scale: 0.88, transition: { duration: 0.1 } },
  voted: {
    scale: [1, 1.18, 0.95, 1.06, 1],
    transition: { duration: 0.45, times: [0, 0.25, 0.5, 0.75, 1] }
  }
};
