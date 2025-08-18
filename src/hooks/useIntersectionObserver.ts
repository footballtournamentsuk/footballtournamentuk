import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = ({
  threshold = 0.1,
  root = null,
  rootMargin = '50px',
  triggerOnce = true,
}: UseIntersectionObserverProps = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    // Don't observe if already triggered and triggerOnce is true
    if (triggerOnce && hasTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [threshold, root, rootMargin, triggerOnce, hasTriggered]);

  return {
    targetRef,
    isIntersecting: triggerOnce ? (hasTriggered || isIntersecting) : isIntersecting,
  };
};