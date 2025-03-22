import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Select,
  MenuItem,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon
} from '@mui/icons-material';
import {
  getPlot,
  updatePlot,
  addPlotPoint,
  updatePlotPoint,
  deletePlotPoint,
  getDocumentCharacters
} from '../../../services/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CharacterReference from '../../../components/CharacterReference';
import { debounce } from 'lodash';

const PLOT_STRUCTURES = {
  three_act: 'Three Act Structure',
  five_act: 'Five Act Structure',
  hero_journey: "Hero's Journey",
  custom: 'Custom Structure'
};

const PLOT_POINT_TYPES = {
  exposition: 'Exposition',
  rising_action: 'Rising Action',
  climax: 'Climax',
  falling_action: 'Falling Action',
  resolution: 'Resolution',
  setup: 'Setup',
  conflict: 'Conflict',
  twist: 'Plot Twist',
  revelation: 'Revelation'
};

function CharacterSelector({ value = [], onChange, characters = [], label }) {
  const selectedCharacters = Array.isArray(value) 
    ? value.map(v => 
        typeof v === 'string' 
          ? characters.find(c => c._id === v) 
          : v
      ).filter(Boolean)
    : [];

  return (
    <Autocomplete
      multiple
      value={selectedCharacters}
      onChange={(event, newValue) => onChange(newValue)}
      options={characters}
      getOptionLabel={(character) => character?.name || ''}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      renderInput={(params) => (
        <TextField {...params} label={label} />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((character, index) => {
          const props = getTagProps({ index });
          const { key, ...otherProps } = props;
          return (
            <Chip
              key={character._id || key}
              avatar={<Avatar>{character.name[0]}</Avatar>}
              label={character.name}
              {...otherProps}
            />
          );
        })
      }
    />
  );
}

export default function PlotPanel({ documentId }) {
  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [pointForm, setPointForm] = useState({
    title: '',
    description: '',
    type: 'setup',
    involvedCharacters: []
  });
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    loadPlot();
    loadCharacters();
  }, [documentId]);

  const loadPlot = async () => {
    try {
      setLoading(true);
      const response = await getPlot(documentId);
      console.log('Loaded plot data:', response); // Debug log
      
      // Set default values if data is missing
      setPlot({
        structure: response?.structure || 'three_act',
        mainConflict: response?.mainConflict || '',
        synopsis: response?.synopsis || '',
        plotPoints: response?.plotPoints || [],
        mainConflictCharacters: response?.mainConflictCharacters || [],
        ...response
      });
      setError(null);
    } catch (err) {
      setError('Failed to load plot');
      console.error('Error loading plot:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCharacters = async () => {
    try {
      const response = await getDocumentCharacters(documentId);
      setCharacters(response.data);
    } catch (err) {
      console.error('Failed to load characters:', err);
      setError('Failed to load characters');
    }
  };

  const debouncedUpdatePlot = useCallback(
    debounce(async (updates) => {
      try {
        await updatePlot(documentId, updates);
        setError(null);
      } catch (err) {
        setError('Failed to save changes');
        console.error(err);
      }
    }, 1000),
    [documentId]
  );

  const handleStructureChange = (value) => {
    setPlot(prev => ({
      ...prev,
      structure: value
    }));
    debouncedUpdatePlot({ structure: value });
  };

  const handleMainConflictChange = (value) => {
    setPlot(prev => ({
      ...prev,
      mainConflict: value
    }));
    debouncedUpdatePlot({ mainConflict: value });
  };

  const handleSynopsisChange = (value) => {
    setPlot(prev => ({
      ...prev,
      synopsis: value
    }));
    debouncedUpdatePlot({ synopsis: value });
  };

  const handleOpenDialog = (point = null) => {
    if (point) {
      setEditingPoint(point);
      setPointForm({
        title: point.title || '',
        description: point.description || '',
        type: point.type || 'setup',
        involvedCharacters: point.involvedCharacters || []
      });
    } else {
      setEditingPoint(null);
      setPointForm({
        title: '',
        description: '',
        type: 'setup',
        involvedCharacters: []
      });
    }
    setDialogOpen(true);
  };

  const handleSubmitPoint = async () => {
    try {
      const pointData = {
        ...pointForm,
        involvedCharacters: pointForm.involvedCharacters.map(char => 
          typeof char === 'string' ? char : char._id
        )
      };

      if (editingPoint) {
        const response = await updatePlotPoint(documentId, editingPoint._id, pointData);
        console.log('Update response:', response.data);
      } else {
        const response = await addPlotPoint(documentId, pointData);
        console.log('Create response:', response.data);
      }
      setDialogOpen(false);
      loadPlot();
    } catch (err) {
      console.error('Failed to save plot point:', err);
      setError('Failed to save plot point');
    }
  };

  const handleDeletePoint = async (pointId) => {
    if (window.confirm('Are you sure you want to delete this plot point?')) {
      try {
        await deletePlotPoint(documentId, pointId);
        loadPlot();
      } catch (err) {
        setError('Failed to delete plot point');
      }
    }
  };

  const handleDragEnd = async (result) => {
    console.log('Drag ended:', result);
    if (!result.destination) {
      console.log('No destination, returning');
      return;
    }

    const items = Array.from(plot.plotPoints);
    console.log('Original items:', items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    console.log('Reordered items:', items);

    // Update the order property for each item
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    console.log('Updated items with order:', updatedItems);

    // Update local state immediately for smooth UI
    setPlot({
      ...plot,
      plotPoints: updatedItems
    });

    // Update in the backend
    try {
      await updatePlot(documentId, {
        plotPoints: updatedItems
      });
      console.log('Backend update successful');
    } catch (err) {
      console.error('Failed to update plot points:', err);
      setError('Failed to reorder plot points');
      // Revert to original order if update fails
      loadPlot();
    }
  };

  const handleMainConflictCharactersChange = (characters) => {
    setPlot(prev => ({
      ...prev,
      mainConflictCharacters: characters
    }));
    debouncedUpdatePlot({ 
      mainConflictCharacters: characters.map(c => c._id) 
    });
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Plot Structure
          </Typography>
          <Select
            fullWidth
            value={plot?.structure || 'three_act'}
            onChange={(e) => handleStructureChange(e.target.value)}
          >
            {Object.entries(PLOT_STRUCTURES).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box>
          <Typography variant="h6" gutterBottom>
            Main Conflict
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={plot?.mainConflict || ''}
              onChange={(e) => handleMainConflictChange(e.target.value)}
              placeholder="Describe the main conflict of your story..."
            />
            <CharacterSelector
              value={plot?.mainConflictCharacters || []}
              onChange={(characters) => 
                handleMainConflictCharactersChange(characters)
              }
              characters={characters}
              label="Key Characters in Conflict"
            />
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Synopsis
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={plot?.synopsis || ''}
            onChange={(e) => handleSynopsisChange(e.target.value)}
            placeholder="Write a brief synopsis of your story..."
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Plot Points
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              variant="contained"
            >
              Add Point
            </Button>
          </Box>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="plot-points">
              {(provided) => (
                <List
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{
                    position: 'relative',
                    '& .MuiListItem-root': {
                      userSelect: 'none'
                    }
                  }}
                >
                  {plot?.plotPoints.map((point, index) => (
                    <Draggable
                      key={point._id}
                      draggableId={point._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: snapshot.isDragging ? 'primary.main' : 'divider',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                            transition: 'background-color 0.2s ease',
                            ...provided.draggableProps.style
                          }}
                        >
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mr: 2,
                              cursor: 'grab',
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'primary.main',
                              },
                              '&:active': {
                                cursor: 'grabbing'
                              }
                            }}
                          >
                            <DragHandleIcon />
                          </Box>
                          <ListItemText
                            primary={point.title}
                            secondary={
                              <Stack 
                                component="span" 
                                spacing={1} 
                                sx={{ 
                                  display: 'block',
                                  '& > *': { display: 'block' }
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  component="span"
                                >
                                  {PLOT_POINT_TYPES[point.type]}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  component="span"
                                >
                                  {point.description}
                                </Typography>
                                {point.involvedCharacters?.length > 0 && (
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    component="span"
                                  >
                                    Characters: {' '}
                                    {point.involvedCharacters.map((char, index) => (
                                      <span key={char._id}>
                                        <CharacterReference character={char}>
                                          {char.name}
                                        </CharacterReference>
                                        {index < point.involvedCharacters.length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </Typography>
                                )}
                              </Stack>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton onClick={() => handleOpenDialog(point)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeletePoint(point._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPoint ? 'Edit Plot Point' : 'New Plot Point'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={pointForm.title}
              onChange={(e) => setPointForm({ ...pointForm, title: e.target.value })}
              fullWidth
              required
            />
            <Select
              value={pointForm.type}
              onChange={(e) => setPointForm({ ...pointForm, type: e.target.value })}
              fullWidth
              label="Type"
            >
              {Object.entries(PLOT_POINT_TYPES).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Description"
              value={pointForm.description}
              onChange={(e) => setPointForm({ ...pointForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <CharacterSelector
              value={pointForm.involvedCharacters || []}
              onChange={(characters) => 
                setPointForm({ ...pointForm, involvedCharacters: characters })
              }
              characters={characters}
              label="Involved Characters"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitPoint}
            variant="contained"
            disabled={!pointForm.title.trim()}
          >
            {editingPoint ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 