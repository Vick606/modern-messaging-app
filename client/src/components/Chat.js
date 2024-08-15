import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import LoadingSpinner from './LoadingSpinner';
import CryptoJS from 'crypto-js';
import { 
  Container, Paper, Typography, TextField, Button, List, ListItem, 
  ListItemText, Grid, IconButton, Avatar, Tabs, Tab
} from '@material-ui/core';
import { AttachFile, Send, GroupAdd, PersonAdd } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

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
  const [file, setFile] = useState(null);
  const [userStatus, setUserStatus] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isTyping, setIsTyping] = useState({});
  const typingTimeoutRef = useRef({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [image, setImage] = useState(null);
  const messageAreaRef = useRef(null);

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

    socket.on('userStatusChanged', ({ userId, isOnline }) => {
      setFriends(prevFriends => 
        prevFriends.map(friend => 
          friend._id === userId ? { ...friend, isOnline } : friend
        )
      );
    });

    fetchFriends();
    fetchGroups();

    socket.emit('userConnected', localStorage.getItem('userId'));

    return () => {
      socket.off('newMessage');
      socket.off('userStatusChanged');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('messageRead');
      socket.off('userStatusChanged');
    };
  }, []);

  useEffect(() => {
    if (recipient) {
      setMessages([]);
      setPage(1);
      fetchMessages();
    }
  }, [recipient]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/friends', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      toast.error('Failed to fetch friends');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/groups', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      toast.error('Failed to fetch groups');
    }
  };

  const fetchMessages = async () => {
    if (!recipient) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${recipient}?page=${page}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, ...data.messages]);
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch messages');
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', newMessage);
    if (image) {
      formData.append('file', image);
    }
    formData.append('recipientId', recipient);

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
      setImage(null);
    } catch (error) {
      toast.error('Failed to send message');
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

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const addFriend = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/friends/${userId}`, {
        method: 'POST',
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      setFriends(data);
      toast.success('Friend added successfully');
    } catch (error) {
      toast.error('Failed to add friend');
    }
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
          body: JSON.stringify({ name, members: [] })
        });
        const data = await response.json();
        setGroups(prevGroups => [...prevGroups, data]);
        toast.success('Group created successfully');
      } catch (error) {
        toast.error('Failed to create group');
      }
    }
  };

  const handleScroll = () => {
    if (messageAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageAreaRef.current;
      if (scrollTop === 0 && hasMore && !loading) {
        setPage(prevPage => prevPage + 1);
        fetchMessages();
      }
    }
  };

  return (
    <Container className={classes.root}>
      <Paper elevation={3}>
        <Grid container>
          <Grid item xs={3}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Friends" />
              <Tab label="Groups" />
            </Tabs>
            {activeTab === 0 ? (
              <List>
                {friends.map(friend => (
                  <ListItem 
                    button 
                    key={friend._id} 
                    onClick={() => setRecipient(friend._id)}
                    selected={recipient === friend._id}
                  >
                    <ListItemText 
                      primary={friend.username} 
                      secondary={friend.isOnline ? 'Online' : 'Offline'} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <List>
                {groups.map(group => (
                  <ListItem 
                    button 
                    key={group._id} 
                    onClick={() => setRecipient(group._id)}
                    selected={recipient === group._id}
                  >
                    <ListItemText primary={group.name} />
                  </ListItem>
                ))}
              </List>
            )}
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              startIcon={activeTab === 0 ? <PersonAdd /> : <GroupAdd />}
              onClick={activeTab === 0 ? () => addFriend(prompt('Enter user ID:')) : createGroup}
            >
              {activeTab === 0 ? 'Add Friend' : 'Create Group'}
            </Button>
          </Grid>
          <Grid item xs={9}>
            <List className={classes.messageArea} ref={messageAreaRef} onScroll={handleScroll}>
              {loading && <LoadingSpinner />}
              {messages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={CryptoJS.AES.decrypt(message.content, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)}
                    secondary={message.sender}
                  />
                  {message.imageUrl && (
                    <img src={`http://localhost:5000${message.imageUrl}`} alt="Sent image" style={{ maxWidth: '200px' }} />
                  )}
                </ListItem>
              ))}
            </List>
            <form onSubmit={sendMessage}>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message"
                  />
                </Grid>
                <Grid item xs={2}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload">
                    <IconButton component="span">
                      <AttachFile />
                    </IconButton>
                  </label>
                </Grid>
                <Grid item xs={3}>
                  <Button 
                    fullWidth
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    endIcon={<Send />}
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