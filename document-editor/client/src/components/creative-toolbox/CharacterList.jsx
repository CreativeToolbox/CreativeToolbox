import { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Collapse,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getDocumentCharacters, createCharacter, updateCharacter, deleteCharacter } from '../../services/api';

export default function CharacterList({ documentId }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    traits: '',
    backstory: '',
    metadata: {
      age: '',
      gender: '',
      occupation: ''
    }
  });

  // Load characters
  useEffect(() => {
    loadCharacters();
  }, [documentId]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const response = await getDocumentCharacters(documentId);
      setCharacters(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load characters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (character = null) => {
    console.log('Opening dialog for character:', character);
    if (character) {
      setFormData({
        name: character.name,
        description: character.description,
        traits: character.traits.join(', '),
        backstory: character.backstory,
        metadata: { ...character.metadata }
      });
      setSelectedCharacter(character);
    } else {
      setFormData({
        name: '',
        description: '',
        traits: '',
        backstory: '',
        metadata: { age: '', gender: '', occupation: '' }
      });
      setSelectedCharacter(null);
    }
    setDialogOpen(true);
    console.log('Dialog state set to open');
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting character data...');
      const characterData = {
        ...formData,
        traits: formData.traits.split(',').map(t => t.trim()).filter(t => t),
        document: documentId
      };
      console.log('Character data:', characterData);

      if (selectedCharacter) {
        console.log('Updating existing character...');
        await updateCharacter(selectedCharacter._id, characterData);
      } else {
        console.log('Creating new character...');
        const response = await createCharacter(characterData);
        console.log('Create response:', response);
      }

      loadCharacters();
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving character:', err);
      setError(err.response?.data?.message || 'Failed to save character');
    }
  };

  const handleDelete = async (characterId) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        await deleteCharacter(characterId);
        loadCharacters();
      } catch (err) {
        setError('Failed to delete character');
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Characters</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          variant="contained"
          size="small"
        >
          Add Character
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {characters.map((character) => (
          <Box key={character._id}>
            <ListItem>
              <ListItemText
                primary={character.name}
                secondary={character.description}
                onClick={() => setExpandedId(expandedId === character._id ? null : character._id)}
                sx={{ cursor: 'pointer' }}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenDialog(character)} size="small">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(character._id)} size="small" color="error">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Collapse in={expandedId === character._id}>
              <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                {character.traits.length > 0 && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Traits:</strong> {character.traits.join(', ')}
                  </Typography>
                )}
                {character.backstory && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Backstory:</strong> {character.backstory}
                  </Typography>
                )}
                {Object.entries(character.metadata).some(([_, value]) => value) && (
                  <Typography variant="body2">
                    <strong>Details:</strong>{' '}
                    {Object.entries(character.metadata)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </Typography>
                )}
              </Box>
            </Collapse>
          </Box>
        ))}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCharacter ? 'Edit Character' : 'New Character'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Traits (comma-separated)"
            fullWidth
            value={formData.traits}
            onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Backstory"
            fullWidth
            multiline
            rows={3}
            value={formData.backstory}
            onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Additional Details
            </Typography>
            <TextField
              margin="dense"
              label="Age"
              value={formData.metadata.age}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, age: e.target.value }
              })}
              sx={{ mr: 1 }}
            />
            <TextField
              margin="dense"
              label="Gender"
              value={formData.metadata.gender}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, gender: e.target.value }
              })}
              sx={{ mr: 1 }}
            />
            <TextField
              margin="dense"
              label="Occupation"
              value={formData.metadata.occupation}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, occupation: e.target.value }
              })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCharacter ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 