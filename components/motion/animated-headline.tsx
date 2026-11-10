"use client";

import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { motionTokens } from "@/components/motion/variants";

type AnimatedHeadlineProps = {
  className?: string;
  /** Trailing words that receive the hand-drawn underline. */
  highlight?: string;
  id?: string;
  text: string;
};

/** Words settle in one by one, then a pen stroke underlines the ending. */
export function AnimatedHeadline({ className, highlight, id, text }: AnimatedHeadlineProps) {
  const reduce = useReducedMotion() ?? false;
  const lead = highlight && text.endsWith(highlight) ? text.slice(0, -highlight.length).trim() : text;
  const words = lead.split(/\s+/).filter(Boolean);
  const accent = highlight && lead !== text ? highlight : null;
  const step = 0.045;
  const word = (value: string, index: number) => (
    <motion.span
      className="inline-block"
      initial={reduce ? false : { opacity: 0, y: "0.32em" }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * step, duration: motionTokens.duration.emotional, ease: motionTokens.ease.gentle }}
    >
      {value}
    </motion.span>
  );

  return (
    <h1 className={className} id={id}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((value, index) => (
          <span key={`${value}-${index}`}>
            {word(value, index)}{" "}
          </span>
        ))}
        {accent ? (
          <span className="relative inline-block whitespace-nowrap">
            {word(accent, words.length)}
            <svg
              className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.32em] w-full overflow-visible text-rose-paper"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 200 20"
            >
              <motion.path
                animate={{ pathLength: 1, opacity: 1 }}
                d="M3 13c32-7 68-9 104-6 31 2 58 1 90-4"
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="6"
                transition={{ delay: 0.12 + (words.length + 1) * step, duration: motionTokens.duration.emotional, ease: motionTokens.ease.standard }}
              />
            </svg>
          </span>
        ) : null}
      </span>
    </h1>
  );
}

/** Counts up once when visible; reduced motion shows the final value. */
export function CountUp({ value }: { value: number }) {
  const element = useRef<HTMLSpanElement>(null);
  const inView = useInView(element, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion() ?? false;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 0.7,
      ease: motionTokens.ease.gentle,
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);
  return (
    <span className="tabular-nums" ref={element}>
      {reduce ? value : shown}
    </span>
  );
}
