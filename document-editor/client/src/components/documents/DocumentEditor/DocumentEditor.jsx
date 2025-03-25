import React, { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { getDocument, updateDocument, createDocument } from '../../../services/api';
import Editor from './Editor';
import RightPanelManager from '../../creative-toolbox/panels/RightPanelManager';
import AssistantPanel from '../../creative-toolbox/panels/AssistantPanel';
import CreativeToolbox from '../../creative-toolbox/CreativeToolbox';
import SceneManager from '../SceneManager/SceneManager';
import { useTitle } from '../../../contexts/TitleContext';

const RightPanelManagerMemo = memo(RightPanelManager);

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const editorRef = useRef(null);
  const { documentTitle, setDocumentTitle } = useTitle();
  
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');

  const loadDocument = useCallback(async () => {
    try {
      if (!id || id === 'new' || id === 'undefined') {
        setDocumentTitle('New Story');
        return;
      }

      console.log('Loading document:', id);
      const response = await getDocument(id);
      
      if (response?.data) {
        console.log('Document loaded:', response.data);
        setDocument(response.data);
        setDocumentTitle(response.data.title || 'Untitled');
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
  }, [id, setDocumentTitle]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

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
      console.log('Saving document:', { id, title: documentTitle, content });
      
      if (!id || id === 'new') {
        // Create new document
        const response = await createDocument({
          title: documentTitle,
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
          title: documentTitle,
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
  }, [id, documentTitle, content, currentUser?.uid, navigate]);

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
      <Box sx={{ 
        flex: 1, 
        minHeight: 0,
        display: 'flex',
        gap: 2
      }}>
        <Box sx={{ 
<<<<<<< HEAD
          width: '15%',
          minWidth: 200,
=======
          width: '200px',
          minWidth: '200px',
>>>>>>> fb4cadb (Update document editor layout and remove sensitive data)
          display: 'flex',
          flexDirection: 'column',
        }}>
          <SceneManager documentId={id} />
        </Box>

        <Box sx={{ 
          width: '50%',
          minWidth: '500px',
          flex: '0 1 auto',
        }}>
          <Editor
            ref={editorRef}
            content={content}
            onChange={handleContentChange}
            onAIRewrite={handleAIRewrite}
          />
        </Box>
        
        <Box sx={{ 
<<<<<<< HEAD
          width: '30%',
          minWidth: 300,
=======
          width: '300px',
          minWidth: '300px',
>>>>>>> fb4cadb (Update document editor layout and remove sensitive data)
          display: 'flex',
          flexDirection: 'column',
        }}>
          <RightPanelManagerMemo {...rightPanelProps} />
        </Box>
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