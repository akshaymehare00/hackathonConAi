import React, { useState, useEffect, useRef } from 'react';
import VideoPanel from './VideoPanel';
import ChatPanel from './ChatPanel';
import {
  Box,
  Grid,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import {
  Close,
  Assessment,
  ExitToApp
} from '@mui/icons-material';

function Interview({ cvData, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [stream, setStream] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [endReason, setEndReason] = useState('complete');
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [cameraWarnings, setCameraWarnings] = useState(0);
  const [microphoneWarnings, setMicrophoneWarnings] = useState(0);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const websocketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    startCamera();
    initializeWebSocket();
    initializeSpeechRecognition();

    const initialMessage = "Hello! I'm your AI interviewer today. I've reviewed your CV and I'm ready to begin the interview. Are you ready to start?";
    setMessages([{ text: initialMessage, sender: 'AI' }]);
    speakText(initialMessage);

    return cleanup;
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
  };

  const initializeWebSocket = () => {
    websocketRef.current = new WebSocket(`ws://13.127.144.141:3004/ws/interview/${localStorage.getItem('cvResponse')}/`);
    
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
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = async (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
            await processTranscript(finalTranscript.trim());
          }
        }
        setTranscript(finalTranscript);
      };

      recognitionRef.current = recognition;
    }
  };

  const handleAIResponse = (message) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    window.speechSynthesis.cancel();
    
    setMessages(prev => [...prev, { text: message, sender: 'AI' }]);
    speakText(message);

    setTimeout(() => {
      if (!isRecording) startRecording();
    }, 1000);
  };

  const processTranscript = async (text) => {
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setIsThinking(true);

    try {
      await fetch('http://13.127.144.141:3004/api/interview_conversation/post/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'candidate',
          message: text,
          interview: localStorage.getItem('cvResponse')
        })
      });
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const speakText = (text) => {
    if (!isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
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
      setWarningMessage('Camera access is required for the interview.');
      setShowWarning(true);
    }
  };

  const startRecording = () => {
    recognitionRef.current?.start();
    setIsRecording(true);
  };

  const handleEndInterview = (reason) => {
    setEndReason(reason);
    setShowEndDialog(true);
  };

  const confirmEndInterview = () => {
    cleanup();
    const endMessage = endReason === 'complete' 
      ? "Thank you for completing the interview. Let's review your performance."
      : "Interview ended early. You can always come back and try again.";
      
    setMessages(prev => [...prev, { text: endMessage, sender: 'AI' }]);
    setTimeout(() => onComplete(), 2000);
    setShowEndDialog(false);
  };

  const speedDialActions = [
    { icon: <Assessment />, name: 'Complete Interview', onClick: () => handleEndInterview('complete') },
    { icon: <ExitToApp />, name: 'Leave Interview', onClick: () => handleEndInterview('leave') }
  ];

  return (
    <Box sx={{ height: '100vh', width: '100%', overflow: 'hidden', p: 3, bgcolor: '#f5f5f5' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* Right side - Chat Interface */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <ChatPanel
            messages={messages}
            isThinking={isThinking}
            messagesEndRef={messagesEndRef}
            processTranscript={processTranscript}
          />
        </Grid>
        
        {/* Left side - Video Feed */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <VideoPanel
            videoRef={videoRef}
            stream={stream}
            isRecording={isRecording}
            transcript={transcript}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            startCamera={startCamera}
            startRecording={startRecording}
            speakText={speakText}
          />
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <SpeedDial
        ariaLabel="End Interview Options"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        icon={<SpeedDialIcon icon={<Close />} />}
        FabProps={{
          sx: {
            bgcolor: 'error.main',
            '&:hover': { bgcolor: 'error.dark' }
          }
        }}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>

      {/* Dialogs */}
      <Dialog open={showEndDialog} onClose={() => setShowEndDialog(false)}>
        <DialogTitle sx={{ color: endReason === 'leave' ? 'error.main' : 'primary.main' }}>
          {endReason === 'complete' ? 'Complete Interview' : 'Leave Interview'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {endReason === 'complete' 
              ? "Are you sure you want to complete the interview? You'll be able to view your performance analytics after this."
              : "Are you sure you want to leave the interview? Your progress will be saved, but the interview will end now."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEndDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={confirmEndInterview} variant="contained" autoFocus>
            {endReason === 'complete' ? 'Complete Interview' : 'Leave Now'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Warning</DialogTitle>
        <DialogContent>
          <Alert severity="error" variant="outlined">{warningMessage}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarning(false)} variant="contained">
            Understood
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Interview;