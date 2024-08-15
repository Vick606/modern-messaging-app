import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';
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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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
    formData.append('content', CryptoJS.AES.encrypt(newMessage, ENCRYPTION_KEY).toString());
    if (selectedGroup) {
      formData.append('groupId', selectedGroup);
    } else {
      formData.append('recipientId', recipient);
    }
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/${selectedGroup ? 'groups/' + selectedGroup + '/messages' : 'messages/send'}`, {
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

  const handleTyping = () => {
    const userId = localStorage.getItem('userId');
    socket.emit('typing', { userId, recipientId: recipient });
    
    if (typingTimeoutRef.current[recipient]) {
      clearTimeout(typingTimeoutRef.current[recipient]);
    }
    
    typingTimeoutRef.current[recipient] = setTimeout(() => {
      socket.emit('stopTyping', { userId, recipientId: recipient });
    }, 1000);
  };

  const markAsRead = (messageId) => {
    const userId = localStorage.getItem('userId');
    socket.emit('markAsRead', { messageId, userId });
  };

  const createGroup = async () => {
    const name = prompt('Enter group name:');
    if (name) {
      try {
        const response = await fetch('http://localhost:5000/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify({ name, members: [recipient] })
        });
        const data = await response.json();
        setGroups(prevGroups => [...prevGroups, data]);
      } catch (error) {
        console.error('Failed to create group', error);
      }
    }
  };

  return (
    <Container className={classes.root}>
      <Paper elevation={3}>
        <Grid container>
          <Grid item xs={3}>
            <List>
              {groups.map(group => (
                <ListItem 
                  button 
                  key={group._id} 
                  onClick={() => setSelectedGroup(group._id)}
                  selected={selectedGroup === group._id}
                >
                  <ListItemText primary={group.name} />
                </ListItem>
              ))}
            </List>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              startIcon={<GroupAdd />}
              onClick={createGroup}
            >
              Create Group
            </Button>
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