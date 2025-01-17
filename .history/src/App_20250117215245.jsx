import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Upload, Send, Assessment } from '@mui/icons-material';
import CVUpload from './components/CVUpload';
import Interview from './components/Interview';
import Analytics from './Components/Analytics';

function App() {
  const [step, setStep] = useState('upload');
  const [cvData, setCvData] = useState('');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7ff' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Virtual Interviewer AI
          </Typography>
          <Button
            color={step === 'upload' ? 'secondary' : 'inherit'}
            startIcon={<Upload />}
            onClick={() => setStep('upload')}
          >
            CV Upload
          </Button>
          <Button
            color={step === 'interview' ? 'secondary' : 'inherit'}
            startIcon={<Send />}
            onClick={() => setStep('interview')}
          >
            Interview
          </Button>
          <Button
            color={step === 'analytics' ? 'secondary' : 'inherit'}
            startIcon={<Assessment />}
            onClick={() => setStep('analytics')}
          >
            Analytics
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        {step === 'upload' && <CVUpload onUpload={setCvData} onComplete={() => setStep('interview')} />}
        {step === 'interview' && <Interview cvData={cvData} onComplete={() => setStep('analytics')} />}
        {step === 'analytics' && <Analytics />}
      </Container>
    </Box>
  );
}

export default App;