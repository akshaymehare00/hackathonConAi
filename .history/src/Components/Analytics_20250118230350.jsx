import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Avatar, Box, CircularProgress, Grid, Paper, Typography } from '@mui/material';

const Analytics = () => {
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://13.127.144.141:3004/api/interviews/get-interview_by_id/?interview_id=${localStorage.getItem('cvResponse')}`
        );
        setInterviewData(response.data.data.Interview);
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
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!interviewData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography color="textSecondary" variant="h6">
          No interview data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="lg" mx="auto" p={4}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Interview Analysis
        </Typography>
        <Typography color="textSecondary">
          Comprehensive evaluation of interview performance
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Candidate Profile */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box textAlign="center" mb={4}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 96,
                  height: 96,
                  fontSize: '2rem',
                  margin: '0 auto',
                }}
              >
                {interviewData?.candidate?.full_name?.charAt(0)}
              </Avatar>
              <Typography variant="h6" fontWeight="bold" mt={2}>
                {interviewData.candidate.full_name}
              </Typography>
              <Typography color="textSecondary">Candidate</Typography>
            </Box>

            <Box>
              <Box mb={2}>
                <Typography color="textSecondary" variant="body2">
                  Email
                </Typography>
                <Typography fontWeight="medium">
                  {interviewData.candidate.email}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography color="textSecondary" variant="body2">
                  Phone
                </Typography>
                <Typography fontWeight="medium">
                  {interviewData.candidate.phone_number}
                </Typography>
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Interview Date
                </Typography>
                <Typography fontWeight="medium">
                  {new Date(interviewData.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Interview Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Job Description
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {interviewData.jd}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
