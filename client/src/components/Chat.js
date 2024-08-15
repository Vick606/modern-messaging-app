import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { 
  Container, Paper, Typography, TextField, Button, List, ListItem, 
  ListItemText, Grid 
} from '@material-ui/core';
import { AttachFile, Send, GroupAdd } from '@material-ui/icons';
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

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

function Chat() {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [file, setFile] = useState(null);
  const [userStatus, setUserStatus] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isTyping, setIsTyping] = useState({});
  const typingTimeoutRef = useRef({});

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    socket.emit('join', userId);

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('userStatusChanged', ({ userId, status }) => {
      setUserStatus(prevStatus => ({ ...prevStatus, [userId]: status }));
    });

    socket.on('userTyping', (userId) => {
      setIsTyping(prev => ({ ...prev, [userId]: true }));
    });

    socket.on('userStoppedTyping', (userId) => {
      setIsTyping(prev => ({ ...prev, [userId]: false }));
    });

    socket.on('messageRead', ({ messageId, userId }) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), userId] }
            : msg
        )
      );
    });

    fetchGroups();

    return () => {
      socket.off('newMessage');
      socket.off('userStatusChanged');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('messageRead');
    };
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/groups', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const senderId = localStorage.getItem('userId');
    const formData = new FormData();
    formData.append('senderId', senderId);
    formData.append('recipientId', recipient);
    formData.append('content', newMessage);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        body: formData,
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, data]);
      setNewMessage('');
      setFile(null);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const updateStatus = (status) => {
    const userId = localStorage.getItem('userId');
    socket.emit('updateStatus', { userId, status });
  };

  return (
    <Container className={classes.root}>
      <Paper elevation={3}>
        <Grid container>
          <Grid item xs={12} className={classes.inputArea}>
          <form onSubmit={sendMessage}>
            <Grid container spacing={2}>
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