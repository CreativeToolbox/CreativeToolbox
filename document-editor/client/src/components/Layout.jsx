import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* <Sidebar />  */}
          <Typography variant="h6">
            Document Editor
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}