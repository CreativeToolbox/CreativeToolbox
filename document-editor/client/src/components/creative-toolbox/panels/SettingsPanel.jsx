import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
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
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon
} from '@mui/icons-material';
import {
  getSetting,
  updateSetting,
  addLocation,
  updateLocation,
  deleteLocation,
  addTimelinePeriod,
  updateTimelinePeriod,
  deleteTimelinePeriod
} from '../../../services/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const LOCATION_TYPES = {
  city: 'City',
  building: 'Building',
  country: 'Country',
  region: 'Region',
  room: 'Room',
  landscape: 'Landscape',
  other: 'Other'
};

const IMPORTANCE_LEVELS = {
  primary: 'Primary',
  secondary: 'Secondary',
  minor: 'Minor'
};

export default function SettingsPanel({ documentId }) {
  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [locationForm, setLocationForm] = useState({
    name: '',
    description: '',
    type: 'other',
    importance: 'secondary'
  });
  const [periodForm, setPeriodForm] = useState({
    period: '',
    description: ''
  });

  useEffect(() => {
    loadSetting();
  }, [documentId]);

  const loadSetting = async () => {
    try {
      setLoading(true);
      const response = await getSetting(documentId);
      setSetting(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Main setting handlers
  const handleMainLocationChange = async (mainLocation) => {
    try {
      await updateSetting(documentId, { mainLocation });
      setSetting({ ...setting, mainLocation });
    } catch (err) {
      setError('Failed to update main location');
    }
  };

  const handleTimePeriodChange = async (timePeriod) => {
    try {
      await updateSetting(documentId, { timePeriod });
      setSetting({ ...setting, timePeriod });
    } catch (err) {
      setError('Failed to update time period');
    }
  };

  const handleWorldDetailsChange = async (worldDetails) => {
    try {
      await updateSetting(documentId, { worldDetails });
      setSetting({ ...setting, worldDetails });
    } catch (err) {
      setError('Failed to update world details');
    }
  };

  // Location handlers
  const handleOpenLocationDialog = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        name: location.name,
        description: location.description,
        type: location.type,
        importance: location.importance
      });
    } else {
      setEditingLocation(null);
      setLocationForm({
        name: '',
        description: '',
        type: 'other',
        importance: 'secondary'
      });
    }
    setLocationDialogOpen(true);
  };

  const handleSubmitLocation = async () => {
    try {
      if (editingLocation) {
        await updateLocation(documentId, editingLocation._id, locationForm);
      } else {
        await addLocation(documentId, locationForm);
      }
      setLocationDialogOpen(false);
      loadSetting();
    } catch (err) {
      setError('Failed to save location');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(documentId, locationId);
        loadSetting();
      } catch (err) {
        setError('Failed to delete location');
      }
    }
  };

  // Timeline handlers
  const handleOpenTimelineDialog = (period = null) => {
    if (period) {
      setEditingPeriod(period);
      setPeriodForm({
        period: period.period,
        description: period.description
      });
    } else {
      setEditingPeriod(null);
      setPeriodForm({
        period: '',
        description: ''
      });
    }
    setTimelineDialogOpen(true);
  };

  const handleSubmitPeriod = async () => {
    try {
      if (editingPeriod) {
        await updateTimelinePeriod(documentId, editingPeriod._id, periodForm);
      } else {
        await addTimelinePeriod(documentId, periodForm);
      }
      setTimelineDialogOpen(false);
      loadSetting();
    } catch (err) {
      setError('Failed to save timeline period');
    }
  };

  const handleDeletePeriod = async (periodId) => {
    if (window.confirm('Are you sure you want to delete this timeline period?')) {
      try {
        await deleteTimelinePeriod(documentId, periodId);
        loadSetting();
      } catch (err) {
        setError('Failed to delete timeline period');
      }
    }
  };

  // Timeline drag and drop handler
  const handleTimelineDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(setting.timeline);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property for each item
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    // Update local state immediately for smooth UI
    setSetting({
      ...setting,
      timeline: updatedItems
    });

    // Update in the backend
    try {
      await updateSetting(documentId, {
        timeline: updatedItems
      });
    } catch (err) {
      setError('Failed to reorder timeline');
      loadSetting(); // Revert to original order if update fails
    }
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
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Main Settings */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Main Settings
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Main Location"
              value={setting?.mainLocation || ''}
              onChange={(e) => handleMainLocationChange(e.target.value)}
              placeholder="Enter the main location of your story..."
            />
            <TextField
              fullWidth
              label="Time Period"
              value={setting?.timePeriod || ''}
              onChange={(e) => handleTimePeriodChange(e.target.value)}
              placeholder="Enter the time period of your story..."
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="World Details"
              value={setting?.worldDetails || ''}
              onChange={(e) => handleWorldDetailsChange(e.target.value)}
              placeholder="Describe the world of your story..."
            />
          </Stack>
        </Box>

        {/* Locations */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Locations
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenLocationDialog()}
              variant="contained"
            >
              Add Location
            </Button>
          </Box>

          <List>
            {setting?.locations.map((location) => (
              <ListItem
                key={location._id}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <ListItemText
                  primary={location.name}
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Type: {LOCATION_TYPES[location.type]} | Importance: {IMPORTANCE_LEVELS[location.importance]}
                      </Typography>
                      <Typography variant="body2">
                        {location.description}
                      </Typography>
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleOpenLocationDialog(location)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteLocation(location._id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Timeline */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Timeline
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenTimelineDialog()}
              variant="contained"
            >
              Add Period
            </Button>
          </Box>

          <DragDropContext onDragEnd={handleTimelineDragEnd}>
            <Droppable droppableId="timeline">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {setting?.timeline.map((period, index) => (
                    <Draggable key={period._id} draggableId={period._id} index={index}>
                      {(provided, snapshot) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: snapshot.isDragging ? 'primary.main' : 'divider'
                          }}
                        >
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              mr: 2,
                              cursor: 'grab',
                              color: 'text.secondary',
                              '&:hover': { color: 'primary.main' }
                            }}
                          >
                            <DragHandleIcon />
                          </Box>
                          <ListItemText
                            primary={period.period}
                            secondary={period.description}
                          />
                          <ListItemSecondaryAction>
                            <IconButton onClick={() => handleOpenTimelineDialog(period)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeletePeriod(period._id)}>
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

      {/* Location Dialog */}
      <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLocation ? 'Edit Location' : 'New Location'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={locationForm.name}
              onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
              fullWidth
              required
            />
            <Select
              value={locationForm.type}
              onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value })}
              fullWidth
              label="Type"
            >
              {Object.entries(LOCATION_TYPES).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            <Select
              value={locationForm.importance}
              onChange={(e) => setLocationForm({ ...locationForm, importance: e.target.value })}
              fullWidth
              label="Importance"
            >
              {Object.entries(IMPORTANCE_LEVELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Description"
              value={locationForm.description}
              onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitLocation}
            variant="contained"
            disabled={!locationForm.name.trim()}
          >
            {editingLocation ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog open={timelineDialogOpen} onClose={() => setTimelineDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPeriod ? 'Edit Timeline Period' : 'New Timeline Period'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Period"
              value={periodForm.period}
              onChange={(e) => setPeriodForm({ ...periodForm, period: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={periodForm.description}
              onChange={(e) => setPeriodForm({ ...periodForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimelineDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitPeriod}
            variant="contained"
            disabled={!periodForm.period.trim()}
          >
            {editingPeriod ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}