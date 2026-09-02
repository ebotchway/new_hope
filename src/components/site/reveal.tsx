"use client";

import { Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from "react";
import { motion } from "motion/react";

const DIRECTIONS = {
  up: { y: 24, x: 0 },
  down: { y: -24, x: 0 },
  left: { y: 0, x: 24 },
  right: { y: 0, x: -24 },
} as const;

export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: keyof typeof DIRECTIONS;
  delay?: number;
}) {
  const offset = DIRECTIONS[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Lays out children (normally `RevealItem`s) in `className` (e.g. a grid), giving each
 * one an increasing `delay` so they cascade in as they scroll into view. Each item
 * observes its own viewport entry independently — no reliance on animation-variant
 * propagation from this wrapper, which proved unreliable for items below the fold.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const items = Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) =>
        isValidElement(child)
          ? cloneElement(child as ReactElement<{ delay?: number }>, {
              delay: index * stagger,
            })
          : child
      )}
    </div>
  );
}

export function RevealItem({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
