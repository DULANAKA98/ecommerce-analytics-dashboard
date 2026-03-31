import { useState, useEffect, useRef, MutableRefObject } from 'react';

export function useInView(options?: IntersectionObserverInit): [MutableRefObject<any>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px', ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.threshold, options?.rootMargin]);

  return [ref, isVisible];
}
