import { Tooltip, Card, Typography } from '@mui/material';

export default function CharacterTooltip({ character, children }) {
  return (
    <Tooltip
      title={
        <Card sx={{ p: 1, maxWidth: 300 }}>
          <Typography variant="subtitle2">{character.name}</Typography>
          <Typography variant="body2">{character.description}</Typography>
          {character.traits.length > 0 && (
            <Typography variant="caption" display="block">
              Traits: {character.traits.join(', ')}
            </Typography>
          )}
        </Card>
      }
      arrow
    >
      {children}
    </Tooltip>
  );
} 