import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Stack,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import { getStory, updateStoryMood } from '../../../services/api';

const PRESET_MOODS = {
  joyful: "Light and uplifting",
  melancholic: "Thoughtful and introspective",
  tense: "Suspenseful and anxious",
  peaceful: "Calm and serene",
  mysterious: "Enigmatic and intriguing",
  romantic: "Passionate and emotional",
  adventurous: "Exciting and dynamic",
  dark: "Grim and foreboding",
  humorous: "Witty and amusing",
  nostalgic: "Wistful and reminiscent"
};

export default function MoodPanel({ documentId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mood, setMood] = useState({
    type: 'preset',
    preset: 'peaceful',
    custom: '',
    description: PRESET_MOODS.peaceful
  });

  useEffect(() => {
    loadStoryMood();
  }, [documentId]);

  const loadStoryMood = async () => {
    setLoading(true);
    try {
      const response = await getStory(documentId);
      if (response.data.mood) {
        setMood(response.data.mood);
      }
    } catch (err) {
      setError('Failed to load story mood');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodChange = async (type, value) => {
    const newMood = {
      ...mood,
      type,
      [type]: value,
      description: type === 'preset' ? PRESET_MOODS[value] : ''
    };
    
    setMood(newMood);
    setSaving(true);
    
    try {
      await updateStoryMood(documentId, newMood);
      setError(null);
    } catch (err) {
      setError('Failed to save mood changes');
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
            Story Mood
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
          <Select
            fullWidth
            value={mood.type === 'preset' ? mood.preset : 'custom'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'custom') {
                handleMoodChange('custom', mood.custom || '');
              } else {
                handleMoodChange('preset', value);
              }
            }}
            sx={{ mb: 2 }}
          >
            {Object.entries(PRESET_MOODS).map(([key, description]) => (
              <MenuItem key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </MenuItem>
            ))}
            <MenuItem value="custom">Custom Mood</MenuItem>
          </Select>

          {mood.type === 'custom' && (
            <TextField
              fullWidth
              label="Custom Mood"
              value={mood.custom}
              onChange={(e) => handleMoodChange('custom', e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mt: 2,
              opacity: saving ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {mood.type === 'preset' ? PRESET_MOODS[mood.preset] : 'Custom mood setting'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
} 