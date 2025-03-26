import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { useLocation } from 'react-router-dom';

interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  path: string; // Add path for active state
}

interface DockProps {
  items: DockItem[];
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
}

const Dock: React.FC<DockProps> = ({
  items,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
}) => {
  const { animationsEnabled } = useAnimation();
  const location = useLocation();

  return (
    <motion.div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        height: panelHeight,
        padding: '0 16px',
        backgroundColor: 'var(--dock-bg, rgba(255, 255, 255, 0.4))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)', // For Safari support
        borderRadius: '16px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <AnimatePresence>
        {items.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          return (
            <motion.div
              key={index}
              onClick={item.onClick}
              initial={false}
              style={{
                width: baseItemSize,
                height: baseItemSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                backgroundColor: isActive ? 
                  'var(--dock-item-active-bg, rgba(255, 255, 255, 0.95))' : 
                  'var(--dock-item-bg, rgba(255, 255, 255, 0.9))',
                cursor: 'pointer',
                position: 'relative',
                transformOrigin: 'center center',
              }}
              animate={{
                y: isActive ? -8 : 0,
                scale: isActive ? 1.1 : 1,
              }}
              whileHover={{
                scale: animationsEnabled ? 1.2 : 1,
                y: animationsEnabled ? (isActive ? -12 : -4) : 0,
              }}
              whileTap={{
                scale: animationsEnabled ? 0.95 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
            >
              {item.icon}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dock;
