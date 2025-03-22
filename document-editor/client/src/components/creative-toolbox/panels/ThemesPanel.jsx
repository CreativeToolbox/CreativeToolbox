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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import {
  getTheme,
  updateTheme,
  addMainTheme,
  updateMainTheme,
  deleteMainTheme,
  addMotif,
  updateMotif,
  deleteMotif,
  addSymbol,
  updateSymbol,
  deleteSymbol
} from '../../../services/api';

export default function ThemesPanel({ documentId }) {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainThemeDialogOpen, setMainThemeDialogOpen] = useState(false);
  const [motifDialogOpen, setMotifDialogOpen] = useState(false);
  const [symbolDialogOpen, setSymbolDialogOpen] = useState(false);
  const [editingMainTheme, setEditingMainTheme] = useState(null);
  const [editingMotif, setEditingMotif] = useState(null);
  const [editingSymbol, setEditingSymbol] = useState(null);
  const [mainThemeForm, setMainThemeForm] = useState({
    name: '',
    description: '',
    exploration: ''
  });
  const [motifForm, setMotifForm] = useState({
    name: '',
    description: '',
    purpose: ''
  });
  const [symbolForm, setSymbolForm] = useState({
    name: '',
    meaning: '',
    occurrences: []
  });
  const [occurrenceForm, setOccurrenceForm] = useState({
    context: '',
    significance: ''
  });

  useEffect(() => {
    loadTheme();
  }, [documentId]);

  const loadTheme = async () => {
    try {
      setLoading(true);
      const response = await getTheme(documentId);
      console.log('Loaded theme data:', response); // Debug log
      
      // Set default values if data is missing
      setTheme({
        mainThemes: response?.mainThemes || [],
        motifs: response?.motifs || [],
        symbols: response?.symbols || [],
        ...response
      });
      setError(null);
    } catch (err) {
      setError('Failed to load themes');
      console.error('Error loading themes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Main theme handlers
  const handleOpenMainThemeDialog = (mainTheme = null) => {
    if (mainTheme) {
      setEditingMainTheme(mainTheme);
      setMainThemeForm({
        name: mainTheme.name,
        description: mainTheme.description,
        exploration: mainTheme.exploration
      });
    } else {
      setEditingMainTheme(null);
      setMainThemeForm({
        name: '',
        description: '',
        exploration: ''
      });
    }
    setMainThemeDialogOpen(true);
  };

  const handleSubmitMainTheme = async () => {
    try {
      if (editingMainTheme) {
        await updateMainTheme(documentId, editingMainTheme._id, mainThemeForm);
      } else {
        await addMainTheme(documentId, mainThemeForm);
      }
      setMainThemeDialogOpen(false);
      loadTheme();
    } catch (err) {
      setError('Failed to save main theme');
    }
  };

  const handleDeleteMainTheme = async (themeId) => {
    if (window.confirm('Are you sure you want to delete this theme?')) {
      try {
        await deleteMainTheme(documentId, themeId);
        loadTheme();
      } catch (err) {
        setError('Failed to delete theme');
      }
    }
  };

  // Motif handlers
  const handleOpenMotifDialog = (motif = null) => {
    if (motif) {
      setEditingMotif(motif);
      setMotifForm({
        name: motif.name,
        description: motif.description,
        purpose: motif.purpose
      });
    } else {
      setEditingMotif(null);
      setMotifForm({
        name: '',
        description: '',
        purpose: ''
      });
    }
    setMotifDialogOpen(true);
  };

  const handleSubmitMotif = async () => {
    try {
      if (editingMotif) {
        await updateMotif(documentId, editingMotif._id, motifForm);
      } else {
        await addMotif(documentId, motifForm);
      }
      setMotifDialogOpen(false);
      loadTheme();
    } catch (err) {
      setError('Failed to save motif');
    }
  };

  const handleDeleteMotif = async (motifId) => {
    if (window.confirm('Are you sure you want to delete this motif?')) {
      try {
        await deleteMotif(documentId, motifId);
        loadTheme();
      } catch (err) {
        setError('Failed to delete motif');
      }
    }
  };

  // Symbol handlers
  const handleOpenSymbolDialog = (symbol = null) => {
    if (symbol) {
      setEditingSymbol(symbol);
      setSymbolForm({
        name: symbol.name,
        meaning: symbol.meaning,
        occurrences: symbol.occurrences || []
      });
    } else {
      setEditingSymbol(null);
      setSymbolForm({
        name: '',
        meaning: '',
        occurrences: []
      });
    }
    setSymbolDialogOpen(true);
  };

  const handleAddOccurrence = () => {
    if (occurrenceForm.context.trim() || occurrenceForm.significance.trim()) {
      setSymbolForm({
        ...symbolForm,
        occurrences: [...symbolForm.occurrences, { ...occurrenceForm }]
      });
      setOccurrenceForm({ context: '', significance: '' });
    }
  };

  const handleRemoveOccurrence = (index) => {
    const newOccurrences = [...symbolForm.occurrences];
    newOccurrences.splice(index, 1);
    setSymbolForm({ ...symbolForm, occurrences: newOccurrences });
  };

  const handleSubmitSymbol = async () => {
    try {
      if (editingSymbol) {
        await updateSymbol(documentId, editingSymbol._id, symbolForm);
      } else {
        await addSymbol(documentId, symbolForm);
      }
      setSymbolDialogOpen(false);
      loadTheme();
    } catch (err) {
      setError('Failed to save symbol');
    }
  };

  const handleDeleteSymbol = async (symbolId) => {
    if (window.confirm('Are you sure you want to delete this symbol?')) {
      try {
        await deleteSymbol(documentId, symbolId);
        loadTheme();
      } catch (err) {
        setError('Failed to delete symbol');
      }
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

        {/* Main Themes Section */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="h6">Main Themes</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenMainThemeDialog();
                }}
                variant="contained"
                size="small"
              >
                Add Theme
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {theme?.mainThemes.map((mainTheme) => (
                <ListItem
                  key={mainTheme._id}
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <ListItemText
                    primary={mainTheme.name}
                    secondary={
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          {mainTheme.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Exploration: {mainTheme.exploration}
                        </Typography>
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleOpenMainThemeDialog(mainTheme)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteMainTheme(mainTheme._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Motifs Section */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="h6">Motifs</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenMotifDialog();
                }}
                variant="contained"
                size="small"
              >
                Add Motif
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {theme?.motifs.map((motif) => (
                <ListItem
                  key={motif._id}
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <ListItemText
                    primary={motif.name}
                    secondary={
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          {motif.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Purpose: {motif.purpose}
                        </Typography>
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleOpenMotifDialog(motif)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteMotif(motif._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Symbols Section */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="h6">Symbols</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSymbolDialog();
                }}
                variant="contained"
                size="small"
              >
                Add Symbol
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {theme?.symbols.map((symbol) => (
                <ListItem
                  key={symbol._id}
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TagIcon color="primary" />
                        {symbol.name}
                      </Box>
                    }
                    secondary={
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Meaning: {symbol.meaning}
                        </Typography>
                        {symbol.occurrences?.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Occurrences:
                            </Typography>
                            <Stack spacing={1} sx={{ pl: 2 }}>
                              {symbol.occurrences.map((occurrence, index) => (
                                <Box key={index}>
                                  <Typography variant="body2">
                                    Context: {occurrence.context}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Significance: {occurrence.significance}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleOpenSymbolDialog(symbol)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteSymbol(symbol._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Stack>

      {/* Main Theme Dialog */}
      <Dialog open={mainThemeDialogOpen} onClose={() => setMainThemeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMainTheme ? 'Edit Theme' : 'New Theme'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={mainThemeForm.name}
              onChange={(e) => setMainThemeForm({ ...mainThemeForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={mainThemeForm.description}
              onChange={(e) => setMainThemeForm({ ...mainThemeForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Exploration"
              value={mainThemeForm.exploration}
              onChange={(e) => setMainThemeForm({ ...mainThemeForm, exploration: e.target.value })}
              multiline
              rows={3}
              fullWidth
              helperText="How is this theme explored in the story?"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMainThemeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitMainTheme}
            variant="contained"
            disabled={!mainThemeForm.name.trim()}
          >
            {editingMainTheme ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Motif Dialog */}
      <Dialog open={motifDialogOpen} onClose={() => setMotifDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMotif ? 'Edit Motif' : 'New Motif'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={motifForm.name}
              onChange={(e) => setMotifForm({ ...motifForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={motifForm.description}
              onChange={(e) => setMotifForm({ ...motifForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Purpose"
              value={motifForm.purpose}
              onChange={(e) => setMotifForm({ ...motifForm, purpose: e.target.value })}
              multiline
              rows={2}
              fullWidth
              helperText="What is the purpose of this motif in the story?"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMotifDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitMotif}
            variant="contained"
            disabled={!motifForm.name.trim()}
          >
            {editingMotif ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Symbol Dialog */}
      <Dialog open={symbolDialogOpen} onClose={() => setSymbolDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSymbol ? 'Edit Symbol' : 'New Symbol'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={symbolForm.name}
              onChange={(e) => setSymbolForm({ ...symbolForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Meaning"
              value={symbolForm.meaning}
              onChange={(e) => setSymbolForm({ ...symbolForm, meaning: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Occurrences
              </Typography>
              <Stack spacing={2}>
                {symbolForm.occurrences.map((occurrence, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      position: 'relative'
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveOccurrence(index)}
                      sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Typography variant="body2">
                      Context: {occurrence.context}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Significance: {occurrence.significance}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    label="Context"
                    value={occurrenceForm.context}
                    onChange={(e) => setOccurrenceForm({ ...occurrenceForm, context: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Significance"
                    value={occurrenceForm.significance}
                    onChange={(e) => setOccurrenceForm({ ...occurrenceForm, significance: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <Button
                    onClick={handleAddOccurrence}
                    variant="outlined"
                    size="small"
                  >
                    Add
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSymbolDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitSymbol}
            variant="contained"
            disabled={!symbolForm.name.trim()}
          >
            {editingSymbol ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}