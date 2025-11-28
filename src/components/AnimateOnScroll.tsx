import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: 'fade-in' | 'slide-up' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
  delay?: number;
  threshold?: number;
  className?: string;
}

export const AnimateOnScroll = ({
  children,
  animation = 'fade-in',
  delay = 0,
  threshold = 0.1,
  className = ''
}: AnimateOnScrollProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold });

  const animationClass = isVisible ? `animate-${animation}` : 'opacity-0';
  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
};
