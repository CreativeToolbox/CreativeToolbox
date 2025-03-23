import React, { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { getDocument, updateDocument, createDocument } from '../../../services/api';
import Editor from './Editor';
import RightPanelManager from '../../creative-toolbox/panels/RightPanelManager';
import AssistantPanel from '../../creative-toolbox/panels/AssistantPanel';
import CreativeToolbox from '../../creative-toolbox/CreativeToolbox';

const RightPanelManagerMemo = memo(RightPanelManager);

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const editorRef = useRef(null);
  
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('Untitled');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');

  const loadDocument = useCallback(async () => {
    try {
      if (!id || id === 'new' || id === 'undefined') {
        return;
      }

      console.log('Loading document:', id);
      const response = await getDocument(id);
      
      if (response?.data) {
        console.log('Document loaded:', response.data);
        setDocument(response.data);
        setTitle(response.data.title || 'Untitled');
        const documentContent = response.data.content || '';
        console.log('Setting content:', documentContent);
        setContent(documentContent);
        setLastSavedContent(documentContent);
      } else {
        console.warn('No document data received');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Failed to load document');
    }
  }, [id]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    setSaveStatus('unsaved');
  }, []);

  const rightPanelProps = useMemo(() => ({
    documentId: id,
    content,
    onContentUpdate: handleContentChange
  }), [id, content, handleContentChange]);

  const handleSave = useCallback(async () => {
    try {
      setSaveStatus('saving');
      console.log('Saving document:', { id, title, content });
      
      if (!id || id === 'new') {
        // Create new document
        const response = await createDocument({
          title,
          content,
          userId: currentUser.uid
        });
        
        if (response?.data?._id) {
          navigate(`/dashboard/documents/${response.data._id}/edit`, {
            replace: true,
            state: { document: response.data }
          });
          setDocument(response.data);
        }
      } else {
        // Update existing document
        const response = await updateDocument(id, {
          title,
          content,
        });

        if (response) {
          setLastSavedContent(content);
          console.log('Document saved successfully');
        }
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('error');
      setError('Failed to save document');
    }
  }, [id, title, content, currentUser?.uid, navigate]);

  const handleAIRewrite = async (selectedText, selection) => {
    // Implement AI rewrite functionality here
    console.log('AI Rewrite requested for:', selectedText);
  };

  // Auto-save effect
  useEffect(() => {
    if (content !== lastSavedContent && content !== '') {
      const timeoutId = setTimeout(() => {
        console.log('Auto-saving document...', { content, lastSavedContent });
        handleSave();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [content, lastSavedContent, handleSave]);

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Please sign in to edit documents.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      gap: 2,
      p: 2 
    }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleSave}
          sx={{ maxWidth: 600 }}
        />
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>
      </Box>

      <Box sx={{ 
        flex: 1, 
        minHeight: 0,
        display: 'flex',
        gap: 2
      }}>
        <Box sx={{ flex: 1 }}>
          <Editor
            ref={editorRef}
            content={content}
            onChange={handleContentChange}
            onAIRewrite={handleAIRewrite}
          />
        </Box>
        
        <RightPanelManagerMemo {...rightPanelProps} />
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={saveStatus === 'saved'}
        autoHideDuration={2000}
        onClose={() => setSaveStatus('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success">Document saved</Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentEditor; 