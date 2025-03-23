import { AppBar, Toolbar, Typography, Container, Box, IconButton, Menu, MenuItem, Button, InputBase, Tooltip } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTitle } from '../contexts/TitleContext';
import { Download as DownloadIcon } from '@mui/icons-material';
import { 
  getDocument, 
  getDocumentCharacters, 
  getStory, 
  getPlot, 
  getSetting, 
  getTheme 
} from '../services/api';

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const exportDocument = async (documentId) => {
  try {
    // Get all document data
    const docResponse = await getDocument(documentId);
    const charactersResponse = await getDocumentCharacters(documentId);
    const storyResponse = await getStory(documentId);
    const plotResponse = await getPlot(documentId);
    const settingResponse = await getSetting(documentId);
    const themeResponse = await getTheme(documentId);

    // Compile all data
    const exportData = {
      document: docResponse.data,
      characters: charactersResponse.data,
      story: storyResponse,
      plot: plotResponse,
      setting: settingResponse,
      theme: themeResponse,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docResponse.data.title || 'document'}_export.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting document:', error);
    // Handle error (maybe show a snackbar)
  }
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const isDocumentEditor = location.pathname.includes('/documents/');
  const { documentTitle, setDocumentTitle } = useTitle();
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(documentTitle);

  useEffect(() => {
    setEditableTitle(documentTitle);
  }, [documentTitle]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    handleClose();
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleTitleClick = (e) => {
    if (isDocumentEditor) {
      e.stopPropagation();
      setIsEditing(true);
    } else {
      navigate('/');
    }
  };

  const handleTitleChange = (e) => {
    setEditableTitle(e.target.value);
  };

  const handleTitleSubmit = async () => {
    if (editableTitle.trim()) {
      setDocumentTitle(editableTitle.trim());
    } else {
      setEditableTitle(documentTitle);
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditableTitle(documentTitle);
      setIsEditing(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flex: '1 1 auto' // Allow title container to grow
          }}>
            {isDocumentEditor && isEditing ? (
              <InputBase
                autoFocus
                value={editableTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                sx={{
                  color: 'inherit',
                  fontSize: 'h6.fontSize',
                  fontWeight: 'h6.fontWeight',
                  flex: '1 1 auto',
                  '& input': {
                    padding: 0,
                    height: '100%',
                  }
                }}
              />
            ) : (
              <Typography 
                variant="h6" 
                sx={{ 
                  cursor: isDocumentEditor ? 'text' : 'pointer',
                  flex: '1 1 auto',
                  minWidth: 0,
                  // Remove maxWidth constraint
                  overflow: 'visible',
                  whiteSpace: 'nowrap'
                }} 
                onClick={handleTitleClick}
              >
                {isDocumentEditor ? documentTitle : 'Narrativa'}
              </Typography>
            )}
          </Box>
          
          {/* Navigation Links */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center',
            flex: '0 0 auto' // Prevent navigation from growing
          }}>
            {isDocumentEditor && (
              <Tooltip title="Export Document">
                <IconButton 
                  color="inherit" 
                  size="small"
                  onClick={() => exportDocument(location.pathname.split('/')[3])}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            <Button 
              color="inherit" 
              onClick={() => navigate('/search')}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
            
            {currentUser ? (
              // Authenticated user navigation
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/dashboard')}
                >
                  My Stories
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/dashboard/documents/new')}
                >
                  New Story
                </Button>
              </>
            ) : (
              // Guest navigation
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
              >
                Sign In to Write
              </Button>
            )}

            {/* User Menu */}
            <AnimatedIconButton color="inherit" onClick={handleMenu}>
              <PersonIcon />
            </AnimatedIconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {currentUser ? (
                [
                  <MenuItem key="email" disabled>
                    {currentUser.email}
                  </MenuItem>,
                  <MenuItem key="dashboard" onClick={() => {
                    handleClose();
                    navigate('/dashboard');
                  }}>
                    Dashboard
                  </MenuItem>,
                  <MenuItem key="logout" onClick={handleLogout}>
                    Logout
                  </MenuItem>
                ]
              ) : (
                <MenuItem onClick={handleLogin}>Login</MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container 
        maxWidth={isDocumentEditor ? false : 'lg'}
        disableGutters={isDocumentEditor}
        sx={{ 
          mt: isDocumentEditor ? 0 : 4,
          height: isDocumentEditor ? 'calc(100vh - 64px)' : 'auto',
          overflow: isDocumentEditor ? 'hidden' : 'visible'
        }}
      >
        <Outlet />
      </Container>
    </>
  );
}