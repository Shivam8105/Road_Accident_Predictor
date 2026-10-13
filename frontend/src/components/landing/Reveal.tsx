import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** Delay in ms, useful for staggering siblings. */
  delay?: number;
  className?: string;
}

/**
 * Reveals content as it enters the viewport using IntersectionObserver.
 * No scroll listeners. Fully disabled under `prefers-reduced-motion` (handled in CSS too).
 */
export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduceMotion || typeof IntersectionObserver === 'undefined';
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      data-shown={shown}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};
