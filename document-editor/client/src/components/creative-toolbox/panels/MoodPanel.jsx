import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Stack,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import { getStory, updateStoryMood } from '../../../services/api';

const PRESET_MOODS = {
  happy: "Light and uplifting",
  sad: "Thoughtful and introspective",
  angry: "Intense and forceful",
  peaceful: "Calm and serene",
  tense: "Suspenseful and anxious",
  mysterious: "Enigmatic and intriguing",
  romantic: "Passionate and emotional",
  adventurous: "Exciting and dynamic"
};

export default function MoodPanel({ documentId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mood, setMood] = useState('peaceful');

  useEffect(() => {
    loadStoryMood();
  }, [documentId]);

  const loadStoryMood = async () => {
    setLoading(true);
    try {
      const story = await getStory(documentId);
      console.log('Loaded story data:', story); // Debug log
      
      // Check if story and mood exist, otherwise use default
      if (story && story.mood) {
        setMood(story.mood);
      } else {
        // Set default mood
        setMood('peaceful');
        console.log('Using default mood value');
      }
    } catch (err) {
      setError('Failed to load story mood');
      console.error('Error loading story mood:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodChange = async (newMood) => {
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
            value={mood}
            onChange={(e) => handleMoodChange(e.target.value)}
            sx={{ mb: 2 }}
          >
            {Object.entries(PRESET_MOODS).map(([key, description]) => (
              <MenuItem key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </MenuItem>
            ))}
          </Select>

          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mt: 2,
              opacity: saving ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {PRESET_MOODS[mood]}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
} 