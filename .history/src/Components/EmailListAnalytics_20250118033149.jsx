import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  IconButton,
  Container,
  Paper,
  useTheme
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data for demonstration
const mockCandidates = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Frontend Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Backend Developer' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Full Stack Developer' }
];

export default function EmailListAnalytics({ candidateData }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSelectCandidate = (candidate) => {
    navigate('/analytics/details', { state: { candidate } });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '400%',
        bgcolor: 'grey.50',
        py: 4,
        px: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center', 
            mb: 4,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Candidate Applications
        </Typography>

        <Card
          elevation={3}
          sx={{
            borderRadius: 2,
            mx: 'auto',
            overflow: 'hidden'
          }}
        >
          {mockCandidates.map((candidate, index) => (
            <Paper
              key={candidate.id}
              elevation={0}
              onClick={() => handleSelectCandidate(candidate)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 3,
                cursor: 'pointer',
                borderBottom: index !== mockCandidates.length - 1 ? 1 : 0,
                borderColor: 'divider',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main'
                }}
              >
                {candidate.name.charAt(0)}
              </Avatar>

              <Box sx={{ ml: 2, flex: 1 }}>
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: 500,
                    color: 'text.primary',
                    fontSize: '1.1rem'
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
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                >
                  {candidate.role}
                </Typography>
              </Box>

              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectCandidate(candidate);
                }}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText'
                  }
                }}
              >
                <ArrowForward />
              </IconButton>
            </Paper>
          ))}
        </Card>
      </Container>
    </Box>
  );
}