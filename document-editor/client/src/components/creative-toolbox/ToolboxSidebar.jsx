import { useState } from 'react';
import { 
  Paper, 
  IconButton, 
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CharacterList from './CharacterList';
import CreativeToolbox from './CreativeToolbox';

export default function ToolboxSidebar({ documentId, enabled = true, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const SIDEBAR_WIDTH = '65%';
  const APPBAR_HEIGHT = 64;

  const handleToggle = (newState) => {
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        right: 0,
        top: APPBAR_HEIGHT,
        height: `calc(100vh - ${APPBAR_HEIGHT}px)`,
        width: SIDEBAR_WIDTH,
        display: 'flex',
        transition: 'transform 0.3s ease',
        transform: isOpen ? 'translateX(0)' : `translateX(calc(${SIDEBAR_WIDTH} - 32px))`,
        borderRadius: '8px 0 0 8px',
        overflow: 'hidden',
        zIndex: 1100,
      }}
      elevation={3}
    >
      <IconButton
        onClick={() => handleToggle(!isOpen)}
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 32,
          height: 64,
          borderRadius: '8px 0 0 8px',
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          zIndex: 1,
        }}
      >
        {isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        ml: 4,
        p: 2,
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}>
        <Typography variant="h6" gutterBottom>
          Creative Toolbox
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <CreativeToolbox documentId={documentId} />
      </Box>
    </Paper>
  );
} 