import { useState, useEffect, useRef } from 'react';

interface UseCounterAnimationProps {
  end: number;
  duration?: number;
  startOnView?: boolean;
  prefix?: string;
  suffix?: string;
  formatNumber?: (num: number) => string;
}

export const useCounterAnimation = ({ 
  end, 
  duration = 2000, 
  startOnView = true,
  prefix = '',
  suffix = '+',
  formatNumber
}: UseCounterAnimationProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView && !hasAnimated) {
      animateCounter();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
          animateCounter();
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated, startOnView]);

  const animateCounter = () => {
    const startTime = Date.now();
    const startValue = Math.max(1, Math.floor(end * 0.1)); // Start from 10% of target, minimum 1

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart);
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const formatValue = () => {
    if (formatNumber) {
      return `${prefix}${formatNumber(count)}${suffix}`;
    }
    return `${prefix}${count}${suffix}`;
  };

  return { count, elementRef, formattedValue: formatValue() };
};