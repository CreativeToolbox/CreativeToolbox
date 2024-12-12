import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
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
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  getDocumentCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter
} from '../../../services/api';

const CHARACTER_ROLES = [
  'protagonist',
  'antagonist',
  'supporting',
  'mentor',
  'sidekick',
  'love_interest'
];

const formatRole = (role) => {
  if (!role) return 'Unknown';
  return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
};

const INITIAL_FORM_STATE = {
  name: '',
  role: 'supporting',
  description: '',
  goals: '',
  conflicts: ''
};

export default function CharactersPanel({ documentId }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [characterForm, setCharacterForm] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    loadCharacters();
  }, [documentId]);

  const loadCharacters = async () => {
    setLoading(true);
    try {
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
    if (character) {
      setEditingCharacter(character);
      setCharacterForm({
        name: character.name || '',
        role: character.role || 'supporting',
        description: character.description || '',
        goals: character.goals || '',
        conflicts: character.conflicts || ''
      });
    } else {
      setEditingCharacter(null);
      setCharacterForm(INITIAL_FORM_STATE);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const characterData = {
        ...characterForm,
        document: documentId
      };
      
      console.log('Submitting character data:', characterData);
      
      if (editingCharacter) {
        console.log('Updating character:', editingCharacter._id);
        const response = await updateCharacter(editingCharacter._id, characterData);
        console.log('Update response:', response);
      } else {
        console.log('Creating new character');
        const response = await createCharacter(characterData);
        console.log('Create response:', response);
      }
      
      setDialogOpen(false);
      loadCharacters();
      setError(null);
    } catch (err) {
      console.error('Error saving character:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to save character');
    }
  };

  const handleDelete = async (characterId) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        await deleteCharacter(characterId);
        loadCharacters();
        setError(null);
      } catch (err) {
        setError('Failed to delete character');
        console.error(err);
      }
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
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Characters</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            variant="contained"
          >
            Add Character
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <List>
          {characters.map((character) => (
            <ListItem key={character._id}>
              <ListItemText
                primary={character.name}
                secondary={formatRole(character.role)}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenDialog(character)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(character._id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCharacter ? 'Edit Character' : 'New Character'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                value={characterForm.name || ''}
                onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                fullWidth
                required
              />
              <Select
                value={characterForm.role || 'supporting'}
                onChange={(e) => setCharacterForm({ ...characterForm, role: e.target.value })}
                fullWidth
                label="Role"
              >
                {CHARACTER_ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {formatRole(role)}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                label="Description"
                value={characterForm.description || ''}
                onChange={(e) => setCharacterForm({ ...characterForm, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label="Goals"
                value={characterForm.goals || ''}
                onChange={(e) => setCharacterForm({ ...characterForm, goals: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Conflicts"
                value={characterForm.conflicts || ''}
                onChange={(e) => setCharacterForm({ ...characterForm, conflicts: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!characterForm.name.trim() || !characterForm.role.trim()}
            >
              {editingCharacter ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Paper>
  );
} 