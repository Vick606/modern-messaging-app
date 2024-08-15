import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Avatar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    margin: 'auto',
  },
  form: {
    marginTop: theme.spacing(2),
  },
}));

function Profile() {
  const classes = useStyles();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      setUser(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch user profile');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(user)
      });
      const data = await response.json();
      setUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className={classes.root} maxWidth="sm">
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Avatar className={classes.avatar} src={user.avatar} alt={user.username} />
        <Typography variant="h5" align="center" gutterBottom>
          {user.username}'s Profile
        </Typography>
        <form onSubmit={handleSubmit} className={classes.form}>
          <TextField
            fullWidth
            label="Username"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Bio"
            value={user.bio}
            onChange={(e) => setUser({ ...user, bio: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
            Update Profile
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Profile;