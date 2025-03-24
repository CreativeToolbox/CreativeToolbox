import { memo, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const SceneManager = memo(({ documentId }) => {
  const [scenes, setScenes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScene, setEditingScene] = useState(null);
  const [sceneForm, setSceneForm] = useState({
    title: '',
    description: '',
    location: '',
    timeOfDay: '',
    characters: ''
  });

  const handleOpenDialog = (scene = null) => {
    if (scene) {
      setEditingScene(scene);
      setSceneForm(scene);
    } else {
      setEditingScene(null);
      setSceneForm({
        title: '',
        description: '',
        location: '',
        timeOfDay: '',
        characters: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingScene(null);
  };

  const handleSaveScene = () => {
    if (editingScene) {
      setScenes(scenes.map(scene => 
        scene.id === editingScene.id ? { ...sceneForm, id: editingScene.id } : scene
      ));
    } else {
      setScenes([...scenes, { ...sceneForm, id: Date.now().toString() }]);
    }
    handleCloseDialog();
  };

  const handleDeleteScene = (sceneId) => {
    setScenes(scenes.filter(scene => scene.id !== sceneId));
  };

  return (
    <Box sx={{
      height: '100%',
      borderRight: 1,
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="subtitle1">
          Scene Manager
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="small"
        >
          Add Scene
        </Button>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {scenes.map((scene) => (
          <ListItem
            key={scene.id}
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={() => handleOpenDialog(scene)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={() => handleDeleteScene(scene.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            }
          >
            <ListItemText
              primary={scene.title || 'Untitled Scene'}
              secondary={scene.description}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingScene ? 'Edit Scene' : 'Add New Scene'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Scene Title"
              fullWidth
              value={sceneForm.title}
              onChange={(e) => setSceneForm({ ...sceneForm, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={sceneForm.description}
              onChange={(e) => setSceneForm({ ...sceneForm, description: e.target.value })}
            />
            <TextField
              label="Location"
              fullWidth
              value={sceneForm.location}
              onChange={(e) => setSceneForm({ ...sceneForm, location: e.target.value })}
            />
            <TextField
              label="Time of Day"
              fullWidth
              value={sceneForm.timeOfDay}
              onChange={(e) => setSceneForm({ ...sceneForm, timeOfDay: e.target.value })}
            />
            <TextField
              label="Characters Present"
              fullWidth
              value={sceneForm.characters}
              onChange={(e) => setSceneForm({ ...sceneForm, characters: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveScene} variant="contained">
            {editingScene ? 'Save Changes' : 'Add Scene'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

SceneManager.displayName = 'SceneManager';

export default SceneManager; 