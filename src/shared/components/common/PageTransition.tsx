import { usePathname, useSearchParams } from 'next/navigation';
import { useTransition, animated } from '@react-spring/web';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'x' | 'y';
}

const PageTransition = ({ children, direction = 'x' }: PageTransitionProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const transitionKey = search ? `${pathname}?${search}` : pathname;
  const transitions = useTransition(transitionKey, {
    from: {
      opacity: 0,
      transform: direction === 'y' ? 'translateY(-100%)' : 'translateX(100%)',
    },
    enter: {
      opacity: 1,
      transform: direction === 'y' ? 'translateY(0%)' : 'translateX(0%)',
    },
    leave: {
      opacity: 0,
      transform: direction === 'y' ? 'translateY(100%)' : 'translateX(-100%)',
    },
  });

  return transitions((props, item) => (
    <animated.div className="page-transition" style={props} key={item}>
      {children}
    </animated.div>
  ));
};

export default PageTransition;
