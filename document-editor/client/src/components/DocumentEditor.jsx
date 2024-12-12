import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from './Editor';
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
import ToolboxSidebar from './creative-toolbox/ToolboxSidebar';
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

  // Add state for character tracking
  const [characterTrackingEnabled, setCharacterTrackingEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Add this to track sidebar state

  const editorRef = useRef(null);

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
    <Box sx={{ 
      display: 'flex',
      height: '90vh',
      width: '100%',
      position: 'relative',
      px: 0,
      overflow: 'hidden'
    }}>
      <Paper sx={{ 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.3s ease, margin-right 0.3s ease',
        width: sidebarOpen ? '30%' : '75%',
        p: 0,
        borderRadius: 0,
        ml: 3,
        mr: sidebarOpen ? 6 : 2,
        borderRight: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        overflow: 'hidden',
        '& .ql-container': {
          pl: 1,
          pr: 1
        }
      }}>
        <Box 
          sx={{ 
            p: 2,
            pl: 4,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            '& .MuiTextField-root': {
              bgcolor: 'background.default',
              borderRadius: 1,
            },
            '& .MuiButton-root': {
              borderRadius: 1,
              px: 3,
            }
          }}
        >
          <TextField
            fullWidth
            label="Title"
            value={currentDoc.title}
            onChange={handleTitleChange}
            size="small"
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
        
        <Box sx={{ 
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          pl: 4,
        }}>
          <Box sx={{ 
            height: '100%',
            '& .quill': { 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '& .ql-container': {
                flexGrow: 1,
                overflow: 'auto'
              }
            } 
          }}>
            <Editor
              ref={editorRef}
              value={currentDoc.content}
              onChange={handleContentChange}
              onAIRewrite={handleAIRewrite}
              style={{ height: '100%' }}
            />
          </Box>
        </Box>

        {/* Selection Popup */}
        <SelectionPopup 
          position={popupPosition}
          selectedText={selectedText}
          onClose={() => {
            setPopupPosition(null);
            setSelectedText('');
          }}
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

      <ToolboxSidebar 
        documentId={id}
        enabled={characterTrackingEnabled}
        onToggle={(isOpen) => setSidebarOpen(isOpen)}
      />
    </Box>
  );
}