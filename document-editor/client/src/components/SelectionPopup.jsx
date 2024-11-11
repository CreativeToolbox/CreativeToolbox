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

const SidebarPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  zIndex: 1300,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  left: 0,
  top: '80px', // Align with top of editor
  height: 'calc(100vh - 80px)', // Full height minus header
  width: '320px',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'translateX(-100%)', // Start hidden
}));

const ToggleButton = styled(Button)(({ theme }) => ({
    position: 'absolute',
    right: -32,
    top: '50%',
    transform: 'translateY(-50%)',
    minWidth: 32,
    width: 32,
    height: 64,
    padding: 0,
    borderRadius: '0 8px 8px 0',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    color: theme.palette.common.black, // This makes it always black
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
    },
    '& .MuiSvgIcon-root': {  // This ensures the icon itself is always black
      color: theme.palette.common.black,
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

export default function SelectionPopup({ selectedText, onClose, onRewrite }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [previewText, setPreviewText] = useState('');
    const [rewriteOptions, setRewriteOptions] = useState({
      tone: 'neutral',     // story tone
      style: 'narrative',  // writing style
      audience: 'general', // target audience
      pacing: 50,         // story pacing slider
      keepContext: true,   // maintain story context
    });
  
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
      setIsOpen(false);
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
          <SidebarPaper
            elevation={3}
            sx={{
              transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            }}
          >
            {/* Toggle Button */}
            <ToggleButton
              onClick={() => setIsOpen(!isOpen)}
              variant="contained"
            >
              {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </ToggleButton>
      
            {/* Main Content */}
            <Box sx={{ height: '100%', overflowY: 'auto' }}>
              {/* Text Display/Preview Area */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  width: '100%',
                  height: '300px',
                  overflowY: 'auto',
                  backgroundColor: 'grey.50',
                  borderColor: (theme) => theme.palette.grey[300],
                }}
              >
                <Typography>
                  {selectedText ? (previewText || selectedText) : 'Select text to rewrite'}
                </Typography>
              </Paper>
      
              {selectedText ? (
                <>
                  {/* Story Rewrite Options */}
                  <Box sx={{ p: 1 }}>
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
      
                    <Typography gutterBottom>Pacing</Typography>
                    <Slider
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
      
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rewriteOptions.keepContext}
                          onChange={(e) => setRewriteOptions(prev => ({
                            ...prev,
                            keepContext: e.target.checked
                          }))}
                        />
                      }
                      label="Maintain Story Context"
                    />
                  </Box>
      
                  {/* Action Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    justifyContent: 'flex-end',
                    width: '100%',
                    mt: 1
                  }}>
                    {!previewText ? (
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
                      <>
                        <ActionButton 
                          size="small" 
                          variant="outlined"
                          onClick={() => setPreviewText('')}
                          disabled={isLoading}
                          startIcon={<CloseIcon fontSize="small" />}
                          sx={{
                            borderColor: (theme) => theme.palette.grey[300],
                            color: (theme) => theme.palette.grey[700],
                          }}
                        >
                          Cancel
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
      
                  {/* Character count indicator */}
                  <Typography 
                    variant="caption" 
                    color={isValidLength ? 'textSecondary' : 'error'}
                    sx={{ mt: 2, display: 'block', textAlign: 'center' }}
                  >
                    {charCount}/{MAX_CHARS}
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                  Select text in the editor to begin
                </Typography>
              )}
            </Box>
          </SidebarPaper>
      
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