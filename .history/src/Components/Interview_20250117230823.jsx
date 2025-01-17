import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  Grid
} from '@mui/material';
import { Send, Mic, Person, Videocam, VideocamOff } from '@mui/icons-material';

function Interview({ cvData, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        text: "Hello! I'm your AI interviewer today. I've reviewed your CV and I'm ready to begin the interview. Are you ready to start?",
        sender: 'ai'
      }
    ]);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

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
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={2}>
        {/* Left side - Video feed */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Camera Feed</Typography>
              <IconButton 
                color="primary"
                onClick={stream ? stopCamera : startCamera}
              >
                {stream ? <VideocamOff /> : <Videocam />}
              </IconButton>
            </Box>
            <Box 
              sx={{ 
                width: '100%',
                height: 400,
                bgcolor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <IconButton
                color={isRecording ? 'error' : 'primary'}
                onClick={toggleRecording}
                sx={{ width: 56, height: 56 }}
              >
                <Mic sx={{ width: 32, height: 32 }} />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Chat and transcription */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">Interview Session</Typography>
            </Box>

            <Box sx={{ height: 200, overflow: 'auto', p: 2, bgcolor: 'grey.100' }}>
              <Typography variant="h6" gutterBottom>Live Transcription</Typography>
              <Typography>{transcript || 'Start speaking to see transcription...'}</Typography>
            </Box>

            <Box sx={{ height: 300, overflow: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
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
        </Grid>
      </Grid>
    </Box>
  );
}

export default Interview;