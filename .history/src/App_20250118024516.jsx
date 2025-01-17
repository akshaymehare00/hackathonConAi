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
  TextField,
  ThemeProvider,
  createTheme
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

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2'
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    }
  }
});

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
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1 }
            }}
          >
            {navItems.map((item) => (
              <MenuItem 
                key={item.value}
                onClick={() => {
                  setStep(item.value);
                  handleMenuClose();
                }}
                selected={step === item.value}
                sx={{ py: 1.5, px: 3 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
        sx={{ ml: 4 }}
      >
        {navItems.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 48 }}>
                {item.icon}
                <span>{item.label}</span>
              </Box>
            }
            sx={{ 
              minWidth: 120,
              '&.Mui-selected': {
                color: 'secondary.main'
              }
            }}
          />
        ))}
      </Tabs>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc'
      }}>
        <AppBar 
          position="fixed" 
          color="inherit"
          sx={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                flexGrow: isMobile ? 0 : 1,
                fontWeight: 600,
                color: 'primary.main'
              }}
            >
              Virtual Interviewer AI
            </Typography>
            {role && renderNavigation()}
            {role && (
              <Box sx={{ 
                ml: 2, 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: 'primary.light',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 2
              }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {role === 'interviewer' ? 'Interviewer' : 'Candidate'}
                </Typography>
                {role === 'interviewer' ? <SupervisorAccount /> : <Person />}
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            pt: { xs: 8, sm: 9 },
            pb: 4,
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
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
          {step === 'analytics' && role === 'interviewer' && (
            <Analytics candidateData={formData} />
          )}
        </Box>

        <Dialog 
          open={loginOpen} 
          maxWidth="xs" 
          fullWidth
          PaperProps={{
            elevation: 24,
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle 
            sx={{ 
              textAlign: 'center',
              pb: 3,
              pt: 4,
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            Select Your Role
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => handleLogin('candidate')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Person sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      Candidate
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Take an interview
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => handleLogin('interviewer')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <SupervisorAccount sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      Interviewer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Review candidates
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;