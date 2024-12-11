import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ModePanel from './panels/ModePanel';
import MoodPanel from './panels/MoodPanel';
import PlotPanel from './panels/PlotPanel';
import ThemesPanel from './panels/ThemesPanel';
import CharactersPanel from './panels/CharactersPanel';
import SettingsPanel from './panels/SettingsPanel';

export default function CreativeToolbox({ documentId }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box>
      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Mode" />
        <Tab label="Mood" />
        <Tab label="Plot" />
        <Tab label="Themes" />
        <Tab label="Characters" />
        <Tab label="Settings" />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {activeTab === 0 && <ModePanel documentId={documentId} />}
        {activeTab === 1 && <MoodPanel documentId={documentId} />}
        {activeTab === 2 && <PlotPanel documentId={documentId} />}
        {activeTab === 3 && <ThemesPanel documentId={documentId} />}
        {activeTab === 4 && <CharactersPanel documentId={documentId} />}
        {activeTab === 5 && <SettingsPanel documentId={documentId} />}
      </Box>
    </Box>
  );
} 