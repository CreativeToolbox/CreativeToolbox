import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [currentDoc, setCurrentDoc] = useState(() => {
    return location.state?.document || { title: '', content: '' };
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState(null);
  const [lastEdit, setLastEdit] = useState(null);
const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    if (!location.state?.document) {
      loadDocument();
    }
  }, [id, location.state]);

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
      if (!docData.title.trim()) {
        setSaveStatus('Title is required');
        return;
      }
      
      setSaving(true);
      setSaveStatus('Saving...');
      try {
        const response = await updateDocument(id, docData);
        setCurrentDoc(response.data);
        setSaveStatus('Saved!');
      } catch (error) {
        console.error('Error auto-saving:', error);
        setSaveStatus('Error saving!');
      } finally {
        setSaving(false);
        setTimeout(() => setSaveStatus(''), 2000);
      }
    }, 1000),
    [id]
  );

  const handleTitleChange = (event) => {
    const newTitle = event.target.value;
    if (newTitle.trim()) {
      const newDoc = { ...currentDoc, title: newTitle };
      setCurrentDoc(newDoc);
      autoSave(newDoc);
    } else {
      setCurrentDoc(prev => ({ ...prev, title: newTitle }));
    }
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
      
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate horizontal position, keeping popup within viewport bounds
      const popupWidth = 600; // Width of the popup
      const horizontalCenter = rect.left + (rect.width / 2);
      const leftPosition = Math.max(
        popupWidth / 2, // Don't let it go off screen left
        Math.min(
          horizontalCenter,
          viewportWidth - (popupWidth / 2) // Don't let it go off screen right
        )
      );

      setPopupPosition({
        x: leftPosition,
        y: rect.top, // We'll handle the vertical positioning in the popup component
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

const handleRewrite = async (text, options = {}) => {
  try {
    if (options.isPreview) {
      // Generate preview
      const rewrittenText = await rewriteText(text, options);
      return rewrittenText;
    } else {
      // Use the preview text for the final rewrite
      const finalText = options.previewText;
      
      // Store the previous state for undo
      setLastEdit({
        originalText: text,
        newText: finalText,
        position: currentDoc.content.indexOf(text)
      });
      
      // Update document with the preview text
      const newContent = currentDoc.content.replace(text, finalText);
      const updatedDoc = {
        ...currentDoc,
        content: newContent
      };
      
      setCurrentDoc(updatedDoc);

      // Trigger autosave
      if (options.triggerAutoSave) {
        try {
          setSaving(true);
          setSaveStatus('Saving...');
          await updateDocument(id, updatedDoc);
          setSaveStatus('Saved!');
          setShowUndo(true); // Show undo option
        } catch (error) {
          console.error('Autosave failed after rewrite:', error);
          setSaveStatus('Error saving!');
        } finally {
          setSaving(false);
          // Clear save status after 2 seconds
          setTimeout(() => setSaveStatus(''), 2000);
        }
      }
      
      return true;
    }
  } catch (error) {
    console.error('Rewrite failed:', error);
    throw error;
  }
};

// Add this if you don't have it already
const handleAutoSave = async (docToSave) => {
  if (!docToSave) return;
  
  try {
    setIsSaving(true);
    await saveDocument(docToSave);
    setLastSavedContent(docToSave.content);
    setSaveStatus('success');
  } catch (error) {
    console.error('Autosave failed:', error);
    setSaveStatus('error');
    throw error;
  } finally {
    setIsSaving(false);
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