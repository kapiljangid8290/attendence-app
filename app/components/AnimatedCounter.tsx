"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate(latest) {
        setDisplay(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [value]);

  return (
    <motion.span>
      {display}
      {suffix}
    </motion.span>
  );
}
