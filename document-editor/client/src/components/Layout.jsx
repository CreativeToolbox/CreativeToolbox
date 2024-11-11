import { AppBar, Toolbar, Typography, Container, Box, IconButton } from '@mui/material';
import { Outlet } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';

// Create styled IconButton with hover animation
const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

export default function Layout() {
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Creative Toolbox
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <AnimatedIconButton color="inherit">
              <SearchIcon />
            </AnimatedIconButton>
            <AnimatedIconButton color="inherit">
              <PersonIcon />
            </AnimatedIconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}