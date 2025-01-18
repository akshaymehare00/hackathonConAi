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
  Stack,
  Container
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

// ... keep all the existing state and functions ...

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