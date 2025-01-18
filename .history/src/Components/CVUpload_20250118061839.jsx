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
  Grid
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

function EnhancedCVUpload({ onUpload, onComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    jd:''
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
    // Read file content and pass it to parent component
    const text = await file.text();
    onUpload(text);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    // Log form data and file information
    console.log('Form Data:', {
      ...formData,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    setShowSuccess(true);
    
    // Use timeout to show success message before navigation
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 4 }}>
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
              />
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                variant="outlined"
                required
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
                transition: 'all 0.2s ease',
                cursor: 'pointer'
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
                sx={{ mb: 2 }}
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
              <Typography variant="h6" sx={{ mb: 1 }}>
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
                  gap: 2
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
                  height: 48
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
            sx={{ mt: 2 }}
          >
            CV uploaded successfully! Starting interview...
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

export default EnhancedCVUpload;