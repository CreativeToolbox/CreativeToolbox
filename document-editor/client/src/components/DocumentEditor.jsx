import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Paper, 
  TextField, 
  Button, 
  Stack,
  Box,
  Snackbar, // Add this
  Alert    // Add this
} from '@mui/material';
import { getDocument, updateDocument } from '../services/api';
import SelectionPopup from './SelectionPopup';
import { rewriteText } from '../services/ai';

// Debounce helper function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentDoc, setCurrentDoc] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const response = await getDocument(id);
      setCurrentDoc(response.data);
    } catch (error) {
      console.error('Error loading document:', error);
      navigate('/');
    }
  };

  // Create memoized autoSave function
  const autoSave = useCallback(
    debounce(async (docData) => {
      setSaving(true);
      setSaveStatus('Saving...');
      try {
        await updateDocument(id, docData);
        setSaveStatus('Saved!');
      } catch (error) {
        console.error('Error auto-saving:', error);
        setSaveStatus('Error saving!');
      } finally {
        setSaving(false);
        // Clear "Saved!" message after 2 seconds
        setTimeout(() => setSaveStatus(''), 2000);
      }
    }, 1000),
    [id]
  );

  const handleTitleChange = (event) => {
    const newDoc = { ...currentDoc, title: event.target.value };
    setCurrentDoc(newDoc);
    autoSave(newDoc);
  };

  const handleContentChange = (content) => {
    const newDoc = { ...currentDoc, content };
    setCurrentDoc(newDoc);
    autoSave(newDoc);
  };

  // Manual save button (optional, since we have autosave)
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDocument(id, currentDoc);
      setSaveStatus('Saved!');
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('Error saving!');
    }
    setSaving(false);
  };
const handleTextSelection = useCallback(() => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Enhanced positioning logic
    const popupHeight = 40; // Approximate height of popup
    const margin = 15; // Margin from selection
    
    setPopupPosition({
      x: rect.left + (rect.width / 2), // Center horizontally
      y: rect.top - popupHeight - margin // Position above with margin
    });
    setSelectedText(text);
  } else {
    setPopupPosition(null);
    setSelectedText('');
  }
}, []);

 // Add selection event listeners
 useEffect(() => {
  document.addEventListener('mouseup', handleTextSelection);
  
  return () => {
    document.removeEventListener('mouseup', handleTextSelection);
  };
}, [handleTextSelection]);

const handleClosePopup = () => {
  setPopupPosition(null);
  setSelectedText('');
};

const handleRewrite = async (text) => {
  try {
    console.log('Starting rewrite process for text:', text.slice(0, 50) + '...');
    const rewrittenText = await rewriteText(text);
    
    console.log('Received rewritten text:', rewrittenText.slice(0, 50) + '...');
    
    // Update the editor content with the rewritten text
    const newContent = currentDoc.content.replace(text, rewrittenText);
    setCurrentDoc(prev => ({
      ...prev,
      content: newContent
    }));
    
    return true; // Success
  } catch (error) {
    console.error('Detailed rewrite error:', {
      name: error.name,
      type: error.type,
      message: error.message,
      originalError: error.originalError
    });

    // Handle specific error types
    let userMessage = 'Failed to rewrite text. ';
    switch (error.type) {
      case 'CONFIG_ERROR':
        userMessage += 'API configuration error. Please contact support.';
        break;
      case 'AUTH_ERROR':
        userMessage += 'Authentication failed. Please check API key.';
        break;
      case 'QUOTA_ERROR':
        userMessage += 'API quota exceeded. Please try again later.';
        break;
      case 'NETWORK_ERROR':
        userMessage += 'Network error. Please check your connection.';
        break;
      case 'INPUT_ERROR':
        userMessage += 'Invalid input. Please try selecting text again.';
        break;
      default:
        userMessage += error.message;
    }

    // You can pass this message to your UI components
    throw new Error(userMessage);
  }
};

return (
  <Paper sx={{ p: 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
    <Stack spacing={2} sx={{ height: '100%' }}>
      {/* Your existing editor content */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Title"
          value={currentDoc.title}
          onChange={handleTitleChange}
        />
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
        >
          Back
        </Button>
      </Box>
      
      <Box sx={{ flexGrow: 1, '& .quill': { height: '100%' } }}>
        <ReactQuill
          theme="snow"
          value={currentDoc.content}
          onChange={handleContentChange}
          style={{ height: 'calc(100% - 42px)' }}
        />
      </Box>
    </Stack>

    <SelectionPopup 
      position={popupPosition}
      selectedText={selectedText}
      onClose={handleClosePopup}
      onRewrite={handleRewrite}
    />

    <Snackbar 
      open={!!saveStatus} 
      autoHideDuration={2000} 
      onClose={() => setSaveStatus('')}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert severity={saveStatus === 'Error saving!' ? 'error' : 'success'}>
        {saveStatus}
      </Alert>
    </Snackbar>
  </Paper>
);
}