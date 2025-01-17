import {
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart,
  TrendingUp,
  ThumbUp
} from '@mui/icons-material';

function Analytics() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Interview Analysis
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BarChartIcon color="primary" />
                <Typography variant="h6">Response Quality</Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Technical Knowledge</Typography>
                  <Typography variant="body2">85%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Communication</Typography>
                  <Typography variant="body2">92%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Problem Solving</Typography>
                  <Typography variant="body2">78%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={78} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: 'primary.50', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PieChart color="primary" />
                <Typography variant="h6">Key Strengths</Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ThumbUp color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Strong problem-solving approach" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ThumbUp color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Clear communication style" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ThumbUp color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Relevant technical expertise" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <TrendingUp color="primary" />
            <Typography variant="h6">Detailed Feedback</Typography>
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
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom>
                Recommendations:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Consider gaining more experience with [technology]" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Provide more quantitative results in project discussions" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Expand knowledge of industry best practices" />
                </ListItem>
              </List>
            </Box>
          </Box>
        </Paper>
      </Paper>
    </Box>
  );
}

export default Analytics;