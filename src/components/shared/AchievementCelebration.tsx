import React, { useEffect } from 'react';
import { Box, Typography, Modal, Fade, Grow } from '@mui/material';
import confetti from 'canvas-confetti';
import { ISavingsMilestone } from '../../types/savings.types';
import { formatCurrency } from '../../utils/currency';

interface AchievementCelebrationProps {
  milestone: ISavingsMilestone | null;
  onClose: () => void;
}

const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  milestone,
  onClose
}) => {
  useEffect(() => {
    if (milestone) {
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#96CEB4', '#FFEEAD', '#D4A5A5']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Auto close after animation
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [milestone, onClose]);

  if (!milestone) return null;

  return (
    <Modal
      open={true}
      onClose={onClose}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Fade in={true}>
        <Box
          sx={{
            position: 'relative',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4,
            minWidth: 300,
            textAlign: 'center',
            boxShadow: 24,
          }}
        >
          <Grow in={true}>
            <Box>
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontSize: '4rem',
                  color: 'success.main',
                  mb: 2,
                }}
              >
                🎉
              </Typography>
              <Typography variant="h5" gutterBottom>
                Milestone Achieved!
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {milestone.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You've reached your target of {formatCurrency(milestone.target_amount)}
              </Typography>
            </Box>
          </Grow>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AchievementCelebration;
