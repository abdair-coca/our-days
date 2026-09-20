"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { fadeUp } from "@/components/motion/variants";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate="visible"
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      transition={shouldReduceMotion ? { duration: 0 } : { delay }}
      variants={fadeUp}
      viewport={{ margin: "0px 0px -10% 0px", once: true }}
      whileInView="visible"
    >
      {children}
    </motion.div>
  );
}
