import React from 'react';
import { useTrail, animated, config } from '@react-spring/web';
import { useAnimation } from '../../contexts/AnimationContext';

interface SplitTextProps {
  text: string;
  delay?: number;
}

const SplitText: React.FC<SplitTextProps> = ({ text, delay = 50 }) => {
  const { animationsEnabled } = useAnimation();
  const letters = text.split('');

  const trail = useTrail(letters.length, {
    from: { 
      opacity: 0, 
      transform: 'translate3d(0,50px,0)' 
    },
    to: { 
      opacity: 1, 
      transform: 'translate3d(0,0,0)' 
    },
    immediate: !animationsEnabled,
    config: animationsEnabled ? config.gentle : { duration: 0 },
    delay: animationsEnabled ? delay : 0,
  });

  return (
    <span style={{ display: 'inline-block' }}>
      {trail.map((props, i) => (
        <animated.span key={i} style={props}>
          {letters[i] === ' ' ? '\u00A0' : letters[i]}
        </animated.span>
      ))}
    </span>
  );
};

export default SplitText;
