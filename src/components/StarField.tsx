"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./StarField.module.css";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function StarField({ active }: { active: boolean }) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    if (active && stars.length === 0) {
      const newStars = Array.from({ length: 250 }).map((_, i) => {
        // Bias towards left (0-40%)
        const x = Math.random() < 0.7 ? Math.random() * 45 : Math.random() * 100;
        return {
          id: i,
          x,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          duration: Math.random() * 4 + 3,
          delay: Math.random() * 10
        };
      });
      setStars(newStars);
    }
  }, [active, stars.length]);

  return (
    <div className={styles.container} style={{ pointerEvents: 'none' }}>
      <AnimatePresence>
        {active && stars.map((star) => (
          <motion.div
            key={star.id}
            className={styles.star}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: '#fff',
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.3)',
              position: 'absolute',
              borderRadius: '50%',
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`
            } as any}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
