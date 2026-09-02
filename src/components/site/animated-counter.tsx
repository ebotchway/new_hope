"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

export function AnimatedCounter({
  value,
  className,
  prefix = "",
  suffix = "",
  formatter,
}: {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatter?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1.4, bounce: 0 });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (!ref.current) return;
      const rounded = Math.round(latest);
      ref.current.textContent = `${prefix}${formatter ? formatter(rounded) : rounded.toLocaleString()}${suffix}`;
    });
  }, [spring, prefix, suffix, formatter]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
