import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store'; 
import { fetchMessages, sendMessage, addMessage } from '../../store/slices/messageSlice';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Container,
} from '@mui/material';
import io from 'socket.io-client';

const ChatWindow: React.FC = () => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const { messages, isLoading } = useSelector((state: RootState) => state.messages);
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMessages(token));
      
      // Подключаемся к WebSocket
      // socketRef.current = io('http://localhost:5000');
      
      // socketRef.current.emit('join', user?.id);
      
      // socketRef.current.on('new_message', (newMessage: any) => {
      //   dispatch(addMessage(newMessage));
      // });

      // return () => {
      //   if (socketRef.current) {
      //     socketRef.current.disconnect();
      //   }
      // };
    }
  }, [token, dispatch, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !token) return;

    if (socketRef.current) {
      // Отправляем через WebSocket
      socketRef.current.emit('send_message', {
        content: message,
        userId: user?.id,
      });
    } else {
      // Fallback: отправляем через HTTP
      dispatch(sendMessage({ content: message, token }));
    }
    
    setMessage('');
  };

  if (!user) {
    return (
      <Container>
        <Typography align="center" sx={{ mt: 4 }}>
          Пожалуйста, войдите в систему
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          Чат
        </Typography>
        
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {isLoading ? (
            <Typography>Загрузка сообщений...</Typography>
          ) : messages.length === 0 ? (
            <Typography>Нет сообщений</Typography>
          ) : (
            <List>
              {messages.map((msg) => (
                <ListItem key={msg.id}>
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        <strong>{msg.User?.username || 'Unknown'}:</strong> {msg.content}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.createdAt).toLocaleString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>

        <form onSubmit={handleSendMessage}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Введите сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!message.trim()}
            >
              Отправить
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ChatWindow;