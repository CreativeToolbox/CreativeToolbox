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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Constants for text length limits
const MIN_CHARS = 10;
const MAX_CHARS = 1000;

const PopupPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  zIndex: 1300,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '600px',
  maxHeight: '400px',
  overflowY: 'auto',
  boxShadow: theme.shadows[8],
  borderRadius: theme.shape.borderRadius * 2,
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

export default function SelectionPopup({ position, selectedText, onClose, onRewrite }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [rewriteOptions, setRewriteOptions] = useState({
    tone: 'neutral',
    style: 'narrative',
    audience: 'general',
    pacing: 50,
    keepContext: true,
  });

  const getPopupPosition = () => {
    if (!position) return {};
    
    const MARGIN = 20;
    const popupHeight = 400;
    
    // Check if there's enough space above
    const spaceAbove = position.y;
    const showAbove = spaceAbove > (popupHeight + MARGIN);
    
    return {
      top: showAbove 
        ? `${position.y - MARGIN - popupHeight}px` // Position above
        : `${position.y + MARGIN}px`, // Position below
      left: '50%',
      transform: 'translateX(-50%)',
    };
  };

  // Calculate character count and validity
  const charCount = selectedText?.length || 0;
  const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  
  // Auto-update preview when text selection changes
  // useEffect(() => {
  //   if (selectedText && isOpen && isValidLength) {
  //     handlePreview();
  //   } else {
  //     setPreviewText('');
  //   }
  // }, [selectedText, isOpen]);
  
  // Error message helper
  const getErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
  
    switch (error.type) {
      case 'LENGTH_ERROR':
        return error.message;
      case 'RATE_LIMIT_ERROR':
        return error.message;
      case 'SAFETY_ERROR':
        return 'This content cannot be processed. Please ensure the text is appropriate and try again.';
      case 'INPUT_ERROR':
        return 'Please select valid text to rewrite.';
      case 'API_ERROR':
        return 'API service error. Please try again later.';
      default:
        return error.message || 'Failed to rewrite text. Please try again.';
    }
  };
  
  const handleClose = () => {
    setPreviewText('');
    setStatus(null);
    setErrorMessage('');
    setIsLoading(false);
    onClose();
  };
  
  const handlePreview = async () => {
    setIsLoading(true);
    setStatus(null);
    setErrorMessage('');
    
    try {
      const result = await onRewrite(selectedText, {
        ...rewriteOptions,
        isPreview: true
      });
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
      await onRewrite(selectedText, {
        ...rewriteOptions,
        isPreview: false,
        previewText: previewText,
        triggerAutoSave: true
      });
      setPreviewText('');
      setStatus(null);
      handleClose();
    } catch (error) {
      console.error('Rewrite failed:', error);
      setStatus('error');
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      {position && (
        <Fade in={Boolean(position)}>
          <PopupPaper
            elevation={3}
            sx={{
              ...getPopupPosition(),
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Left side - Controls */}
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel>Tone</InputLabel>
                  <Select
                    value={rewriteOptions.tone}
                    onChange={(e) => setRewriteOptions(prev => ({
                      ...prev,
                      tone: e.target.value
                    }))}
                  >
                    <MenuItem value="whimsical">Whimsical</MenuItem>
                    <MenuItem value="serious">Serious</MenuItem>
                    <MenuItem value="mysterious">Mysterious</MenuItem>
                    <MenuItem value="humorous">Humorous</MenuItem>
                    <MenuItem value="dramatic">Dramatic</MenuItem>
                    <MenuItem value="adventurous">Adventurous</MenuItem>
                    <MenuItem value="neutral">Neutral</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel>Writing Style</InputLabel>
                  <Select
                    value={rewriteOptions.style}
                    onChange={(e) => setRewriteOptions(prev => ({
                      ...prev,
                      style: e.target.value
                    }))}
                  >
                    <MenuItem value="narrative">Narrative</MenuItem>
                    <MenuItem value="descriptive">Descriptive</MenuItem>
                    <MenuItem value="dialogue-heavy">Dialogue-Heavy</MenuItem>
                    <MenuItem value="action-focused">Action-Focused</MenuItem>
                    <MenuItem value="emotional">Emotional</MenuItem>
                    <MenuItem value="minimalist">Minimalist</MenuItem>
                    <MenuItem value="poetic">Poetic</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    value={rewriteOptions.audience}
                    onChange={(e) => setRewriteOptions(prev => ({
                      ...prev,
                      audience: e.target.value
                    }))}
                  >
                    <MenuItem value="children">Children</MenuItem>
                    <MenuItem value="young-adult">Young Adult</MenuItem>
                    <MenuItem value="adult">Adult</MenuItem>
                    <MenuItem value="general">General</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ 
                  mb: 1, 
                  maxWidth: '200px',
                  margin: '0 auto',
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" gutterBottom>Pacing</Typography>
                  <Slider
                    size="small"
                    value={rewriteOptions.pacing}
                    onChange={(e, newValue) => setRewriteOptions(prev => ({
                      ...prev,
                      pacing: newValue
                    }))}
                    marks={[
                      { value: 0, label: 'Slower' },
                      { value: 50, label: 'Balanced' },
                      { value: 100, label: 'Faster' }
                    ]}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={rewriteOptions.keepContext}
                      onChange={(e) => setRewriteOptions(prev => ({
                        ...prev,
                        keepContext: e.target.checked
                      }))}
                    />
                  }
                  label={<Typography variant="body2">Maintain Story Context</Typography>}
                />
              </Box>

              {/* Right side - Preview */}
              <Box sx={{ flex: 1 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    height: '100%',
                    backgroundColor: 'grey.50',
                    borderColor: (theme) => theme.palette.grey[300],
                  }}
                >
                  <Typography>
                    {selectedText ? (previewText || selectedText) : 'Select text to rewrite'}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            {/* Bottom - Action Buttons and Character Count */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1
            }}>
              <Typography 
                variant="caption" 
                color={isValidLength ? 'textSecondary' : 'error'}
              >
                {charCount}/{MAX_CHARS}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <ActionButton 
                  size="small" 
                  variant="outlined"
                  onClick={handleClose}
                  startIcon={<CloseIcon fontSize="small" />}
                  sx={{
                    borderColor: (theme) => theme.palette.grey[300],
                    color: (theme) => theme.palette.grey[700],
                  }}
                >
                  Cancel
                </ActionButton>

                {!previewText ? (
                  <ActionButton 
                    size="small" 
                    variant="contained"
                    onClick={handlePreview}
                    disabled={isLoading || !isValidLength}
                    startIcon={isLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <AutoFixHighIcon fontSize="small" />
                    )}
                  >
                    {isLoading ? 'Generating...' : 'Generate Preview'}
                  </ActionButton>
                ) : (
                  <>
                    <ActionButton 
                      size="small" 
                      variant="outlined"
                      onClick={() => setPreviewText('')}
                      disabled={isLoading}
                      startIcon={<CloseIcon fontSize="small" />}
                    >
                      Reset
                    </ActionButton>
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
                  </>
                )}
              </Box>
            </Box>
          </PopupPaper>
        </Fade>
      )}
      
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