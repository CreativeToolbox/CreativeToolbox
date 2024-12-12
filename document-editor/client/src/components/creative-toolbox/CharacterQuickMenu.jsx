import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Star as StarIcon,
  SupervisorAccount as SupportingIcon,
  Psychology as MentorIcon,
  Favorite as LoveIcon,
  SportsKabaddi as ConflictIcon
} from '@mui/icons-material';
import { getDocumentCharacters } from '../../services/api';

const ROLE_ICONS = {
  protagonist: <StarIcon color="primary" />,
  antagonist: <ConflictIcon color="error" />,
  supporting: <SupportingIcon color="action" />,
  mentor: <MentorIcon color="info" />,
  sidekick: <PersonIcon color="success" />,
  love_interest: <LoveIcon color="secondary" />
};

export default function CharacterQuickMenu({ documentId }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCharacters();
  }, [documentId]);

  const loadCharacters = async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const response = await getDocumentCharacters(documentId);
      setCharacters(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load characters:', err);
      setError('Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => ROLE_ICONS[role] || <PersonIcon />;

  if (loading) {
    return (
      <Paper sx={{ p: 2, minWidth: 300 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, minWidth: 300 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!characters.length) {
    return (
      <Paper sx={{ p: 2, minWidth: 300 }}>
        <Typography color="text.secondary" align="center">
          No characters yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, minWidth: 300 }}>
      <Stack spacing={2}>
        <Typography variant="h6" gutterBottom>
          Characters in Scene
        </Typography>
        
        <List dense>
          {characters.map((character) => (
            <ListItem
              key={character._id}
              secondaryAction={
                <Tooltip title={character.role}>
                  <IconButton edge="end" size="small">
                    {getRoleIcon(character.role)}
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  {character.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={character.name}
                secondary={
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {character.goals && (
                      <Chip
                        label="Goals"
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                    {character.conflicts && (
                      <Chip
                        label="Conflicts"
                        size="small"
                        variant="outlined"
                        color="error"
                      />
                    )}
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      </Stack>
    </Paper>
  );
} 