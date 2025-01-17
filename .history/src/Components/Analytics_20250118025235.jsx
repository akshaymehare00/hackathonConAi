import {
    Paper,
    Typography,
    Box,
    Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Card,
    CardContent,
    Avatar,
    Divider,
    Rating,
    Chip
  } from '@mui/material';
  import {
    BarChart as BarChartIcon,
    TrendingUp,
    ThumbUp,
    Person,
    Email,
    Phone,
    Description,
    Star,
    Psychology,
    GroupWork,
    Code,
    Speed,
    Lightbulb
  } from '@mui/icons-material';
  import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend
  } from 'recharts';
  
  const performanceData = [
    { name: 'Technical', value: 85 },
    { name: 'Communication', value: 92 },
    { name: 'Problem Solving', value: 78 },
    { name: 'Leadership', value: 65 },
    { name: 'Teamwork', value: 88 }
  ];
  
  const skillsData = [
    { subject: 'React', A: 85 },
    { subject: 'Node.js', A: 75 },
    { subject: 'TypeScript', A: 90 },
    { subject: 'Database', A: 70 },
    { subject: 'Testing', A: 80 },
    { subject: 'DevOps', A: 65 }
  ];
  
  const strengths = [
    {
      title: 'Technical Expertise',
      description: 'Strong foundation in modern web technologies',
      icon: <Code color="primary" />
    },
    {
      title: 'Problem Solving',
      description: 'Analytical approach to complex challenges',
      icon: <Psychology color="primary" />
    },
    {
      title: 'Team Collaboration',
      description: 'Effective communication and teamwork',
      icon: <GroupWork color="primary" />
    }
  ];
  
  const recommendations = [
    {
      title: 'Enhance DevOps Knowledge',
      description: 'Focus on CI/CD pipelines and cloud platforms',
      icon: <Speed color="primary" />
    },
    {
      title: 'System Design Skills',
      description: 'Practice designing scalable architectures',
      icon: <Lightbulb color="primary" />
    }
  ];
  
  function Analytics({ candidateData }) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              mb: 1
            }}
          >
            Interview Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive evaluation of candidate performance and potential
          </Typography>
        </Box>
  
        <Grid container spacing={3}>
          {/* Candidate Profile */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main'
                    }}
                  >
                    <Person sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {candidateData.fullName || 'John Doe'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Senior Software Developer
                  </Typography>
                  <Rating 
                    value={4.5} 
                    readOnly 
                    precision={0.5}
                    icon={<Star fontSize="inherit" />}
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Email color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email"
                      secondary={candidateData.email || 'john.doe@example.com'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Phone"
                      secondary={candidateData.phone || '+1 234 567 890'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Description color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Experience"
                      secondary="5+ years"
                    />
                  </ListItem>
                </List>
  
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Key Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'].map((skill) => (
                      <Chip 
                        key={skill} 
                        label={skill} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Performance Metrics */}
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Performance Overview
                </Typography>
                <Box sx={{ height: 300, mb: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Technical Skills Assessment
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillsData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Skills" dataKey="A" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Strengths */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Key Strengths
                </Typography>
                <Grid container spacing={2}>
                  {strengths.map((strength, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'primary.50',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2
                        }}
                      >
                        {strength.icon}
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {strength.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {strength.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Recommendations */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Recommendations
                </Typography>
                <Grid container spacing={2}>
                  {recommendations.map((rec, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'error.50',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2
                        }}
                      >
                        {rec.icon}
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {rec.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {rec.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Detailed Assessment */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Detailed Assessment
                </Typography>
                <Typography paragraph>
                  The candidate demonstrated exceptional technical proficiency, particularly in modern web development technologies.
                  Their problem-solving approach was methodical and efficient, showing strong analytical capabilities.
                </Typography>
                <Typography paragraph>
                  Communication skills were outstanding, with clear articulation of complex technical concepts and past experiences.
                  The candidate showed good understanding of system design principles and best practices.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Interview Highlights
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <ThumbUp color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Strong technical background in full-stack development"
                        secondary="Demonstrated through detailed discussion of previous projects"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ThumbUp color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Excellent problem-solving capabilities"
                        secondary="Showcased through technical challenge solutions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ThumbUp color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Good understanding of software architecture"
                        secondary="Demonstrated knowledge of scalable system design"
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }
  
  export default Analytics;