import  { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton
} from '@mui/material';
import { Send, Mic, Person } from '@mui/icons-material';

function Interview({ cvData, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    setMessages([
      {
        text: "Hello! I'm your AI interviewer today. I've reviewed your CV and I'm ready to begin the interview. Are you ready to start?",
        sender: 'ai'
      }
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          text: "Thank you for your response. Based on your CV, could you tell me more about your experience with [relevant technology]?",
          sender: 'ai'
        }
      ]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">Interview Session</Typography>
        </Box>

        <Box sx={{ height: 500, overflow: 'auto', p: 2 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'ai' ? 'flex-start' : 'flex-end',
                mb: 2
              }}
            >
              {message.sender === 'ai' && (
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <Person />
                </Avatar>
              )}
              <Paper
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  bgcolor: message.sender === 'ai' ? 'grey.100' : 'primary.main',
                  color: message.sender === 'ai' ? 'text.primary' : 'white'
                }}
              >
                <Typography>{message.text}</Typography>
              </Paper>
            </Box>
          ))}
          {isThinking && (
            <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: 'grey.400', borderRadius: '50%', animation: 'bounce 0.6s infinite' }} />
              <Box sx={{ width: 8, height: 8, bgcolor: 'grey.400', borderRadius: '50%', animation: 'bounce 0.6s infinite', animationDelay: '0.2s' }} />
              <Box sx={{ width: 8, height: 8, bgcolor: 'grey.400', borderRadius: '50%', animation: 'bounce 0.6s infinite', animationDelay: '0.4s' }} />
            </Box>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton>
              <Mic />
            </IconButton>
            <TextField
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your response..."
              variant="outlined"
              size="small"
            />
            <IconButton color="primary" onClick={handleSend}>
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onComplete}
        >
          End Interview & View Analytics
        </Button>
      </Box>
    </Box>
  );
}

export default Interview;