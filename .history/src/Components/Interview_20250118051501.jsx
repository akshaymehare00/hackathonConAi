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
  // Existing states...
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

  // New states for video recording
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [showRecordingComplete, setShowRecordingComplete] = useState(false);

  // Existing refs...
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const interruptionTimerRef = useRef(null);
  
  // New refs for recording
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Existing useEffect and functions remain the same...

  // New function to start video recording
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

  // New function to stop video recording
  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsVideoRecording(false);
    }
  };

  // New function to handle video download
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

  // Modified startCamera function to include audio
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

  // Add recording controls to the camera feed section
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
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={2}>
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
              {isVideoRecording && (
                <Box
                  sx={{
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
                  }}
                >
                  <FiberManualRecord sx={{ mr: 1 }} />
                  <Typography variant="body2">Recording</Typography>
                </Box>
              )}
            </Box>
            {renderRecordingControls()}
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

        {/* Rest of the component remains the same... */}
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
                    <Avatar sx={{ bgcolor: message.isInterruption ? 'error.main' : 'primary.main', mr: 1 }}>
                      <Person />
                    </Avatar>
                  )}
                  <Paper
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

      {/* Add Recording Complete Dialog */}
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
    </Box>
    </Box>
  );
}

export default Interview;