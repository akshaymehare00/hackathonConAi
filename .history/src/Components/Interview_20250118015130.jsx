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
  CircularProgress
} from '@mui/material';
import { Send, Mic, Person, Videocam, VideocamOff, VolumeUp, Download } from '@mui/icons-material';

const simulatedQuestions = [
  "I need to interrupt you there. Could you tell me about a challenging project you worked on?",
  "Sorry to cut in, but I'd like to know more about your leadership experience.",
  "Interesting point. Let me ask you specifically about your problem-solving approach."
];

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
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const interruptionTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
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
      stopRecording();
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

  const startRecording = async () => {
    try {
      if (stream) {
        const options = {
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 1000000
        };
        
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.onstop = handleRecordingStop;
        
        setRecordedChunks([]);
        mediaRecorderRef.current.start(1000);
      }
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setRecordedChunks((prev) => [...prev, event.data]);
    }
  };

  const handleRecordingStop = async () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    setIsVideoAvailable(true);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', blob, 'interview.webm');

      await axios.post('YOUR_API_ENDPOINT/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadVideo = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'interview-recording.webm';
    a.click();
    URL.revokeObjectURL(url);
  };

  const terminateInterview = (reason) => {
    stopRecording();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
    
    setMessages(prev => [...prev, { 
      text: reason, 
      sender: 'ai', 
      isInterruption: true 
    }]);
    
    setIsInterviewEnded(true);
  };

  const handleEndInterview = () => {
    stopRecording();
    setIsInterviewEnded(true);
  };

  // ... (keep all other existing functions)

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Camera Feed</Typography>
              <Box>
                {isVideoAvailable && (
                  <IconButton
                    color="primary"
                    onClick={downloadVideo}
                    sx={{ mr: 1 }}
                    title="Download Recording"
                    disabled={isUploading}
                  >
                    {isUploading ? <CircularProgress size={24} /> : <Download />}
                  </IconButton>
                )}
                <IconButton 
                  color="primary"
                  onClick={stream ? stopCamera : startCamera}
                >
                  {stream ? <VideocamOff /> : <Videocam />}
                </IconButton>
              </Box>
            </Box>
            {/* ... (keep existing video element) */}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* ... (keep existing chat interface) */}
        </Grid>
      </Grid>

      {isInterviewEnded && (
        <Dialog open={true} maxWidth="sm" fullWidth>
          <DialogTitle>Interview Completed</DialogTitle>
          <DialogContent>
            <Typography paragraph>
              The interview has ended. You can download the recording using the download button above the video feed.
            </Typography>
            {isUploading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography>Uploading recording...</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={onComplete} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

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
  );
}

export default Interview;