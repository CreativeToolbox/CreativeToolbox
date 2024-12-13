import { AppBar, Toolbar, Typography, Container, Box, IconButton, Menu, MenuItem, Button } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const isDocumentEditor = location.pathname.includes('/documents/');

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

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo/Home */}
          <Typography 
            variant="h6" 
            sx={{ cursor: 'pointer' }} 
            onClick={() => navigate('/')}
          >
            Narrativa
          </Typography>
          
          {/* Navigation Links */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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