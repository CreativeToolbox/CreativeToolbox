import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Creative Toolbox
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}