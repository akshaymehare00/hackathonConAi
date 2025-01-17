import { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Grid,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { CloudUpload, Description, ArrowForward } from '@mui/icons-material';

const steps = ['Personal Information', 'Upload CV', 'Job Details'];

function CVUpload({ onUpload, onComplete, formData, onFormChange }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

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

  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    } else if (activeStep === 1) {
      if (!file) newErrors.file = 'CV is required';
    } else if (activeStep === 2) {
      if (!formData.jobDescription) newErrors.jobDescription = 'Job description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        // Log all form data when reaching the final step
        console.log('Form Data:', {
          ...formData,
          cvFile: {
            name: file?.name,
            size: file?.size,
            type: file?.type
          }
        });
        onComplete();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Rest of the component remains the same...
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={onFormChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={onFormChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={onFormChange}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box
            sx={{
              border: 2,
              borderRadius: 2,
              borderStyle: 'dashed',
              borderColor: isDragging ? 'primary.main' : 'grey.300',
              bgcolor: isDragging ? 'primary.50' : 'background.paper',
              p: 4,
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <IconButton size="large" color="primary" component="label">
              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <CloudUpload sx={{ fontSize: 48, mb: 2 }} />
            </IconButton>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Drag and drop your CV here, or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: PDF, DOC, DOCX, TXT
            </Typography>
            {errors.file && (
              <Typography color="error" sx={{ mt: 2 }}>
                {errors.file}
              </Typography>
            )}
          </Box>
        );
      case 2:
        return (
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Job Description"
            name="jobDescription"
            value={formData.jobDescription}
            onChange={onFormChange}
            error={!!errors.jobDescription}
            helperText={errors.jobDescription}
            required
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Application Details
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        {file && activeStep === 1 && (
          <Box sx={{ mt: 3 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            endIcon={activeStep === steps.length - 1 ? null : <ArrowForward />}
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'Start Interview' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default CVUpload;