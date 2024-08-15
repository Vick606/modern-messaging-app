import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Switch, FormControlLabel, Button, styled } from '@mui/material';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const StyledForm = styled('form')(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/settings', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch settings');
      setLoading(false);
    }
  };

  const handleChange = (name) => (event) => {
    setSettings({ ...settings, [name]: event.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      setSettings(data);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <StyledContainer maxWidth="sm">
      <Paper elevation={3} sx={{ padding: '20px' }}>
        <Typography variant="h5" align="center" gutterBottom>
          User Settings
        </Typography>
        <StyledForm onSubmit={handleSubmit}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.darkMode}
                onChange={handleChange('darkMode')}
                color="primary"
              />
            }
            label="Dark Mode"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange('emailNotifications')}
                color="primary"
              />
            }
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.soundNotifications}
                onChange={handleChange('soundNotifications')}
                color="primary"
              />
            }
            label="Sound Notifications"
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ marginTop: '20px' }}
          >
            Save Settings
          </Button>
        </StyledForm>
      </Paper>
    </StyledContainer>
  );
}

export default Settings;