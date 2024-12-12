import { useState } from 'react';
import {
  Popover,
  Card,
  CardContent,
  Typography,
  Chip,
  Box
} from '@mui/material';

export default function CharacterReference({ character, children }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        component="span"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        sx={{ cursor: 'pointer', color: 'primary.main' }}
      >
        {children}
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Card sx={{ maxWidth: 300, m: 1 }}>
          <CardContent>
            <Typography variant="h6">{character.name}</Typography>
            <Typography color="text.secondary" gutterBottom>
              {character.role}
            </Typography>
            {character.description && (
              <Typography variant="body2" paragraph>
                {character.description}
              </Typography>
            )}
            {character.goals && (
              <Chip 
                label={`Goal: ${character.goals}`}
                size="small"
                color="primary"
                sx={{ mr: 1 }}
              />
            )}
            {character.conflicts && (
              <Chip 
                label={`Conflict: ${character.conflicts}`}
                size="small"
                color="error"
              />
            )}
          </CardContent>
        </Card>
      </Popover>
    </>
  );
} 