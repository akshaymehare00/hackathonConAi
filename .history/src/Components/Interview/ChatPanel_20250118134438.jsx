import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Fade
} from '@mui/material';
import { Person, Send } from '@mui/icons-material';

function ChatPanel({ messages, isThinking, messagesEndRef, processTranscript }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    processTranscript(input);
    setInput('');
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar sx={{ bgcolor: 'primary.dark' }}>
          <Person />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">AI Interviewer</Typography>
          <Typography variant="caption">
            {isThinking ? 'Thinking...' : 'Online'}
          </Typography>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: 'grey.50' }}>
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isThinking && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..."
            variant="outlined"
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!input.trim()}
            sx={{ minWidth: 100, borderRadius: 3 }}
          >
            <Send sx={{ mr: 1 }} />
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

function MessageBubble({ message }) {
  const isAI = message.sender === 'AI';
  
  return (
    <Fade in={true}>
      <Box sx={{
        display: 'flex',
        justifyContent: isAI ? 'flex-start' : 'flex-end',
        mb: 2
      }}>
        {isAI && (
          <Avatar sx={{ 
            bgcolor: message.isInterruption ? 'error.main' : 'primary.main',
            mr: 1,
            width: 32,
            height: 32
          }}>
            <Person sx={{ fontSize: 20 }} />
          </Avatar>
        )}
        <Paper elevation={1} sx={{
          maxWidth: '70%',
          p: 2,
          bgcolor: isAI ? 'background.paper' : 'primary.main',
          color: isAI ? 'text.primary' : 'primary.contrastText',
          borderRadius: isAI ? '4px 20px 20px 20px' : '20px 4px 20px 20px'
        }}>
          <Typography variant="body1">{message.text}</Typography>
        </Paper>
      </Box>
    </Fade>
  );
}

function ThinkingIndicator() {
  return (
    <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
      <CircularProgress size={20} />
      <Typography variant="body2" color="text.secondary">
        AI is thinking...
      </Typography>
    </Box>
  );
}

export default ChatPanel;