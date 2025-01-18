import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Work as WorkIcon
} from '@mui/icons-material';

const Analytics = () => {
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://13.127.144.141:3004/api/interviews/get-interview_by_id/?interview_id=${localStorage.getItem('cvResponse')}`
        );
        const data = await response.json();
        setInterviewData(data.data.Interview);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch interview data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="90vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Card
          elevation={3}
          sx={{
            textAlign: 'center',
            p: 4,
            mt: 8,
            backgroundColor: theme.palette.error.light
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography color="textSecondary">
            Please try again later
          </Typography>
        </Card>
      </Container>
    );
  }

  if (!interviewData) {
    return (
      <Container maxWidth="sm">
        <Card elevation={3} sx={{ textAlign: 'center', p: 4, mt: 8 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No interview data available
          </Typography>
          <Typography color="textSecondary">
            Please check back later
          </Typography>
        </Card>
      </Container>
    );
  }

  const { candidate, jd, created_at } = interviewData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Interview Analysis
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Comprehensive evaluation of interview performance
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Candidate Profile */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={3}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '3rem',
                  mb: 2,
                  boxShadow: theme.shadows[4],
                }}
              >
                {candidate?.full_name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {candidate.full_name}
              </Typography>
              <Chip
                label="Candidate"
                color="primary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ '& > div': { mb: 2.5 } }}>
              <Box display="flex" alignItems="center" gap={2}>
                <EmailIcon color="action" />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Email
                  </Typography>
                  <Typography>{candidate.email}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <PhoneIcon color="action" />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography>{candidate.phone_number}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <EventIcon color="action" />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Interview Date
                  </Typography>
                  <Typography>
                    {new Date(created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Job Description */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <WorkIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h5" fontWeight="bold">
                Job Description
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
              }}
            >
              {jd}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;