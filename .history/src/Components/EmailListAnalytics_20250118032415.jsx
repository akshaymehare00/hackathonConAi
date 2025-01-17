import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  IconButton
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data for demonstration
const mockCandidates = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Frontend Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Backend Developer' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Full Stack Developer' }
];

function EmailListAnalytics({ candidateData }) {
  const navigate = useNavigate();

  const handleSelectCandidate = (candidate) => {
    // Navigate to analytics with candidate data
    navigate('/analytics/details', { state: { candidate } });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pt: 2 }}>
      <Card 
        sx={{ 
          p: 3,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Candidate Applications
        </Typography>

        {mockCandidates.map((candidate, index) => (
          <Box
            key={candidate.id}
            onClick={() => handleSelectCandidate(candidate)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              mb: index !== mockCandidates.length - 1 ? 1 : 0,
              borderRadius: '8px',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: '#1976d2',
                width: 40,
                height: 40
              }}
            >
              {candidate.name.charAt(0)}
            </Avatar>

            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  fontWeight: 500,
                  color: 'text.primary'
                }}
              >
                {candidate.name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 0.5
                }}
              >
                {candidate.email}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  color: '#1976d2',
                  fontWeight: 500
                }}
              >
                {candidate.role}
              </Typography>
            </Box>

            <IconButton 
              sx={{ 
                color: '#1976d2',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        ))}
      </Card>
    </Box>
  );
}

export default EmailListAnalytics;