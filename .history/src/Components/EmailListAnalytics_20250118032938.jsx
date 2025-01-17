import { Box, Typography, Card, Avatar, IconButton } from '@mui/material';
import { ArrowForward } from 'mui/icons-material';
import { useNavigate } from 'react-router-dom';

const mockCandidates = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Frontend Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Backend Developer' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Full Stack Developer' }
];

export default function EmailListAnalytics({ candidateData }) {
  const navigate = useNavigate();

  const handleSelectCandidate = (candidate) => {
    navigate('/analytics/details', { state: { candidate } });
  };

  return (
    <Box className="w-full min-h-screen bg-gray-50 p-6">
      <Box className="max-w-4xl mx-auto">
        <Typography 
          variant="h4" 
          className="text-center mb-6 font-semibold text-gray-800"
        >
          Candidate Applications
        </Typography>

        <Card className="w-full shadow-lg rounded-xl overflow-hidden">
          {mockCandidates.map((candidate, index) => (
            <Box
              key={candidate.id}
              onClick={() => handleSelectCandidate(candidate)}
              className={`
                flex items-center p-4 hover:bg-blue-50 cursor-pointer transition-colors
                ${index !== mockCandidates.length - 1 ? 'border-b border-gray-200' : ''}
              `}
            >
              <Avatar className="w-12 h-12 bg-blue-600">
                {candidate.name.charAt(0)}
              </Avatar>

              <Box className="flex-1 ml-4">
                <Typography className="text-lg font-medium text-gray-900">
                  {candidate.name}
                </Typography>
                <Typography className="text-sm text-gray-500">
                  {candidate.email}
                </Typography>
                <Typography className="text-sm font-medium text-blue-600 mt-1">
                  {candidate.role}
                </Typography>
              </Box>

              <IconButton 
                className="text-blue-600 hover:bg-blue-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectCandidate(candidate);
                }}
              >
                <ArrowForward />
              </IconButton>
            </Box>
          ))}
        </Card>
      </Box>
    </Box>
  );
}