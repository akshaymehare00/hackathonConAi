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
    Divider,
    Card,
    CardContent,
    Avatar
  } from '@mui/material';
  import {
    BarChart as BarChartIcon,
    PieChart,
    TrendingUp,
    ThumbUp,
    Person,
    Email,
    Phone,
    Description
  } from '@mui/icons-material';
  
  function Analytics({ candidateData }) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          Interview Analysis
        </Typography>
  
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    <Person sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {candidateData.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Candidate Profile
                    </Typography>
                  </Box>
                </Box>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Email color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email"
                      secondary={candidateData.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Phone"
                      secondary={candidateData.phone}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Description color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Position"
                      secondary="Software Developer"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
  
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <BarChartIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Performance Metrics
                  </Typography>
                </Box>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Technical Knowledge
                        </Typography>
                        <Typography variant="subtitle1" color="primary">
                          85%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={85} 
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.100',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Communication
                        </Typography>
                        <Typography variant="subtitle1" color="primary">
                          92%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={92} 
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.100',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Problem Solving
                        </Typography>
                        <Typography variant="subtitle1" color="primary">
                          78%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={78} 
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.100',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ bgcolor: 'primary.50', p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Key Strengths
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <ThumbUp color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Strong problem-solving approach"
                            sx={{ 
                              '& .MuiListItemText-primary': { 
                                fontWeight: 500 
                              }
                            }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <ThumbUp color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Clear communication style"
                            sx={{ 
                              '& .MuiListItemText-primary': { 
                                fontWeight: 500 
                              }
                            }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <ThumbUp color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Relevant technical expertise"
                            sx={{ 
                              '& .MuiListItemText-primary': { 
                                fontWeight: 500 
                              }
                            }}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
  
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <TrendingUp color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Detailed Assessment
                  </Typography>
                </Box>
                <Box sx={{ color: 'text.secondary' }}>
                  <Typography paragraph>
                    The candidate demonstrated strong technical knowledge in their field, particularly in
                    [specific areas]. Their communication skills were excellent, with clear and concise
                    responses to complex questions.
                  </Typography>
                  <Typography paragraph>
                    Areas for improvement include deeper knowledge of [specific technology] and more
                    concrete examples of project outcomes.
                  </Typography>
                  <Box sx={{ mt: 4 }}>
                    <Typography 
                      variant="subtitle1" 
                      color="text.primary" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      Recommendations:
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUp color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Consider gaining more experience with [technology]"
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontWeight: 500 
                            }
                          }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUp color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Provide more quantitative results in project discussions"
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontWeight: 500 
                            }
                          }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUp color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Expand knowledge of industry best practices"
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontWeight: 500 
                            }
                          }}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }
  
  export default Analytics;