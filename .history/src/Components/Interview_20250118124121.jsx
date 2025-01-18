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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  Fade
} from '@mui/material';
import { 
  Send, 
  Mic, 
  Person, 
  Videocam, 
  VideocamOff, 
  VolumeUp,
  VolumeOff,
  MoreVert,
  Settings,
  Help
} from '@mui/icons-material';


function Interview({ cvData, onComplete }) {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [stream, setStream] = useState(null);
  const [cameraWarnings, setCameraWarnings] = useState(0);
  const [microphoneWarnings, setMicrophoneWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const interruptionTimerRef = useRef(null);
  const websocketRef = useRef(null);
  const lastMessageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    // Start camera and microphone automatically
    startCamera();
    startRecording();
    initializeWebSocket();

    const initialMessage = "Hello! I'm your AI interviewer today. I've reviewed your CV and I'm ready to begin the interview. Are you ready to start?";
    setMessages([{ text: initialMessage, sender: 'AI' }]);
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
      if (interruptionTimerRef.current) {
        clearTimeout(interruptionTimerRef.current);
      }
    };
  }, []);


  const initializeWebSocket = () => {
    websocketRef.current = new WebSocket(`ws://13.127.144.141:3004/ws/interview/${localStorage.getItem('cvResponse')}/`);

    websocketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    websocketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.sender === 'AI') {
          handleAIResponse(data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Attempt to reconnect on error
      setTimeout(initializeWebSocket, 5000);
    };

    websocketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after 5 seconds
      setTimeout(initializeWebSocket, 5000);
    };
  };

  const handleAIResponse = (message) => {
    // Check if this is the same as the last message
    if (lastMessageRef.current === message) {
      return; // Skip if it's a duplicate
    }
    
    // Update the last message reference
    lastMessageRef.current = message;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    window.speechSynthesis.cancel();
    
    setMessages(prev => [...prev, { text: message, sender: 'AI', isInterruption: true }]);
    speakText(message);

    setTimeout(() => {
      if (!isRecording) {
        startRecording();
      }
    }, 1000);
  };


  const processTranscript = async (text) => {
    try {
      setMessages(prev => [...prev, { text, sender: 'user' }]);
      setIsThinking(true);

      const response = await axios.post('http://13.127.144.141:3004/api/interview_conversation/post/', {
        sender: 'candidate',
        message: text,
        interview:localStorage.getItem('cvResponse')
        // cvData
      });
      console.log("🚀 ~ processTranscript ~ response:", response)

      // const aiResponse = response.data || 
      //   "Thank you for your response. Could you elaborate more on that?";

      // setMessages(prev => [...prev, { text: aiResponse, sender: 'AI' }]);
      // speakText(aiResponse);
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
    } catch (err) {
      console.error('Error accessing camera:', err);
      showMediaWarning('Camera access is required for the interview.');
    }
  };

  const stopCamera = () => {
    if (cameraWarnings >= 2) {
      terminateInterview('Camera was disabled too many times. Interview terminated.');
      return;
    }

    setCameraWarnings(prev => prev + 1);
    setWarningMessage(`Warning: Camera is required. ${2 - cameraWarnings} attempts remaining before interview termination.`);
    setShowWarning(true);
  };

  const startRecording = () => {
    recognitionRef.current?.start();
    setIsRecording(true);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (microphoneWarnings >= 2) {
        terminateInterview('Microphone was disabled too many times. Interview terminated.');
        return;
      }

      setMicrophoneWarnings(prev => prev + 1);
      setWarningMessage(`Warning: Microphone is required. ${2 - microphoneWarnings} attempts remaining before interview termination.`);
      setShowWarning(true);
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const terminateInterview = (reason) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
    
    setMessages(prev => [...prev, { 
      text: reason, 
      sender: 'AI', 
      isInterruption: true 
    }]);
    
    // Delay the onComplete to allow the user to read the termination message
    setTimeout(onComplete, 3000);
  };

  const showMediaWarning = (message) => {
    setWarningMessage(message);
    setShowWarning(true);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await processTranscript(input);
    setInput('');
  };

  return (
    <Box sx={{ 
      maxWidth: 1400, 
      mx: 'auto',
      px: 2,
      py: 3,
      minHeight: '90vh',
      bgcolor: 'background.default'
    }}>
      <Grid container spacing={3}>
        {/* Left Panel - Camera Feed */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={4} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              background: theme.palette.background.paper,
              transition: 'all 0.3s ease'
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Interview Session
              </Typography>
              <Box>
                <Tooltip title={stream ? "Disable Camera" : "Enable Camera"}>
                  <IconButton 
                    color={stream ? "primary" : "default"}
                    onClick={stream ? stopCamera : startCamera}
                    sx={{ mr: 1 }}
                  >
                    {stream ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings">
                  <IconButton>
                    <Settings />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Camera View */}
            <Box 
              sx={{ 
                position: 'relative',
                width: '100%',
                pt: '75%', // 4:3 Aspect Ratio
                bgcolor: 'black',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              {/* Camera Controls Overlay */}
              <Fade in={showControls}>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2
                  }}
                >
                  <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
                    <IconButton
                      color={isRecording ? 'error' : 'primary'}
                      onClick={toggleRecording}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <Mic />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setIsMuted(!isMuted);
                        window.speechSynthesis.cancel();
                      }}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      {isMuted ? <VolumeOff /> : <VolumeUp />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Fade>
            </Box>

            {/* Live Transcription */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography 
                variant="subtitle2" 
                color="primary"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                Live Transcription
              </Typography>
              <Paper
                variant="outlined"
                sx={{ 
                  p: 2,
                  minHeight: 100,
                  maxHeight: 150,
                  overflow: 'auto',
                  bgcolor: isRecording ? 'primary.50' : 'background.default',
                  transition: 'background-color 0.3s ease'
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontFamily: 'monospace',
                    color: isRecording ? 'primary.main' : 'text.secondary'
                  }}
                >
                  {transcript || 'Start speaking to see transcription...'}
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Chat Interface */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={4} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Chat Header */}
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
              <Tooltip title="Help">
                <IconButton color="inherit">
                  <Help />
                </IconButton>
              </Tooltip>
              <Tooltip title="More options">
                <IconButton color="inherit">
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Messages Area */}
            <Box 
              sx={{ 
                flex: 1,
                overflow: 'auto',
                p: 3,
                bgcolor: 'grey.50'
              }}
            >
              {messages.map((message, index) => (
                <Fade in={true} key={index}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'AI' ? 'flex-start' : 'flex-end',
                      mb: 2
                    }}
                  >
                    {message.sender === 'AI' && (
                      <Avatar 
                        sx={{ 
                          bgcolor: message.isInterruption ? 'error.main' : 'primary.main',
                          mr: 1,
                          width: 32,
                          height: 32
                        }}
                      >
                        <Person sx={{ fontSize: 20 }} />
                      </Avatar>
                    )}
                    <Paper
                      elevation={1}
                      sx={{
                        maxWidth: '70%',
                        p: 2,
                        bgcolor: message.sender === 'AI' 
                          ? 'background.paper'
                          : 'primary.main',
                        color: message.sender === 'AI' ? 'text.primary' : 'primary.contrastText',
                        borderRadius: message.sender === 'AI' 
                          ? '4px 20px 20px 20px'
                          : '20px 4px 20px 20px',
                        position: 'relative'
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                      {message.sender === 'AI' && !isMuted && (
                        <IconButton
                          size="small"
                          onClick={() => speakText(message.text)}
                          sx={{ 
                            position: 'absolute',
                            right: -36,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': { bgcolor: 'grey.100' }
                          }}
                        >
                          <VolumeUp sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Paper>
                  </Box>
                </Fade>
              ))}
              {isThinking && (
                <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    AI is thinking...
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box 
              sx={{ 
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center'
                }}
              >
                <TextField
                  fullWidth
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your response..."
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3
                    }
                  }}
                />
                <Tooltip title="Send message">
                  <IconButton 
                    color="primary" 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'grey.300',
                        color: 'grey.500'
                      }
                    }}
                  >
                    <Send />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>

          {/* End Interview Button */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onComplete}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              End Interview & View Analytics
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Warning Dialog */}
      <Dialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'error.main',
            pb: 1
          }}
        >
          Warning
        </DialogTitle>
        <DialogContent>
          <Alert 
            severity="error" 
            variant="outlined"
            sx={{ mt: 1 }}
          >
            {warningMessage}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => setShowWarning(false)} 
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Understood
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Interview;