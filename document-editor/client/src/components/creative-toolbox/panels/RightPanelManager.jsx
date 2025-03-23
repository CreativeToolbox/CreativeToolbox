import { useState, useCallback, memo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CreativeToolbox from '../CreativeToolbox';
import AssistantPanel from '../panels/AssistantPanel';

const PanelHeader = memo(({ title, isExpanded, onClick }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderBottom: 1,
      borderColor: 'divider',
      backgroundColor: 'background.default',
      cursor: 'pointer',
    }}
    onClick={onClick}
  >
    <Typography variant="subtitle1" fontWeight="bold">
      {title}
    </Typography>
    <IconButton size="small">
      {isExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
    </IconButton>
  </Box>
));

const PanelContent = memo(({ type, documentId, content, onContentUpdate }) => {
  if (type === 'assistant') {
    return (
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <AssistantPanel 
          documentId={documentId}
          content={content}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      <CreativeToolbox 
        documentId={documentId}
        content={content}
        onContentUpdate={onContentUpdate}
      />
    </Box>
  );
});

const RightPanelManager = ({ documentId, content, onContentUpdate }) => {
  const [expandedPanel, setExpandedPanel] = useState('assistant');

  const togglePanel = useCallback((panelName) => {
    setExpandedPanel(panelName);
  }, []);

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        flex: expandedPanel === 'assistant' ? 1 : 'none',
        minHeight: expandedPanel === 'assistant' ? 0 : 'auto',
      }}>
        <PanelHeader 
          title="AI Assistant"
          isExpanded={expandedPanel === 'assistant'}
          onClick={() => togglePanel('assistant')}
        />
        {expandedPanel === 'assistant' && (
          <PanelContent
            type="assistant"
            documentId={documentId}
            content={content}
          />
        )}
      </Box>

      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        flex: expandedPanel === 'toolbox' ? 1 : 'none',
        minHeight: expandedPanel === 'toolbox' ? 0 : 'auto',
      }}>
        <PanelHeader 
          title="Creative Toolbox"
          isExpanded={expandedPanel === 'toolbox'}
          onClick={() => togglePanel('toolbox')}
        />
        {expandedPanel === 'toolbox' && (
          <PanelContent
            type="toolbox"
            documentId={documentId}
            content={content}
            onContentUpdate={onContentUpdate}
          />
        )}
      </Box>
    </Box>
  );
};

export default memo(RightPanelManager); 