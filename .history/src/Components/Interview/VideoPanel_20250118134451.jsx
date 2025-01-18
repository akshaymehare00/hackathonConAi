import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';

function VideoPanel({
  videoRef,
  stream,
  isRecording,
  transcript,
  isMuted,
  setIsMuted,
  startCamera,
  startRecording,
  speakText
}) {
  return (
    <Paper elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Interview Session
        </Typography>
        <Tooltip title={stream ? "Disable Camera" : "Enable Camera"}>
          <IconButton color={stream ? "primary" : "default"} onClick={startCamera}>
            {stream ? <Videocam /> : <VideocamOff />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Video Feed */}
      <Box sx={{ position: 'relative', width: '100%', flex: 1, bgcolor: 'black' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Controls Overlay */}
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          display: 'flex',
          justifyContent: 'center',
          gap: 2
        }}>
          <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
            <IconButton
              color={isRecording ? 'error' : 'primary'}
              onClick={startRecording}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            >
              <Mic />
            </IconButton>
          </Tooltip>
          <Tooltip title={isMuted ? "Unmute" : "Mute"}>
            <IconButton
              color="primary"
              onClick={() => {
                setIsMuted(!isMuted);
                if (!isMuted) window.speechSynthesis.cancel();
              }}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            >
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Transcription */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
          Live Transcription
        </Typography>
        <Paper variant="outlined" sx={{ 
          p: 2,
          height: 100,
          overflow: 'auto',
          bgcolor: isRecording ? 'primary.50' : 'background.default'
        }}>
          <Typography variant="body2" sx={{ 
            fontFamily: 'monospace',
            color: isRecording ? 'primary.main' : 'text.secondary'
          }}>
            {transcript || 'Start speaking to see transcription...'}
          </Typography>
        </Paper>
      </Box>
    </Paper>
  );
}

export default VideoPanel;