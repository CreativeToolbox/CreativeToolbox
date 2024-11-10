import { useState, useEffect } from 'react';
import { 
  Paper, 
  Button, 
  Box, 
  Fade, 
  CircularProgress, 
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Constants for text length limits
const MIN_CHARS = 10;
const MAX_CHARS = 1000;

const PopupPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  zIndex: 1300,
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  gap: theme.spacing(1),
  transform: 'translateX(-50%)',
  '&:before': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: 16,
    height: 16,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    zIndex: -1
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(0.5, 2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[2]
  }
}));

export default function SelectionPopup({ 
    position, 
    selectedText, 
    onClose,
    onRewrite 
  }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error', or null
    const [errorMessage, setErrorMessage] = useState('');
    const [apiStatus, setApiStatus] = useState('unknown'); // 'available', 'unavailable', 'unknown'

    // Calculate character count and validity
    const charCount = selectedText?.length || 0;
    const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  
    if (!position || !selectedText) return null;
  
    const handleRewrite = async () => {
      if (!isValidLength) {
        setStatus('error');
        setErrorMessage(`Text must be between ${MIN_CHARS} and ${MAX_CHARS} characters.`);
        return;
      }

      setIsLoading(true);
      setStatus(null);
      setErrorMessage('');
      
      try {
        await onRewrite(selectedText);
        setStatus('success');
        // Auto close after success
        setTimeout(() => {
          onClose();
          setStatus(null);
        }, 1500);
      } catch (error) {
        console.error('Rewrite failed:', error);
        setStatus('error');
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };
  
    // Error message helper
    const getErrorMessage = (error) => {
      if (!error) return 'An unknown error occurred';

      switch (error.type) {
        case 'LENGTH_ERROR':
          return error.message;
        case 'RATE_LIMIT_ERROR':
          return error.message;
        case 'INPUT_ERROR':
          return 'Please select valid text to rewrite.';
        case 'API_ERROR':
          return 'API service error. Please try again later.';
        default:
          return error.message || 'Failed to rewrite text. Please try again.';
      }
    };

    // Adjust position to ensure popup stays within viewport
    const adjustedPosition = {
      x: Math.min(Math.max(position.x, 100), window.innerWidth - 100),
      y: Math.max(position.y - 10, 60)
    };
  
    return (
      <>
        <Fade in={!!position} timeout={200}>
          <PopupPaper
            sx={{
              left: adjustedPosition.x,
              top: adjustedPosition.y,
            }}
            elevation={3}
          >
            <ActionButton 
              size="small" 
              variant="contained"
              color={status === 'error' ? 'error' : 'primary'}
              onClick={handleRewrite}
              disabled={isLoading || status === 'success' || !isValidLength}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : status === 'success' ? (
                  <CheckCircleIcon fontSize="small" />
                ) : status === 'error' ? (
                  <ErrorIcon fontSize="small" />
                ) : (
                  <AutoFixHighIcon fontSize="small" />
                )
              }
              sx={{
                backgroundColor: (theme) => 
                  status === 'success' 
                    ? theme.palette.success.main 
                    : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: (theme) => 
                    status === 'success' 
                      ? theme.palette.success.dark 
                      : theme.palette.primary.dark,
                },
                minWidth: '100px',
              }}
            >
              {isLoading ? 'Magic...' : 
               status === 'success' ? 'Done!' :
               status === 'error' ? 'Retry' : 
               'Rewrite'}
            </ActionButton>
            <ActionButton 
              size="small" 
              variant="outlined"
              onClick={onClose}
              disabled={isLoading}
              startIcon={<CloseIcon fontSize="small" />}
              sx={{
                borderColor: (theme) => theme.palette.grey[300],
                color: (theme) => theme.palette.grey[700],
                '&:hover': {
                  borderColor: (theme) => theme.palette.grey[400],
                  backgroundColor: (theme) => theme.palette.grey[50],
                }
              }}
            >
              {status === 'error' ? 'Dismiss' : 'Cancel'}
            </ActionButton>

            {/* Character count indicator */}
            <Typography 
              variant="caption" 
              color={isValidLength ? 'textSecondary' : 'error'}
              sx={{ 
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '0 4px',
                borderRadius: 1
              }}
            >
              {charCount}/{MAX_CHARS}
            </Typography>

            {/* API Status indicator */}
            {apiStatus === 'unavailable' && (
              <Typography 
                variant="caption" 
                color="error"
                sx={{ 
                  position: 'absolute',
                  top: -20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  padding: '0 4px',
                  borderRadius: 1
                }}
              >
                API service unavailable
              </Typography>
            )}
          </PopupPaper>
        </Fade>
  
        {/* Success Snackbar */}
        <Snackbar
          open={status === 'success'}
          autoHideDuration={2000}
          onClose={() => setStatus(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Text successfully rewritten!
          </Alert>
        </Snackbar>
  
        {/* Error Snackbar */}
        <Snackbar
          open={status === 'error'}
          autoHideDuration={6000}
          onClose={() => {
            setStatus(null);
            setErrorMessage('');
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%',
              '& .MuiAlert-message': {
                maxWidth: '300px',
                wordBreak: 'break-word'
              }
            }}
          >
            {errorMessage || 'Failed to rewrite text. Please try again.'}
          </Alert>
        </Snackbar>
      </>
    );
  }