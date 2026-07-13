import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type Stat = { value: number; suffix?: string; label: string };

function useCountUp(target: number, start: boolean, duration = 1600) {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (reduce) {
      setN(target);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration, reduce]);
  return n;
}

function StatItem({ stat, start }: { stat: Stat; start: boolean }) {
  const n = useCountUp(stat.value, start);
  return (
    <div className="text-center">
      <div className="font-display text-4xl sm:text-5xl text-primary tabular-nums">
        {n.toLocaleString("en-BD")}
        {stat.suffix}
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-ink-soft">{stat.label}</div>
    </div>
  );
}

export function StatCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-2 md:grid-cols-4 gap-8"
    >
      {stats.map((s) => (
        <StatItem key={s.label} stat={s} start={inView} />
      ))}
    </motion.div>
  );
}
