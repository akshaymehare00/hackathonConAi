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
  Stack
} from '@mui/material';
import { 
  Send, 
  Mic, 
  Person, 
  Videocam, 
  VideocamOff, 
  VolumeUp,
  FiberManualRecord,
  Stop,
  Download
} from '@mui/icons-material';

// Previous simulatedQuestions array remains the same...

function Interview({ cvData, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [stream, setStream] = useState(null);
  const [interruptionIndex, setInterruptionIndex] = useState(0);
  const [cameraWarnings, setCameraWarnings] = useState(0);
  const [microphoneWarnings, setMicrophoneWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Video recording states
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [showRecordingComplete, setShowRecordingComplete] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const interruptionTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    // Start camera and microphone automatically
    startCamera();
    startRecording();

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
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      const interruptionTime = Math.floor(Math.random() * (15000 - 8000) + 8000);
      
      interruptionTimerRef.current = setTimeout(() => {
        if (interruptionIndex < simulatedQuestions.length) {
          handleInterruption(simulatedQuestions[interruptionIndex]);
          setInterruptionIndex(prev => prev + 1);
        }
      }, interruptionTime);
    } else {
      if (interruptionTimerRef.current) {
        clearTimeout(interruptionTimerRef.current);
      }
    }

    return () => {
      if (interruptionTimerRef.current) {
        clearTimeout(interruptionTimerRef.current);
      }
    };
  }, [isRecording, interruptionIndex]);

  const handleInterruption = (question) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    window.speechSynthesis.cancel();
    setMessages(prev => [...prev, { text: question, sender: 'ai', isInterruption: true }]);
    speakText(question);
  };

  const processTranscript = async (text) => {
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

  // Video recording functions
  const startVideoRecording = () => {
    if (stream) {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setShowRecordingComplete(true);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsVideoRecording(true);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsVideoRecording(false);
    }
  };

  const handleDownload = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'interview-recording.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      showMediaWarning('Camera and microphone access is required for the interview.');
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
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    window.speechSynthesis.cancel();
    
    setMessages(prev => [...prev, { 
      text: reason, 
      sender: 'ai', 
      isInterruption: true 
    }]);
    
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

  const renderRecordingControls = () => (
    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
      {!isVideoRecording ? (
        <Button
          variant="contained"
          color="error"
          startIcon={<FiberManualRecord />}
          onClick={startVideoRecording}
          disabled={!stream}
        >
          Record Interview
        </Button>
      ) : (
        <Button
          variant="contained"
          color="error"
          startIcon={<Stop />}
          onClick={stopVideoRecording}
        >
          Stop Recording
        </Button>
      )}
      
      {recordedBlob && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<Download />}
          onClick={handleDownload}
        >
          Save Recording
        </Button>
      )}
    </Stack>
  );

  // Modify the camera feed section in the return statement
  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', bgcolor: 'grey.100' }}>
    <Box sx={{ 
      height: '100%', 
      p: 3,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
        Virtual Interviewer AI
      </Typography>
      
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* Left Column - Camera Feed */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Camera Feed</Typography>
              <IconButton 
                color="primary"
                onClick={stream ? stopCamera : startCamera}
              >
                {stream ? <VideocamOff /> : <Videocam />}
              </IconButton>
            </Box>
            
            <Box sx={{ 
              position: 'relative',
              flexGrow: 1,
              bgcolor: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}>
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
              {isVideoRecording && (
                <Box sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'error.main',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1
                }}>
                  <FiberManualRecord sx={{ mr: 1 }} />
                  <Typography variant="body2">Recording</Typography>
                </Box>
              )}
            </Box>

            <Stack spacing={2} sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="center">
                {!isVideoRecording ? (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<FiberManualRecord />}
                    onClick={startVideoRecording}
                    disabled={!stream}
                    fullWidth
                  >
                    Record Interview
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Stop />}
                    onClick={stopVideoRecording}
                    fullWidth
                  >
                    Stop Recording
                  </Button>
                )}
                
                {recordedBlob && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    onClick={handleDownload}
                    fullWidth
                  >
                    Save Recording
                  </Button>
                )}
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="center">
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
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column - Interview Session */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3}
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">Interview Session</Typography>
            </Box>

            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
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

            <Box sx={{ 
              flexGrow: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'ai' ? 'flex-start' : 'flex-end',
                  }}
                >
                  {message.sender === 'ai' && (
                    <Avatar sx={{ 
                      bgcolor: message.isInterruption ? 'error.main' : 'primary.main',
                      mr: 1
                    }}>
                      <Person />
                    </Avatar>
                  )}
                  <Paper
                    elevation={1}
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      bgcolor: message.sender === 'ai' 
                        ? message.isInterruption ? 'error.light' : 'grey.100'
                        : 'primary.main',
                      color: message.sender === 'ai' ? 'text.primary' : 'white',
                      position: 'relative'
                    }}
                  >
                    <Typography>{message.text}</Typography>
                    {message.sender === 'ai' && (
                      <IconButton
                        size="small"
                        onClick={() => speakText(message.text)}
                        sx={{ 
                          position: 'absolute',
                          right: -40,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
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

            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={onComplete}
                fullWidth
              >
                End Interview & View Analytics
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>

    {/* Dialogs */}
    <Dialog
      open={showRecordingComplete}
      onClose={() => setShowRecordingComplete(false)}
    >
      <DialogTitle>Recording Complete</DialogTitle>
      <DialogContent>
        <Alert severity="success" sx={{ mt: 2 }}>
          Your interview has been recorded successfully. You can now download the recording.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowRecordingComplete(false)}>Close</Button>
        <Button 
          onClick={handleDownload} 
          startIcon={<Download />}
          variant="contained"
        >
          Download Recording
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog
      open={showWarning}
      onClose={() => setShowWarning(false)}
    >
      <DialogTitle sx={{ color: 'error.main' }}>Warning</DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mt: 2 }}>
          {warningMessage}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowWarning(false)} color="primary">
          Understood
        </Button>
      </DialogActions>
    </Dialog>
  </Container>
  );
}

export default Interview;