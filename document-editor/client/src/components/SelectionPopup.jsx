import { useState, useEffect } from 'react';
import { 
    Paper, 
    Button, 
    Box, 
    Fade, 
    CircularProgress, 
    Snackbar,
    Alert,
    Typography,
  } from '@mui/material';
import { styled } from '@mui/material/styles';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Constants for text length limits
const MIN_CHARS = 10;
const MAX_CHARS = 1000;

const PopupPaper = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    zIndex: 1300,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    left: theme.spacing(3), // Fixed position from left
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '280px', // Fixed width
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
    const [status, setStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [previewText, setPreviewText] = useState('');

    // Calculate character count and validity
    const charCount = selectedText?.length || 0;
    const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  
    if (!position || !selectedText) return null;
  
    const handlePreview = async () => {
        setIsLoading(true);
        setStatus(null);
        setErrorMessage('');
        
        try {
          const result = await onRewrite(selectedText, true); // true flag for preview
          setPreviewText(result);
        } catch (error) {
          console.error('Preview generation failed:', error);
          setStatus('error');
          setErrorMessage(getErrorMessage(error));
        } finally {
          setIsLoading(false);
        }
      };

      const handleRewrite = async () => {
        setIsLoading(true);
        try {
          // Pass false for isPreview to indicate this is the final rewrite
          await onRewrite(selectedText, false, previewText); // Add previewText as third parameter
          setPreviewText('');
          setStatus(null);
          onClose();
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

    const handleClose = () => {
        // Reset all states when closing
        setPreviewText('');
        setStatus(null);
        setErrorMessage('');
        setIsLoading(false);
        onClose();
      };

      // Adjust position to ensure popup stays within viewport and appears above selection
const adjustedPosition = {
    x: Math.min(Math.max(position.x, 100), window.innerWidth - 100),
    y: Math.max(position.y - 150, 60) // Move popup up by increasing the offset
  };

  
  return (
    <>
      <Fade in={!!position} timeout={300}>
        <PopupPaper
          sx={{
            top: position ? position.y : 0,
            transform: 'none', // Remove horizontal centering
            visibility: position ? 'visible' : 'hidden',
            opacity: position ? 1 : 0,
          }}
          elevation={3}
        >
          {/* Text Display/Preview Area */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 1.5,
              width: '100%',
              maxHeight: '150px',
              overflowY: 'auto',
              backgroundColor: 'grey.50',
              borderColor: (theme) => theme.palette.grey[300],
            }}
          >
            <Typography>
              {previewText || selectedText}
            </Typography>
          </Paper>
  
          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            justifyContent: 'flex-end',
            width: '100%'
          }}>
            <ActionButton 
              size="small" 
              variant="outlined"
              onClick={handleClose}
              disabled={isLoading}
              startIcon={<CloseIcon fontSize="small" />}
              sx={{
                borderColor: (theme) => theme.palette.grey[300],
                color: (theme) => theme.palette.grey[700],
              }}
            >
              Cancel
            </ActionButton>
  
            {!previewText ? (
              // Show Generate Preview button if no preview exists
              <ActionButton 
                size="small" 
                variant="contained"
                onClick={handlePreview}
                disabled={isLoading || !isValidLength}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AutoFixHighIcon fontSize="small" />
                  )
                }
                sx={{
                  backgroundColor: (theme) => theme.palette.primary.main,
                }}
              >
                {isLoading ? 'Generating...' : 'Generate Preview'}
              </ActionButton>
            ) : (
              // Show Confirm button if preview exists
              <ActionButton 
                size="small" 
                variant="contained"
                onClick={handleRewrite}
                disabled={isLoading}
                startIcon={<CheckCircleIcon fontSize="small" />}
                color="success"
              >
                Confirm Rewrite
              </ActionButton>
            )}
          </Box>
  
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
        </PopupPaper>
      </Fade>
  
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
          {errorMessage || 'Failed to generate preview. Please try again.'}
        </Alert>
      </Snackbar>
    </>
  );
  }