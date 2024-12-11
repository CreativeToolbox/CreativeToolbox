import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Fade,
  Button
} from '@mui/material';
import { getStory, updateStoryMode } from '../../../services/api';

export default function ModePanel({ documentId }) {
  const [mode, setMode] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    loadStoryMode();
  }, [documentId]);

  const loadStoryMode = async (isRetry = false) => {
    if (isRetry) setRetrying(true);
    setLoading(true);
    setError(null);
    try {
      const response = await getStory(documentId);
      const { narrative, dialogue } = response.data.mode;
      setMode(narrative > dialogue ? 50 - (narrative / 2) : 50 + (dialogue / 2));
    } catch (err) {
      setError(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span>Failed to load story mode.</span>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => loadStoryMode(true)}
            disabled={retrying}
          >
            {retrying ? 'Retrying...' : 'Retry'}
          </Button>
        </Box>
      );
      console.error(err);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  const handleModeChange = async (event, newValue) => {
    setMode(newValue);
    setSaving(true);
    try {
      await updateStoryMode(documentId, {
        narrative: newValue < 50 ? 100 - (newValue * 2) : 0,
        dialogue: newValue > 50 ? (newValue - 50) * 2 : 0
      });
      setError(null);
    } catch (err) {
      setError('Failed to save changes. Your progress may be lost.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" gutterBottom>
            Story Mode
          </Typography>
          {saving && (
            <Fade in={saving}>
              <CircularProgress size={20} />
            </Fade>
          )}
        </Box>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 1,
            opacity: saving ? 0.7 : 1,
            transition: 'opacity 0.2s'
          }}>
            <Typography 
              color={mode < 50 ? 'primary' : 'text.secondary'}
              sx={{ fontWeight: mode < 50 ? 'bold' : 'normal' }}
            >
              Narrative
            </Typography>
            <Typography 
              color={mode > 50 ? 'primary' : 'text.secondary'}
              sx={{ fontWeight: mode > 50 ? 'bold' : 'normal' }}
            >
              Dialogue
            </Typography>
          </Box>
          
          <Slider
            value={mode}
            onChange={handleModeChange}
            valueLabelDisplay="auto"
            disabled={saving}
            valueLabelFormat={(value) => 
              `${value < 50 
                ? `${100 - value * 2}% Narrative` 
                : `${(value - 50) * 2}% Dialogue`}`
            }
            marks={[
              { value: 0, label: 'Pure Narrative' },
              { value: 50, label: 'Balanced' },
              { value: 100, label: 'Pure Dialogue' }
            ]}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              opacity: saving ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {mode < 50 ? (
              "Focus on descriptive storytelling and scene-setting."
            ) : mode > 50 ? (
              "Focus on character interactions and conversations."
            ) : (
              "Balanced mix of narrative and dialogue."
            )}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
} 