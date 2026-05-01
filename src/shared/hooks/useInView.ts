'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

// react-intersection-observer 대체용 small hook. 표준 IntersectionObserver만 사용.
export function useInView<T extends Element = HTMLDivElement>(
  options?: UseInViewOptions
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}
