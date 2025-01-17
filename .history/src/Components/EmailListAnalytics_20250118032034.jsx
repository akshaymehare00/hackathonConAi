import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { Person, ArrowForward } from '@mui/icons-material';

// Mock data for demonstration - replace with your actual data
const mockCandidates = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Frontend Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Backend Developer' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Full Stack Developer' }
];

function EmailListAnalytics({ candidateData }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
  };

  if (selectedCandidate) {
    return <Analytics candidateData={selectedCandidate} onBack={() => setSelectedCandidate(null)} />;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Candidate Applications
          </Typography>
          
          <List>
            {mockCandidates.map((candidate, index) => (
              <Box key={candidate.id}>
                <ListItem
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => handleSelectCandidate(candidate)}
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  }
                  sx={{
                    '&:hover': {
                      bgcolor: 'primary.50',
                      borderRadius: 1,
                    },
                    cursor: 'pointer',
                    py: 2
                  }}
                  onClick={() => handleSelectCandidate(candidate)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={candidate.name}
                    secondary={
                      <Box>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {candidate.email}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="primary">
                          {candidate.role}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < mockCandidates.length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

// Modified Analytics component to include back button
function Analytics({ candidateData, onBack }) {
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack} sx={{ color: 'primary.main' }}>
          <ArrowForward sx={{ transform: 'rotate(180deg)' }} />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Candidate Analysis
        </Typography>
      </Box>
      {/* Rest of your existing Analytics component */}
      {/* ... */}
    </Box>
  );
}

export default EmailListAnalytics;