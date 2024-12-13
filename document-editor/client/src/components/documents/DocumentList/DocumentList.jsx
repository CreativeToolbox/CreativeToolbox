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
  Grid,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ForkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDocuments, createDocument, deleteDocument } from '../../../services/api';
import { Alert, Snackbar } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

export default function DocumentList({ mode = 'public' }) {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [showUndoDelete, setShowUndoDelete] = useState(false);
  const [deletedDoc, setDeletedDoc] = useState(null);
  const { currentUser } = useAuth();

  const loadDocuments = async () => {
    try {
      const response = await getDocuments(mode);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [mode]);

  const handleCreateDocument = async () => {
    try {
      const newDoc = {
        title: 'Untitled Document',
        content: ''
      };
      
      const response = await createDocument(newDoc);
      if (response.data && response.data._id) {
        const createdDoc = response.data;
        setDocuments(prev => [createdDoc, ...prev]);
        navigate(`/dashboard/documents/${createdDoc._id}/edit`, { 
          state: { document: createdDoc }
        });
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleView = (doc) => {
    navigate(`/documents/${doc._id}/view`, {
      state: { document: doc }
    });
  };

  const handleEdit = (doc) => {
    navigate(`/dashboard/documents/${doc._id}/edit`, {
      state: { document: doc }
    });
  };

  const handleFork = async (doc) => {
    try {
      const forkedDoc = {
        title: `${doc.title} (Fork)`,
        content: doc.content
      };
      
      const response = await createDocument(forkedDoc);
      if (response.data && response.data._id) {
        navigate(`/dashboard/documents/${response.data._id}/edit`, {
          state: { document: response.data }
        });
      }
    } catch (error) {
      console.error('Error forking document:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    try {
      await deleteDocument(documentToDelete._id);
      setDeletedDoc(documentToDelete);
      setDocuments(prev => prev.filter(doc => doc._id !== documentToDelete._id));
      setShowUndoDelete(true);
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setDocumentToDelete(null);
    }
  };
  
  const handleUndoDelete = async () => {
    if (!deletedDoc) return;
    
    try {
      const response = await createDocument({
        _id: deletedDoc._id,
        title: deletedDoc.title,
        content: deletedDoc.content
      });
      
      setDocuments(prev => [response.data, ...prev]);
      setDeletedDoc(null);
      setShowUndoDelete(false);
    } catch (error) {
      console.error('Error restoring document:', error);
    }
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {mode === 'private' ? 'My Stories' : 'Browse Stories'}
          </Typography>
          {mode === 'private' && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCreateDocument}
            >
              Create New Story
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {documents.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {doc.title || 'Untitled'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Last modified: {new Date(doc.updatedAt).toLocaleDateString()}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="View">
                      <IconButton onClick={() => handleView(doc)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    {currentUser && (
                      <>
                        {currentUser.uid === doc.userId && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEdit(doc)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                onClick={() => {
                                  setDocumentToDelete(doc);
                                  setDeleteConfirmOpen(true);
                                }}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Fork">
                          <IconButton onClick={() => handleFork(doc)}>
                            <ForkIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Document?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{documentToDelete?.title}"? 
            You'll have a chance to undo this action.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Undo Delete Snackbar */}
      <Snackbar
        open={showUndoDelete}
        autoHideDuration={6000}
        onClose={() => {
          setShowUndoDelete(false);
          setDeletedDoc(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity="warning"
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={handleUndoDelete}
            >
              UNDO
            </Button>
          }
        >
          Document deleted
        </Alert>
      </Snackbar>
    </>
  );
}