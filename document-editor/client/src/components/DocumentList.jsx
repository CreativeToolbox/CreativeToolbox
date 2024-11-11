import { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { getDocuments, createDocument, deleteDocument } from '../services/api';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [isApiSleeping, setIsApiSleeping] = useState(false);
  const navigate = useNavigate();

  const isApiInactiveError = (error) => {
    return (
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('NetworkError') ||
      error?.response?.status === 503 ||
      error?.response?.status === 504
    );
  };

  const loadDocuments = async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.data);
      setIsApiSleeping(false); // Reset if successful
    } catch (error) {
      console.error('Error loading documents:', error);
      if (isApiInactiveError(error)) {
        setIsApiSleeping(true);
      }
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreateDocument = async () => {
    try {
      const response = await createDocument({
        title: 'Untitled Document',
        content: ''
      });
      if (response.data && response.data._id) {
        setDocuments(prev => [response.data, ...prev]);
        navigate(`/documents/${response.data._id}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      if (isApiInactiveError(error)) {
        setIsApiSleeping(true);
      }
    }
  };

  const handleDeleteDocument = async (id, event) => {
    event.stopPropagation();
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      if (isApiInactiveError(error)) {
        setIsApiSleeping(true);
      }
    }
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          My Documents
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateDocument}
          sx={{ mb: 2 }}
        >
          Create New Document
        </Button>
        <List>
          {documents.map((doc) => (
            <ListItem 
              key={doc._id}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ListItemText 
                primary={doc.title} 
                secondary={new Date(doc.updatedAt).toLocaleDateString()}
                onClick={() => navigate(`/documents/${doc._id}`)}
                sx={{ cursor: 'pointer' }}
              />
              <IconButton 
                edge="end" 
                aria-label="delete"
                onClick={(e) => handleDeleteDocument(doc._id, e)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* API Wake Up Dialog */}
      <Dialog
        open={isApiSleeping}
        onClose={() => setIsApiSleeping(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Waking up the server...
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            py: 2 
          }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography>
              The server is starting up after being inactive. 
              This may take about 30 seconds.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              The page will refresh automatically once the server is ready.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsApiSleeping(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setIsApiSleeping(false);
              loadDocuments(); // Retry loading documents
            }}
            variant="contained"
          >
            Retry Now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}