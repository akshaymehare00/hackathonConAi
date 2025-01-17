import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
import { Send, Mic, Person, Videocam, VideocamOff, VolumeUp } from '@mui/icons-material';

function Interview({ cvData, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    const initialMessage = "Hello! I'm your AI interviewer today. I've reviewed your CV and I'm ready to begin the interview. Are you ready to start?";
    setMessages([{ text: initialMessage, sender: 'ai' }]);
    speakText(initialMessage);

    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = async (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            // Send final transcript to API
            await processTranscript(finalTranscript.trim());
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
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const processTranscript = async (text) => {
    try {
      setMessages(prev => [...prev, { text, sender: 'user' }]);
      setIsThinking(true);

      // Mock API call - Replace with your actual API endpoint
      const response = await axios.post('YOUR_API_ENDPOINT', {
        transcript: text,
        cvData
      });

      const aiResponse = response.data?.response || 
        "Thank you for your response. Could you elaborate more on that?";

      setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }]);
      speakText(aiResponse);
      setIsThinking(false);
    } catch (error) {
      console.error('Error processing transcript:', error);
      setIsThinking(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Get available voices and set a natural-sounding one
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang === 'en-US' && voice.name.includes('Natural')
      ) || voices.find(voice => voice.lang === 'en-US');

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

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
    await processTranscript(input);
    setInput('');
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
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <IconButton
                color={isRecording ? 'error' : 'primary'}
                onClick={toggleRecording}
                sx={{ width: 56, height: 56 }}
              >
                <Mic sx={{ width: 32, height: 32 }} />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => window.speechSynthesis.cancel()}
                sx={{ width: 56, height: 56 }}
              >
                <VolumeUp sx={{ width: 32, height: 32 }} />
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
              <Typography 
                sx={{ 
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  color: isRecording ? 'primary.main' : 'text.primary'
                }}
              >
                {transcript || 'Start speaking to see transcription...'}
              </Typography>
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
                      color: message.sender === 'ai' ? 'text.primary' : 'white',
                      position: 'relative'
                    }}
                  >
                    <Typography>{message.text}</Typography>
                    {message.sender === 'ai' && (
                      <IconButton
                        size="small"
                        onClick={() => speakText(message.text)}
                        sx={{ position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)' }}
                      >
                        <VolumeUp />
                      </IconButton>
                    )}
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