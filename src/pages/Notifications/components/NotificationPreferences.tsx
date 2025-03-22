import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Stack, Switch, Box,
  Divider, FormControlLabel, Slider, TextField,
  MenuItem, Alert,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../contexts/AuthContext';
import { notificationPreferencesService } from '../../../services/notificationPreferences.service';
import { NotificationPreferencesFormData } from '../../../types/notification.types';

const validationSchema = Yup.object({
  deadline_days_threshold: Yup.number()
    .min(1, 'Must be at least 1 day')
    .max(30, 'Cannot exceed 30 days'),
  progress_threshold: Yup.number()
    .min(1, 'Must be at least 1%')
    .max(100, 'Cannot exceed 100%'),
  spending_threshold: Yup.number()
    .min(1, 'Must be at least 1%')
    .max(200, 'Cannot exceed 200%'),
});

const NotificationPreferences: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { authState } = useAuth();

  const formik = useFormik<NotificationPreferencesFormData>({
    initialValues: {
      goal_deadline_reminder: true,
      deadline_days_threshold: 7,
      goal_progress_alert: true,
      progress_threshold: 20,
      monthly_spending_alert: true,
      spending_threshold: 120,
      email_notifications: true,
      notification_types: ['goal', 'expense', 'system'],
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!authState.user?.id) return;

      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await notificationPreferencesService.updatePreferences(
          authState.user.id,
          values
        );
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Failed to save preferences');
      } finally {
        setLoading(false);
      }
    },
  });

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!authState.user?.id) return;

      try {
        setLoading(true);
        const preferences = await notificationPreferencesService.getPreferences(
          authState.user.id
        );
        formik.setValues({
          goal_deadline_reminder: preferences.goal_deadline_reminder,
          deadline_days_threshold: preferences.deadline_days_threshold,
          goal_progress_alert: preferences.goal_progress_alert,
          progress_threshold: preferences.progress_threshold,
          monthly_spending_alert: preferences.monthly_spending_alert,
          spending_threshold: preferences.spending_threshold,
          email_notifications: preferences.email_notifications,
          notification_types: preferences.notification_types,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [authState.user?.id]);

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <NotificationsIcon color="primary" />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customize how and when you want to be notified
                </Typography>
              </Box>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Preferences saved successfully!
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              General Settings
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    name="email_notifications"
                    checked={formik.values.email_notifications}
                    onChange={formik.handleChange}
                  />
                }
                label="Email Notifications"
              />

              <TextField
                select
                fullWidth
                label="Notification Types"
                name="notification_types"
                SelectProps={{ multiple: true }}
                value={formik.values.notification_types}
                onChange={formik.handleChange}
                helperText="Select the types of notifications you want to receive"
              >
                <MenuItem value="goal">Goal Updates</MenuItem>
                <MenuItem value="expense">Expense Alerts</MenuItem>
                <MenuItem value="system">System Notifications</MenuItem>
              </TextField>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Goal Notifications
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    name="goal_deadline_reminder"
                    checked={formik.values.goal_deadline_reminder}
                    onChange={formik.handleChange}
                  />
                }
                label="Goal Deadline Reminders"
              />

              {formik.values.goal_deadline_reminder && (
                <Box sx={{ px: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Notify me when goal deadline is within:
                  </Typography>
                  <Slider
                    name="deadline_days_threshold"
                    value={formik.values.deadline_days_threshold}
                    onChange={formik.handleChange}
                    min={1}
                    max={30}
                    marks={[
                      { value: 1, label: '1 day' },
                      { value: 7, label: '7 days' },
                      { value: 30, label: '30 days' }
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} days`}
                  />
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch
                    name="goal_progress_alert"
                    checked={formik.values.goal_progress_alert}
                    onChange={formik.handleChange}
                  />
                }
                label="Goal Progress Alerts"
              />

              {formik.values.goal_progress_alert && (
                <Box sx={{ px: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Alert me when progress is behind by:
                  </Typography>
                  <Slider
                    name="progress_threshold"
                    value={formik.values.progress_threshold}
                    onChange={formik.handleChange}
                    min={1}
                    max={100}
                    marks={[
                      { value: 10, label: '10%' },
                      { value: 20, label: '20%' },
                      { value: 50, label: '50%' }
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Box>
              )}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Expense Alerts
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    name="monthly_spending_alert"
                    checked={formik.values.monthly_spending_alert}
                    onChange={formik.handleChange}
                  />
                }
                label="Monthly Spending Alerts"
              />

              {formik.values.monthly_spending_alert && (
                <Box sx={{ px: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Alert me when monthly spending exceeds:
                  </Typography>
                  <Slider
                    name="spending_threshold"
                    value={formik.values.spending_threshold}
                    onChange={formik.handleChange}
                    min={100}
                    max={200}
                    marks={[
                      { value: 100, label: '100%' },
                      { value: 150, label: '150%' },
                      { value: 200, label: '200%' }
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}% of average`}
                  />
                </Box>
              )}
            </Stack>
          </Box>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            sx={{ alignSelf: 'flex-end' }}
          >
            Save Preferences
          </LoadingButton>
        </Stack>
      </form>
    </Paper>
  );
};

export default NotificationPreferences;
