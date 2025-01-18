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

      {/* Existing Warning Dialog remains the same... */}
    </Box>
  );
}

export default Interview;