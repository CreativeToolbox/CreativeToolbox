import { memo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper,
  Stack,
  Divider
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../../../contexts/AuthContext';

const AssistantPanel = memo(({ documentId, content, scenes }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const getAuthHeaders = async () => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    const token = await currentUser.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const analyzeStory = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/ai/analyze-story', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          documentId,
          content,
          scenes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze story');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeScene = async (sceneId) => {
    setIsProcessing(true);
    setError(null);
    try {
      const scene = scenes.find(s => s.id === sceneId);
      if (!scene) return;

      const headers = await getAuthHeaders();
      const response = await fetch('/api/ai/analyze-scene', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          documentId,
          scene
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze scene');
      }

      const data = await response.json();
      setAnalysis(prev => ({
        ...prev,
        scenes: {
          ...prev?.scenes,
          [sceneId]: data
        }
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        AI Story Assistant
      </Typography>
      
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          onClick={analyzeStory}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Analyzing...
            </>
          ) : (
            'Analyze Story'
          )}
        </Button>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {analysis && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Story Analysis
            </Typography>
            <Typography variant="body2">
              {analysis.summary}
            </Typography>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Scene Analysis
          </Typography>
          {scenes?.map(scene => (
            <Paper key={scene.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {scene.title}
              </Typography>
              {analysis.scenes?.[scene.id] ? (
                <Typography variant="body2">
                  {analysis.scenes[scene.id].summary}
                </Typography>
              ) : (
                <Button
                  size="small"
                  onClick={() => analyzeScene(scene.id)}
                  disabled={isProcessing}
                >
                  Analyze Scene
                </Button>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
});

export default AssistantPanel; 