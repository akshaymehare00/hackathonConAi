import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
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
import EmailListAnalytics from './Components/EmailListAnalytics';

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

function AppContent() {
  const [role, setRole] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [loginOpen, setLoginOpen] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobDescription: ''
  });

  const navigate = useNavigate();
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
    navigate(selectedRole === 'interviewer' ? '/analytics' : '/upload');
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const renderNavigation = () => {
    const navItems = role === 'interviewer' 
      ? [{ label: 'Analytics', icon: <Assessment />, path: '/analytics' }]
      : [
          { label: 'CV Upload', icon: <Upload />, path: '/upload' },
          { label: 'Interview', icon: <Send />, path: '/interview' }
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
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  handleMenuClose();
                }}
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
      <Box sx={{ display: 'flex', gap: 2, ml: 4 }}>
        {navItems.map((item) => (
          <Paper
            key={item.path}
            elevation={0}
            sx={{
              px: 2,
              py: 1,
              cursor: 'pointer',
              bgcolor: location.pathname === item.path ? 'primary.light' : 'transparent',
              color: location.pathname === item.path ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: location.pathname === item.path ? 'primary.light' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
            onClick={() => navigate(item.path)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {item.icon}
              <Typography>{item.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  return (
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
              color: 'primary.main',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
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
        <Routes>
          <Route path="/" element={<Navigate to={role ? (role === 'interviewer' ? '/analytics' : '/upload') : '/'} />} />
          <Route 
            path="/upload" 
            element={
              role === 'candidate' ? (
                <CVUpload 
                  onComplete={() => navigate('/interview')}
                  formData={formData}
                  onFormChange={handleFormChange}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/interview" 
            element={
              role === 'candidate' ? (
                <Interview 
                  onComplete={() => navigate('/analytics')}
                  candidateData={formData}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
    path="/analytics" 
    element={
      role === 'interviewer' ? (
        <EmailListAnalytics candidateData={formData} />
      ) : (
        <Navigate to="/" />
      )
    } 
  />
  <Route 
    path="/analytics/details" 
    element={
      role === 'interviewer' ? (
        <Analytics candidateData={formData} />
      ) : (
        <Navigate to="/" />
      )
    } 
  />
        </Routes>
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
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;