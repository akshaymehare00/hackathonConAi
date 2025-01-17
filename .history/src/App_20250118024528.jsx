import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box,
  Paper,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Upload, 
  Send, 
  Assessment, 
  Menu as MenuIcon,
  Person,
  SupervisorAccount
} from '@mui/icons-material';
import CVUpload from './Components/CVUpload';
import Interview from './Components/Interview';
import Analytics from './Components/Analytics';

function App() {
  const [step, setStep] = useState('login');
  const [cvData, setCvData] = useState('');
  const [role, setRole] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [loginOpen, setLoginOpen] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobDescription: ''
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    setLoginOpen(false);
    setStep(selectedRole === 'interviewer' ? 'analytics' : 'upload');
  };

  const handleCVUpload = (data) => {
    setCvData(data);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const renderNavigation = () => {
    const navItems = role === 'interviewer' 
      ? [{ label: 'Analytics', icon: <Assessment />, value: 'analytics' }]
      : [
          { label: 'CV Upload', icon: <Upload />, value: 'upload' },
          { label: 'Interview', icon: <Send />, value: 'interview' }
        ];

    if (isMobile) {
      return (
        <>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {navItems.map((item) => (
              <MenuItem 
                key={item.value}
                onClick={() => {
                  setStep(item.value);
                  handleMenuClose();
                }}
                selected={step === item.value}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.icon}
                  <Typography>{item.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </>
      );
    }

    return (
      <Tabs 
        value={step} 
        onChange={(_, newValue) => setStep(newValue)}
        textColor="inherit"
        indicatorColor="secondary"
      >
        {navItems.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.icon}
                <span>{item.label}</span>
              </Box>
            }
          />
        ))}
      </Tabs>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7ff' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: isMobile ? 0 : 1 }}>
            Virtual Interviewer AI
          </Typography>
          {role && renderNavigation()}
          {role && (
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {role === 'interviewer' ? 'Interviewer' : 'Candidate'}
              </Typography>
              {role === 'interviewer' ? <SupervisorAccount /> : <Person />}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        {step === 'upload' && (
          <CVUpload 
            onUpload={handleCVUpload} 
            onComplete={() => setStep('interview')}
            formData={formData}
            onFormChange={handleFormChange}
          />
        )}
        {step === 'interview' && (
          <Interview 
            cvData={cvData} 
            onComplete={() => setStep('analytics')}
            candidateData={formData}
          />
        )}
        {step === 'analytics' && role === 'interviewer' && <Analytics candidateData={formData} />}
      </Container>

      <Dialog open={loginOpen} maxWidth="xs" fullWidth>
        <DialogTitle>Select Your Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'primary.light', color: 'white' },
                transition: 'all 0.2s'
              }}
              onClick={() => handleLogin('candidate')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Person fontSize="large" />
                <Typography variant="h6">Candidate</Typography>
              </Box>
            </Paper>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'primary.light', color: 'white' },
                transition: 'all 0.2s'
              }}
              onClick={() => handleLogin('interviewer')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SupervisorAccount fontSize="large" />
                <Typography variant="h6">Interviewer</Typography>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default App;