"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.36, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
