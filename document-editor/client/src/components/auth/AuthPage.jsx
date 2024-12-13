import { useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import Login from './Login';
import Signup from './Signup';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Typography>
        
        {isLogin ? <Login /> : <Signup />}
        
        <Button
          fullWidth
          onClick={() => setIsLogin(!isLogin)}
          sx={{ mt: 2 }}
        >
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
        </Button>
      </Box>
    </Container>
  );
}