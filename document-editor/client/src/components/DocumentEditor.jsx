import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from './documents/DocumentEditor/Editor';
import { 
  Paper, 
  TextField, 
  Button, 
  Stack,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { getDocument, updateDocument } from '../services/api';
import SelectionPopup from './SelectionPopup';
import ToolboxSidebar from './creative-toolbox/ToolboxSidebar';
import { rewriteText } from '../services/ai';
import { auth } from '../firebase/config';
import CreativeToolbox from './creative-toolbox/CreativeToolbox';
import RightPanelManager from './panels/RightPanelManager';

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
  
  // Move all hooks to the top, before any conditional logic
  const [currentDoc, setCurrentDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState(null);
  const [lastEdit, setLastEdit] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [characterTrackingEnabled, setCharacterTrackingEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const editorRef = useRef(null);

  // Define autoSave callback before using it
  const autoSave = useCallback(
    debounce(async (docData, retryCount = 0) => {
      if (!docData.title.trim()) {
        setSaveStatus('Title is required');
        return;
      }
      
      if (retryCount >= 2) {
        setSaveStatus('Unable to save - please refresh the page');
        return;
      }
      
      try {
        setSaving(true);
        setSaveStatus('Saving...');
        const response = await updateDocument(id, docData);
        
        // Only update state if the save was successful
        if (response?.data) {
          setCurrentDoc(response.data);
          setSaveStatus('Saved!');
        }
      } catch (error) {
        console.error('Error auto-saving:', error);
        if (error.response?.status === 401) {
          if (!auth.currentUser) {
            setSaveStatus('Please log in to continue');
            navigate('/login');
          } else if (retryCount < 2) {
            setSaveStatus('Retrying save...');
            setTimeout(() => autoSave(docData, retryCount + 1), 1000);
          }
        } else {
          setSaveStatus('Error saving!');
        }
      } finally {
        setSaving(false);
        // Only clear save status if we're not retrying
        if (!saveStatus.includes('Retrying')) {
          setTimeout(() => setSaveStatus(''), 2000);
        }
      }
    }, 1000),
    [id, navigate]
  );

  const handleTitleChange = useCallback((event) => {
    const newTitle = event.target.value;
    setCurrentDoc(prev => {
      const newDoc = { ...prev, title: newTitle };
      // Only trigger autosave if title is not empty
      if (newTitle.trim()) {
        autoSave(newDoc);
      }
      return newDoc;
    });
  }, [autoSave]);

  const handleContentChange = useCallback((content) => {
    setCurrentDoc(prev => {
      const newDoc = { ...prev, content };
      autoSave(newDoc);
      return newDoc;
    });
  }, [autoSave]);

  useEffect(() => {
    if (!location.state?.document) {
      loadDocument();
    } else {
      setCurrentDoc(location.state.document);
      setCharacterTrackingEnabled(location.state.document.enableCharacterTracking);
    }
  }, [id, location.state]);

  const loadDocument = async () => {
    try {
      const response = await getDocument(id);
      setCurrentDoc(response.data);
      setCharacterTrackingEnabled(response.data.enableCharacterTracking);
    } catch (error) {
      console.error('Error loading document:', error);
      navigate('/');
    }
  };

  // Render loading state if document is not loaded
  if (!currentDoc) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '90vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

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

  const handleAIRewrite = (text, selection) => {
    setSelectedText(text);
    
    // Get the editor's DOM element
    const editorElement = editorRef.current?.options?.element;
    if (!editorElement) return;

    // Get the position of the selected text
    const rect = editorElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // Calculate popup position
    const popupWidth = 600;
    const leftPosition = Math.max(
      popupWidth / 2,
      Math.min(
        rect.left + rect.width / 2,
        viewportWidth - (popupWidth / 2)
      )
    );

    setPopupPosition({
      x: leftPosition,
      y: rect.top + 50, // Position below the toolbar
    });
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

  const highlightCharacterMentions = (content, characters) => {
    let highlightedContent = content;
    characters.forEach(char => {
      const regex = new RegExp(`\\b${char.name}\\b`, 'g');
      highlightedContent = highlightedContent.replace(
        regex,
        `<span class="character-mention" data-character-id="${char._id}">${char.name}</span>`
      );
    });
    return highlightedContent;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Document Title and Save Button */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="Document Title"
          value={currentDoc.title}
          onChange={handleTitleChange}
          sx={{ 
            '& .MuiInputBase-input': {
              fontSize: '1.5rem',
              fontWeight: 500
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ minWidth: 100 }}
        >
          {saving ? 'Saving...' : saveStatus || 'Save'}
        </Button>
      </Paper>

      {/* Main Content Area */}
      <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Left panel - Scene Manager */}
        <Grid item xs={1.8} sx={{ 
          height: '100%',
          borderRight: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{
            padding: '1rem',
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'background.default',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Scene Manager
          </Box>
          {/* Content will go here */}
        </Grid>

        {/* Main editor area - takes up 55% of the space */}
        <Grid item xs={6.6}>
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            padding: '0 1rem'
          }}>
            <Editor 
              ref={editorRef}
              onAIRewrite={handleAIRewrite}
              onChange={handleContentChange}
              content={currentDoc.content}
            />
          </Box>
        </Grid>

        {/* Right side panels */}
        <Grid item xs={3.6} sx={{ 
          height: '100%',
          borderLeft: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}>
          <RightPanelManager 
            documentId={id}
            content={currentDoc.content}
            onContentUpdate={handleContentChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}