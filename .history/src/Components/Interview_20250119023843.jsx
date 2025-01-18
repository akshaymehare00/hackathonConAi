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
  Fade,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  DialogContentText,
  LinearProgress
} from '@mui/material';
import { 
  Send, 
  Mic, 
  Person, 
  Videocam, 
  VideocamOff, 
  VolumeUp,
  VolumeOff,
  ExitToApp,
  Assessment,
  Close,
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
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [endReason, setEndReason] = useState('complete');
  const silenceTimerRef = useRef(null);
  const lastSpeechTimestampRef = useRef(Date.now());


  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);

  // Add new state and refs for audio recording
  const [audioChunks, setAudioChunks] = useState([]);
  const audioRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
const [summaryProgress, setSummaryProgress] = useState(0);

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
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      startAutoRecording(mediaStream);
      startAudioRecording(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
      showMediaWarning('Camera access is required for the interview.');
    }
  };

  // const stopRecording = () => {
  //   if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
  //     mediaRecorderRef.current.stop();
  //     if (recordingStreamRef.current) {
  //       recordingStreamRef.current.getTracks().forEach(track => track.stop());
  //     }
  //   }
  // };
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }

    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      audioRecorderRef.current.stop();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const downloadRecording = () => {
    // Create and download video file
    const videoBlob = new Blob(recordedChunks, {
      type: 'video/webm;codecs=vp9,opus'
    });

    const videoUrl = URL.createObjectURL(videoBlob);
    const videoLink = document.createElement('a');
    videoLink.href = videoUrl;
    videoLink.download = 'interview-video.webm';
    document.body.appendChild(videoLink);
    videoLink.click();
    document.body.removeChild(videoLink);
    URL.revokeObjectURL(videoUrl);

    // Create and download audio file
    const audioBlob = new Blob(audioChunks, {
      type: 'audio/webm;codecs=opus'
    });

    const audioUrl = URL.createObjectURL(audioBlob);
    const audioLink = document.createElement('a');
    audioLink.href = audioUrl;
    audioLink.download = 'interview-audio.webm';
    audioLink.type = 'audio/webm';  // Set the link type explicitly
    document.body.appendChild(audioLink);
    audioLink.click();
    document.body.removeChild(audioLink);
    URL.revokeObjectURL(audioUrl);

    // Upload both files to server
    uploadRecording(videoBlob, audioBlob);
  };
  const uploadRecording = async (blob, audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('recording', blob, 'interview-recording.webm');
      formData.append('audio_recording', audioBlob, 'interview-audio.webm');
      formData.append('interview_id', localStorage.getItem('cvResponse'));

      await axios.post('http://13.127.144.141:3004/api/recordings/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error uploading recording:', error);
    }
  };
  const startAutoRecording = (mediaStream) => {
    try {
      recordingStreamRef.current = mediaStream;
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(chunks => [...chunks, event.data]);
        }
      };

      // Start recording with 1-second time slices
      mediaRecorder.start(1000);
    } catch (error) {
      console.error('Error starting recording:', error);
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
    if (!recognitionRef.current) return;

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      lastSpeechTimestampRef.current = Date.now();
      
      // Start silence detection
      silenceTimerRef.current = setInterval(() => {
        const timeSinceLastSpeech = Date.now() - lastSpeechTimestampRef.current;
        if (timeSinceLastSpeech > 5000 && transcript) { // 5 seconds
          // Process transcript and reset
          processTranscript(transcript);
          clearInterval(silenceTimerRef.current);
        }
      }, 1000);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
    };

    recognitionRef.current.onresult = async (event) => {
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

      // Update last speech timestamp whenever we get new speech input
      lastSpeechTimestampRef.current = Date.now();
      setTranscript(finalTranscript + interimTranscript);
    };

    recognitionRef.current.start();
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

  const handleEndInterview = (reason) => {
    setEndReason(reason);
    setShowEndDialog(true);
  };

  // Add this useEffect for the progress animation
useEffect(() => {
  let progressTimer;
  if (isSummaryLoading && summaryProgress < 95) {
    progressTimer = setInterval(() => {
      setSummaryProgress(prev => Math.min(prev + Math.random() * 15, 95));
    }, 1000);
  }
  return () => clearInterval(progressTimer);
}, [isSummaryLoading, summaryProgress]);

const confirmEndInterview = async () => {
  try {
    setIsSummaryLoading(true);
    setSummaryProgress(0);
    stopRecording();

    // Clean up resources
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();

    // Add initial end message
    const initialEndMessage =
      endReason === 'complete'
        ? "Thank you for completing the interview. I'm now analyzing your responses to generate a comprehensive summary..."
        : "Interview ended early. I'll still analyze the responses you provided...";

    setMessages(prev => [
      ...prev,
      {
        text: initialEndMessage,
        sender: 'AI',
        isInterruption: endReason === 'leave',
      },
    ]);

    // Show download button after recording is stopped
    if (recordedChunks.length > 0) {
      downloadRecording();
    }

    // Add loading message with periodic updates
    const loadingMessages = [
      "Analyzing your communication style...",
      "Evaluating response quality and relevance...",
      "Assessing technical knowledge demonstration...",
      "Compiling feedback and recommendations..."
    ];

    // Show loading messages sequentially
    for (let i = 0; i < loadingMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      setMessages(prev => [
        ...prev,
        {
          text: loadingMessages[i],
          sender: 'AI',
          isLoading: true,
        },
      ]);
    }

    // Make API call
    const response = await fetch(
      `http://13.127.144.141:3004/api/interviews/generate_summary_by_interview_id/?interview_id=${localStorage.getItem('cvResponse')}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('API Success:', data);
      setSummaryProgress(100);

      // Add completion message
      setMessages(prev => [
        ...prev,
        {
          text: "Summary generation complete! Redirecting you to your performance review...",
          sender: 'AI',
        },
      ]);

      // Delay the onComplete to allow the user to read the final message
      setTimeout(onComplete, 2000);
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error('Error in confirmEndInterview:', error);
    setMessages(prev => [
      ...prev,
      {
        text: "I apologize, but I encountered an error while generating your summary. Please try again or contact support if the issue persists.",
        sender: 'AI',
        isError: true,
      },
    ]);
  } finally {
    setIsSummaryLoading(false);
    setShowEndDialog(false);
  }
};
  
const LoadingMessage = ({ message }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
    <CircularProgress size={20} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

  const speedDialActions = [
    { icon: <Assessment />, name: 'Complete Interview', onClick: () => handleEndInterview('complete') },
    { icon: <ExitToApp />, name: 'Leave Interview', onClick: () => handleEndInterview('leave') }
  ];


  // Add audio recording function
  const startAudioRecording = (mediaStream) => {
    try {
      audioStreamRef.current = mediaStream;
      const audioRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioRecorderRef.current = audioRecorder;
      
      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(chunks => [...chunks, event.data]);
        }
      };

      // Start recording with 1-second time slices
      audioRecorder.start(1000);
    } catch (error) {
      console.error('Error starting audio recording:', error);
    }
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', // Subtract header height
      width: '100%',
      overflow: 'hidden', // Prevent outer scrolling
      px: 3,
      py: 2
    }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* Left Panel - Camera Feed */}
        <Grid item xs={12} md={5} sx={{ height: '100%' }}>
          <Paper 
            elevation={4} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: theme.palette.background.paper
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
                  >
                    {stream ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Camera View */}
            <Box 
              sx={{ 
                position: 'relative',
                width: '100%',
                flex: 1,
                bgcolor: 'black'
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
                  height: 100,
                  overflow: 'auto',
                  bgcolor: isRecording ? 'primary.50' : 'background.default'
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
        <Grid item xs={12} md={7} sx={{ height: '100%' }}>
          <Paper 
            elevation={4} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
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
                          : '20px 4px 20px 20px'
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
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
                <Button
                  variant="contained"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  sx={{ 
                    minWidth: 100,
                    borderRadius: 3
                  }}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <SpeedDial
        ariaLabel="End Interview Options"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon icon={<Close />} />}
        FabProps={{
          sx: {
            bgcolor: 'error.main',
            '&:hover': {
              bgcolor: 'error.dark',
            }
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

      {/* End Interview Confirmation Dialog */}
      <Dialog
        open={showEndDialog}
        onClose={() => setShowEndDialog(false)}
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          color: endReason === 'leave' ? 'error.main' : 'primary.main',
          pb: 1
        }}>
          {endReason === 'complete' ? 'Complete Interview' : 'Leave Interview'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {endReason === 'complete' 
              ? "Are you sure you want to complete the interview? You'll be able to view your performance analytics after this."
              : "Are you sure you want to leave the interview? Your progress will be saved, but the interview will end now."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => setShowEndDialog(false)}
            variant="outlined"
            color={endReason === 'leave' ? 'error' : 'primary'}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmEndInterview}
            variant="contained"
            color={endReason === 'leave' ? 'error' : 'primary'}
            autoFocus
          >
            {endReason === 'complete' ? 'Complete Interview' : 'Leave Now'}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Warning Dialog remains the same */}
      {isSummaryLoading && (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
    <LinearProgress 
      variant="determinate" 
      value={summaryProgress} 
      sx={{ 
        height: 4,
        '& .MuiLinearProgress-bar': {
          transition: 'transform 0.5s ease'
        }
      }}
    />
  </Box>
)}
    </Box>
  );
}

export default Interview;