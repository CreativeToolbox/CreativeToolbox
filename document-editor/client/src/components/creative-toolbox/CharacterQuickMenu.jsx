import { Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

export default function CharacterQuickMenu({ characters, anchorEl, onClose, onInsert }) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      {characters.map(char => (
        <MenuItem 
          key={char._id} 
          onClick={() => {
            onInsert(`${char.name}`);
            onClose();
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">{char.name}</Typography>
        </MenuItem>
      ))}
    </Menu>
  );
} 