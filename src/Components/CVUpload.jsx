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
  ListItemText
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

function CVUpload({ onUpload, onComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);

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

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upload Your CV
        </Typography>
        
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
        </Box>

        {file && (
          <Box sx={{ mt: 3 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onComplete}
                  >
                    Start Interview
                  </Button>
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default CVUpload;