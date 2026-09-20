import type { Variants } from "motion/react";

type CubicBezier = [number, number, number, number];

const easeStandard: CubicBezier = [0.2, 0.8, 0.2, 1];
const easeGentle: CubicBezier = [0.22, 1, 0.36, 1];
const easeExit: CubicBezier = [0.4, 0, 1, 1];

const appleSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.72,
};

export const motionTokens = {
  duration: {
    instant: 0.12,
    fast: 0.18,
    normal: 0.28,
    page: 0.34,
    emotional: 0.44,
  },
  ease: {
    standard: easeStandard,
    gentle: easeGentle,
    exit: easeExit,
  },
  distance: {
    subtle: 8,
    standard: 14,
  },
  stagger: {
    item: 0.04,
    maximum: 0.3,
  },
} as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTokens.duration.normal,
      ease: motionTokens.ease.standard,
    },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: motionTokens.distance.standard },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.page,
      ease: motionTokens.ease.gentle,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: motionTokens.duration.normal,
      ease: motionTokens.ease.gentle,
    },
  },
};

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: motionTokens.distance.subtle },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.page,
      ease: motionTokens.ease.gentle,
    },
  },
};

export const pageExit: Variants = {
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: {
      duration: motionTokens.duration.normal,
      ease: motionTokens.ease.exit,
    },
  },
};

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 8px 24px rgb(43 33 29 / 0.06)",
  },
  hover: {
    scale: 1.008,
    y: -2,
    transition: {
      ...appleSpring,
    },
    boxShadow: "0 14px 36px rgb(43 33 29 / 0.1)",
  },
  tap: {
    scale: 0.992,
    transition: {
      duration: motionTokens.duration.instant,
      ease: motionTokens.ease.standard,
    },
  },
};

export const imageHover: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.018,
    transition: {
      duration: motionTokens.duration.emotional,
      ease: motionTokens.ease.gentle,
    },
  },
  tap: {
    scale: 1.004,
    transition: {
      duration: motionTokens.duration.instant,
      ease: motionTokens.ease.standard,
    },
  },
};

export const modalEnter: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: motionTokens.distance.subtle },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...appleSpring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.exit,
    },
  },
};

export const sheetEnter: Variants = {
  hidden: { opacity: 0, y: motionTokens.distance.standard },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...appleSpring,
    },
  },
  exit: {
    opacity: 0,
    y: motionTokens.distance.standard,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.exit,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.02,
      staggerChildren: motionTokens.stagger.item,
    },
  },
};

export const statusReveal: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: motionTokens.duration.normal,
      ease: motionTokens.ease.gentle,
    },
  },
};
