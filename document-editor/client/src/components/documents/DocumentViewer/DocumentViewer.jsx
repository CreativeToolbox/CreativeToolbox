import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, ContentCopy as ForkIcon } from '@mui/icons-material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import { getDocument } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3]
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
    ],
    editable: false,
    content: document?.content || '',
  });

  useEffect(() => {
    loadDocument();
  }, [id]);

  useEffect(() => {
    if (editor && document) {
      editor.commands.setContent(document.content);
    }
  }, [editor, document]);

  const loadDocument = async () => {
    try {
      const response = await getDocument(id);
      setDocument(response.data);
    } catch (err) {
      setError('Failed to load document');
      console.error('Error loading document:', err);
    }
  };

  const handleEdit = () => {
    navigate(`/dashboard/documents/${id}/edit`);
  };

  const handleFork = () => {
    navigate(`/dashboard/documents/${id}/edit?fork=true`);
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!document) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {document.title || 'Untitled'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {currentUser && (
              <>
                {currentUser.uid === document.userId ? (
                  <Tooltip title="Edit">
                    <IconButton onClick={handleEdit}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Fork">
                    <IconButton onClick={handleFork}>
                      <ForkIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Content */}
      <Paper 
        sx={{ 
          flex: 1, 
          p: 3, 
          overflow: 'auto',
          '& .ProseMirror': {
            outline: 'none',
          }
        }}
      >
        <EditorContent editor={editor} />
      </Paper>
    </Box>
  );
}