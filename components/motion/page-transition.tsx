"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { pageEnter } from "@/components/motion/variants";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate="visible"
      className="min-h-full"
      initial={shouldReduceMotion ? false : "hidden"}
      variants={pageEnter}
    >
      {children}
    </motion.div>
  );
}
