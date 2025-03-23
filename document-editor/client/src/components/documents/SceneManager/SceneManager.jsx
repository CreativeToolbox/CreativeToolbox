import { memo } from 'react';
import { Box, Typography } from '@mui/material';

const SceneManager = memo(({ documentId }) => {
  return (
    <Box sx={{
      height: '100%',
      borderRight: 1,
      borderColor: 'divider',
      backgroundColor: 'background.paper',
    }}>
      <Typography variant="subtitle1" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Scene Manager
      </Typography>
      <Box sx={{ p: 2 }}>
        {/* Scene management content will go here */}
        <Typography variant="body2" color="text.secondary">
          Coming Soon
        </Typography>
      </Box>
    </Box>
  );
});

SceneManager.displayName = 'SceneManager';

export default SceneManager; 