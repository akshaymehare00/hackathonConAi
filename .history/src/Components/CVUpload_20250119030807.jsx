import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  Stack,
  Divider,
  Alert,
  Grid,
  useTheme
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

function EnhancedCVUpload({ onUpload, onComplete }) {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    jd: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFile = async (file) => {
    setFile(file);
    const text = await file.text();
    onUpload(text);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }
  
    const formDataToSend = new FormData();
    formDataToSend.append('full_name', formData.fullName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone_number', formData.mobile);
    formDataToSend.append('cv_document', file);
    formDataToSend.append('jd', formData.jd);
  
    try {
      const response = await fetch('http://13.127.144.141:3004/api/candidates/add-candidate/', {
        method: 'POST',
        body: formDataToSend,
      });
  
      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('cvResponse', JSON.stringify(result.data));
        setShowSuccess(true);
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        const error = await response.json();
        console.error('Error:', error);
      }
    } catch (err) {
      console.error('Network Error:', err);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.grey[50],
        py: 4
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          width: '100%',
          maxWidth: 800,
          mx: 2,
          p: { xs: 2, sm: 4 },
          background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4,
            color: theme.palette.primary.main,
            textAlign: 'center',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Upload Your CV
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Job Description"
                name="jd"
                multiline
                rows={4}
                value={formData.jd}
                onChange={handleInputChange}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                border: 3,
                borderRadius: 2,
                borderStyle: 'dashed',
                borderColor: isDragging ? 'primary.main' : 'grey.300',
                bgcolor: isDragging ? 'primary.50' : 'grey.50',
                p: 4,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <IconButton 
                size="large" 
                color="primary" 
                component="label"
                sx={{ 
                  mb: 2,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  }
                }}
              >
                <input
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <CloudUpload sx={{ fontSize: 56 }} />
              </IconButton>
              <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                Drag and drop your CV here, or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: PDF, DOC, DOCX, TXT
              </Typography>
            </Box>
          </Grid>

          {file && (
            <Grid item xs={12}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: 1
                }}
              >
                <Description color="primary" />
                <Typography sx={{ flex: 1 }}>{file.name}</Typography>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={!file || !formData.fullName || !formData.email || !formData.mobile}
                sx={{ 
                  minWidth: 200,
                  height: 48,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  },
                  '&:disabled': {
                    background: theme.palette.grey[300],
                  }
                }}
              >
                Start Interview
              </Button>
            </Box>
          </Grid>
        </Grid>

        {showSuccess && (
          <Alert 
            severity="success" 
            sx={{ 
              mt: 2,
              borderRadius: 1
            }}
          >
            CV uploaded successfully! Starting interview...
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

export default EnhancedCVUpload;