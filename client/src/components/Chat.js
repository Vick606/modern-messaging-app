import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { 
  Container, Paper, Typography, TextField, Button, List, ListItem, 
  ListItemText, Grid 
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  messageArea: {
    height: 400,
    overflowY: 'auto',
  },
  inputArea: {
    padding: theme.spacing(2),
  },
}));

const socket = io('http://localhost:5000');

function Chat() {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    socket.emit('join', userId);

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    const senderId = localStorage.getItem('userId');
    socket.emit('sendMessage', { senderId, recipientId: recipient, content: newMessage });
    setNewMessage('');
  };

  return (
    <Container className={classes.root}>
      <Paper elevation={3}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Chat
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <List className={classes.messageArea}>
              {messages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={message.content}
                    secondary={message.sender}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} className={classes.inputArea}>
            <form onSubmit={sendMessage}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Recipient ID"
                  />
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button 
                    fullWidth
                    variant="contained" 
                    color="primary" 
                    type="submit"
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Chat;