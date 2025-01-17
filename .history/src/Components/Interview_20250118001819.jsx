import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { Send, Mic, Person, Videocam, VideocamOff, VolumeUp } from '@mui/icons-material';

function Interview({ cvData, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [stream, setStream] = useState(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const faceCheckIntervalRef = useRef(null);
  const noFaceTimeoutRef = useRef(null);

  useEffect(() => {
    loadFaceDetectionModels();
    return () => {
      clearInterval(faceCheckIntervalRef.current);
      clearTimeout(noFaceTimeoutRef.current);
    };
  }, []);

  const loadFaceDetectionModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    } catch (error) {
      console.error('Error loading face detection models:', error);
      setAlertMessage('Error loading face detection models. Please refresh the page.');
      setShowAlert(true);
    }
  };

  useEffect(() => {
    const initialMessage = "Hello! I'm your AI interviewer today. Please ensure you're visible in the camera to begin the interview. I'll review your CV once we start.";
    setMessages([{ text: initialMessage, sender: 'ai' }]);
    speakText(initialMessage);

    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = async (event) => {
        if (!isFaceDetected) return;
        
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            await processTranscript(finalTranscript.trim());
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current = recognition;
    }

    return () => cleanup();
  }, []);

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }
    clearInterval(faceCheckIntervalRef.current);
    clearTimeout(noFaceTimeoutRef.current);
  };

  const startFaceDetection = async () => {
    if (!videoRef.current || !stream) return;

    faceCheckIntervalRef.current = setInterval(async () => {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      const facePresent = detections.length > 0;
      setIsFaceDetected(facePresent);

      if (!facePresent && isInterviewActive) {
        handleNoFaceDetected();
      } else if (facePresent) {
        clearTimeout(noFaceTimeoutRef.current);
        setAlertCount(0);
      }
    }, 1000);
  };

  const handleNoFaceDetected = () => {
    if (alertCount >= 3) {
      endInterview();
      return;
    }

    setAlertMessage('Please remain visible in the camera frame.');
    setShowAlert(true);
    setAlertCount(prev => prev + 1);

    noFaceTimeoutRef.current = setTimeout(() => {
      if (!isFaceDetected) {
        handleNoFaceDetected();
      }
    }, 10000); // 10 seconds between alerts
  };

  const startInterview = async () => {
    if (!isFaceDetected) {
      setAlertMessage('Please position yourself in front of the camera to begin the interview.');
      setShowAlert(true);
      return;
    }

    setIsInterviewActive(true);
    const welcomeMessage = "Great! I can see you clearly now. I've reviewed your CV and I'm ready to begin the interview. Let's start with your first question...";
    setMessages(prev => [...prev, { text: welcomeMessage, sender: 'ai' }]);
    speakText(welcomeMessage);
  };

  const endInterview = () => {
    cleanup();
    setIsInterviewActive(false);
    const endMessage = "Interview ended due to extended absence. Please restart when you're ready.";
    setMessages(prev => [...prev, { text: endMessage, sender: 'ai' }]);
    speakText(endMessage);
    onComplete();
  };

  const processTranscript = async (text) => {
    if (!isFaceDetected || !isInterviewActive) return;

    try {
      setMessages(prev => [...prev, { text, sender: 'user' }]);
      setIsThinking(true);

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
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

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
      startFaceDetection();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setAlertMessage('Error accessing camera. Please check your camera permissions.');
      setShowAlert(true);
    }
  };

  const stopCamera = () => {
    cleanup();
    setStream(null);
    setIsFaceDetected(false);
  };

  const toggleRecording = () => {
    if (!isFaceDetected || !isInterviewActive) {
      setAlertMessage('Please ensure you are visible in the camera to record.');
      setShowAlert(true);
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleSend = async () => {
    if (!input.trim() || !isFaceDetected || !isInterviewActive) return;
    await processTranscript(input);
    setInput('');
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Camera Feed</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {isFaceDetected && (
                  <Typography variant="body2" color="success.main">
                    Face Detected
                  </Typography>
                )}
                <IconButton 
                  color="primary"
                  onClick={stream ? stopCamera : startCamera}
                >
                  {stream ? <VideocamOff /> : <Videocam />}
                </IconButton>
              </Box>
            </Box>
            <Box 
              sx={{ 
                width: '100%',
                height: 400,
                bgcolor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
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
              {!isInterviewActive && isFaceDetected && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startInterview}
                  sx={{ position: 'absolute', bottom: 16 }}
                >
                  Start Interview
                </Button>
              )}
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <IconButton
                color={isRecording ? 'error' : 'primary'}
                onClick={toggleRecording}
                sx={{ width: 56, height: 56 }}
                disabled={!isInterviewActive}
              >
                <Mic sx={{ width: 32, height: 32 }} />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => window.speechSynthesis.cancel()}
                sx={{ width: 56, height: 56 }}
                disabled={!isInterviewActive}
              >
                <VolumeUp sx={{ width: 32, height: 32 }} />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

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
                  disabled={!isInterviewActive}
                />
                <IconButton 
                  color="primary" 
                  onClick={handleSend}
                  disabled={!isInterviewActive}
                >
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
              disabled={!isInterviewActive}
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