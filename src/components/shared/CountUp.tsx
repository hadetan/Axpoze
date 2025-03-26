import React from 'react';
import { motion, useSpring, animate } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';

interface CountUpProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
}

const CountUp: React.FC<CountUpProps> = ({ 
  from, 
  to, 
  duration = 1,
  className 
}) => {
  const { animationsEnabled } = useAnimation();
  const [count, setCount] = React.useState(from);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    if (!animationsEnabled) {
      setCount(to);
      return;
    }

    const controls = animate(from, to, {
      duration: duration,
      onUpdate: (value) => {
        if (mountedRef.current) {
          setCount(value);
        }
      },
    });

    return () => {
      mountedRef.current = false;
      controls.stop();
      // Set final value on cleanup
      setCount(to);
    };
  }, [from, to, duration, animationsEnabled]);

  // Reset mounted ref when component remounts
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <motion.span className={className}>
      ₹{count.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
    </motion.span>
  );
};

export default CountUp;
