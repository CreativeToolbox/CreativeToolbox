import axios from 'axios';
import { auth } from '../firebase/config';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : 'https://document-editor-api.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Optional: Add timeout
  timeout: 10000, // 10 seconds
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Update the request interceptor
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      console.log('Getting token for request:', config.url);
      const token = await user.getIdToken(true); // Force refresh
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request');
    } catch (error) {
      console.error('Error getting token:', error);
    }
  } else {
    console.log('No user logged in for request:', config.url);
  }
  return config;
});

// Simplify the response interceptor to avoid double-refresh issues
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Force user to reauthenticate if we get a 401
      auth.signOut();
    }
    return Promise.reject(error);
  }
);

// API endpoints
// Update the getDocuments function
export const getDocuments = (mode = 'public') => {
  return api.get(`/documents?mode=${mode}`);
};
export const getDocument = (id) => api.get(`/documents/${id}`);
export const createDocument = (data) => api.post('/documents', data);
export const updateDocument = async (id, data) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    
    const token = await user.getIdToken();
    console.log('Updating document with token:', token.substring(0, 20) + '...');
    
    const response = await api.put(`/documents/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// Optional: Add health check endpoint
export const checkApiHealth = () => api.get('/health');

// Get all characters for a document
export const getDocumentCharacters = async (documentId) => {
  return api.get(`/characters/document/${documentId}`);
};

// Get a single character
export const getCharacter = async (characterId) => {
  return api.get(`/characters/${characterId}`);
};

// Create a new character
export const createCharacter = async (characterData) => {
  try {
    console.log('API: Creating character with data:', characterData);
    const response = await api.post('/characters', characterData);
    console.log('API: Create character response:', response.data);
    return response;
  } catch (error) {
    console.error('API: Error creating character:', error.response?.data || error.message);
    throw error;
  }
};

// Update a character
export const updateCharacter = async (characterId, updates) => {
  try {
    console.log('API: Updating character:', characterId, 'with data:', updates);
    const response = await api.put(`/characters/${characterId}`, updates);
    console.log('API: Update character response:', response.data);
    return response;
  } catch (error) {
    console.error('API: Error updating character:', error.response?.data || error.message);
    throw error;
  }
};

// Delete a character
export const deleteCharacter = async (characterId) => {
  return api.delete(`/characters/${characterId}`);
};

// Toggle character tracking for a document
export const toggleCharacterTracking = async (documentId, enabled) => {
  return api.post(`${API_BASE_URL}/characters/document/${documentId}/tracking`, { enabled });
};

export const getStory = async (documentId) => {
  console.log('Fetching story for document:', documentId);
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    
    const token = await user.getIdToken();
    const response = await api.get(`/stories/document/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Log the response data
    console.log('Story API response:', response.data);
    
    // Return default values if no story exists
    if (!response.data) {
      return {
        mode: { narrative: 50, dialogue: 50 },
        mood: 'peaceful'
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
};

export const updateStoryMood = async (documentId, mood) => {
  console.log('Updating story mood:', { documentId, mood });
  return api.put(
    `${API_BASE_URL}/stories/document/${documentId}/mood`, 
    { mood }
  );
};

// Add this new export for story mode updates
export const updateStoryMode = async (documentId, modeData) => {
  console.log('Updating story mode:', { documentId, modeData });
  return api.put(
    `${API_BASE_URL}/stories/document/${documentId}/mode`, 
    modeData
  );
};

// Add new function for character role updates
export const updateCharacterRole = async (characterId, role) => {
  return api.put(`/characters/${characterId}/role`, { role });
};

// Add new function for character relationships
export const updateCharacterRelationships = async (characterId, relationships) => {
  return api.put(`/characters/${characterId}/relationships`, { relationships });
};

// Add these new plot-related functions
export const getPlot = async (documentId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    
    const token = await user.getIdToken();
    const response = await api.get(`/plots/document/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Plot API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching plot:', error);
    throw error;
  }
};

export const updatePlot = async (documentId, data) => {
  const token = await auth.currentUser.getIdToken();
  return api.put(`/plots/document/${documentId}`, data, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const addPlotPoint = async (documentId, data) => {
  const token = await auth.currentUser.getIdToken();
  return api.post(`/plots/document/${documentId}/points`, data, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const updatePlotPoint = async (documentId, pointId, data) => {
  const token = await auth.currentUser.getIdToken();
  return api.put(`/plots/document/${documentId}/points/${pointId}`, data, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const deletePlotPoint = async (documentId, pointId) => {
  const token = await auth.currentUser.getIdToken();
  return api.delete(`/plots/document/${documentId}/points/${pointId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Add these setting-related functions
export const getSetting = async (documentId) => {
  return api.get(`/settings/document/${documentId}`);
};

export const updateSetting = async (documentId, settingData) => {
  return api.put(`/settings/document/${documentId}`, settingData);
};

export const addLocation = async (documentId, locationData) => {
  return api.post(`/settings/document/${documentId}/locations`, locationData);
};

export const updateLocation = async (documentId, locationId, updates) => {
  return api.put(`/settings/document/${documentId}/locations/${locationId}`, updates);
};

export const deleteLocation = async (documentId, locationId) => {
  return api.delete(`/settings/document/${documentId}/locations/${locationId}`);
};

export const addTimelinePeriod = async (documentId, periodData) => {
  return api.post(`/settings/document/${documentId}/timeline`, periodData);
};

export const updateTimelinePeriod = async (documentId, periodId, updates) => {
  return api.put(`/settings/document/${documentId}/timeline/${periodId}`, updates);
};

export const deleteTimelinePeriod = async (documentId, periodId) => {
  return api.delete(`/settings/document/${documentId}/timeline/${periodId}`);
};

// Add these theme-related functions
export const getTheme = async (documentId) => {
  return api.get(`/themes/document/${documentId}`);
};

export const updateTheme = async (documentId, themeData) => {
  return api.put(`/themes/document/${documentId}`, themeData);
};

// Main themes
export const addMainTheme = async (documentId, themeData) => {
  return api.post(`/themes/document/${documentId}/main-themes`, themeData);
};

export const updateMainTheme = async (documentId, themeId, updates) => {
  return api.put(`/themes/document/${documentId}/main-themes/${themeId}`, updates);
};

export const deleteMainTheme = async (documentId, themeId) => {
  return api.delete(`/themes/document/${documentId}/main-themes/${themeId}`);
};

// Motifs
export const addMotif = async (documentId, motifData) => {
  return api.post(`/themes/document/${documentId}/motifs`, motifData);
};

export const updateMotif = async (documentId, motifId, updates) => {
  return api.put(`/themes/document/${documentId}/motifs/${motifId}`, updates);
};

export const deleteMotif = async (documentId, motifId) => {
  return api.delete(`/themes/document/${documentId}/motifs/${motifId}`);
};

// Symbols
export const addSymbol = async (documentId, symbolData) => {
  return api.post(`/themes/document/${documentId}/symbols`, symbolData);
};

export const updateSymbol = async (documentId, symbolId, updates) => {
  return api.put(`/themes/document/${documentId}/symbols/${symbolId}`, updates);
};

export const deleteSymbol = async (documentId, symbolId) => {
  return api.delete(`/themes/document/${documentId}/symbols/${symbolId}`);
};