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
  const [lastEdit, setLastEdit] = useState(null);
const [showUndo, setShowUndo] = useState(false);

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
      const windowHeight = window.innerHeight;
      
      // Calculate vertical position
      const yPosition = Math.max(
        60, // Min top position
        Math.min(
          rect.top, // Align with selection top
          windowHeight - 250 // Max position accounting for popup height
        )
      );
      
      setPopupPosition({
        x: 0, // Not used for horizontal positioning anymore
        y: yPosition
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

const handleRewrite = async (text, isPreview = false, previewText = null) => {
  try {
    if (isPreview) {
      const rewrittenText = await rewriteText(text);
      return rewrittenText;
    } else {
      if (previewText) {
        // Store the previous state before making changes
        setLastEdit({
          originalText: text,
          newText: previewText,
          position: currentDoc.content.indexOf(text)
        });
        
        const newContent = currentDoc.content.replace(text, previewText);
        setCurrentDoc(prev => ({
          ...prev,
          content: newContent
        }));
        
        // Show undo option
        setShowUndo(true);
        return true;
      }
    }
  } catch (error) {
    console.error('Rewrite failed:', error);
    throw error;
  }
};

const handleUndo = () => {
  if (lastEdit) {
    const newContent = currentDoc.content.replace(lastEdit.newText, lastEdit.originalText);
    setCurrentDoc(prev => ({
      ...prev,
      content: newContent
    }));
    setLastEdit(null);
    setShowUndo(false);
  }
};

return (
  <Paper sx={{ p: 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
    <Stack spacing={2} sx={{ height: '100%' }}>
      {/* Title and Buttons */}
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
      
      {/* Editor */}
      <Box sx={{ flexGrow: 1, '& .quill': { height: '100%' } }}>
        <ReactQuill
          theme="snow"
          value={currentDoc.content}
          onChange={handleContentChange}
          style={{ height: 'calc(100% - 42px)' }}
        />
      </Box>
    </Stack>

    {/* Selection Popup */}
    <SelectionPopup 
      position={popupPosition}
      selectedText={selectedText}
      onClose={handleClosePopup}
      onRewrite={handleRewrite}
    />

    {/* Save Status Snackbar */}
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

    {/* Undo Snackbar */}
    <Snackbar
      open={showUndo}
      autoHideDuration={10000}
      onClose={() => setShowUndo(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      sx={{ bottom: { xs: 90, sm: 24 } }}
    >
      <Alert 
        severity="info"
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={handleUndo}
          >
            UNDO
          </Button>
        }
      >
        Text rewritten
      </Alert>
    </Snackbar>
  </Paper>
);
}