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

// Add at the top of the file
let cachedToken = null;
let tokenExpiryTime = null;

// Add this function to manage token caching
const getAuthToken = async () => {
  // If we have a cached token and it's not expired, use it
  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  // Otherwise, get a new token
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user logged in');
  }

  const token = await user.getIdToken();
  cachedToken = token;
  // Set expiry to 55 minutes (tokens typically last 1 hour)
  tokenExpiryTime = Date.now() + (55 * 60 * 1000);
  return token;
};

// Update the request interceptor
api.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error('Error getting token:', error);
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
export const getDocument = async (id) => {
  try {
    console.log('Fetching document:', id);
    const response = await api.get(`/documents/${id}`);
    console.log('Document response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};
export const createDocument = async (data) => {
  try {
    console.log('Creating new document with data:', data);
    const response = await api.post('/documents', data);
    console.log('Create document response:', response);
    
    if (!response?.data?._id) {
      throw new Error('Invalid response: No document ID received');
    }
    
    return response;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};
export const updateDocument = async (id, data) => {
  try {
    console.log('Updating document:', { id, data });
    const response = await api.put(`/documents/${id}`, data);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};
export const deleteDocument = async (id) => {
  try {
    console.log('Deleting document:', id);
    const response = await api.delete(`/documents/${id}`);
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Optional: Add health check endpoint
export const checkApiHealth = () => api.get('/health');

// Get all characters for a document
export const getDocumentCharacters = (documentId) => 
  api.get(`/characters/document/${documentId}`);

// Get a single character
export const getCharacter = (characterId) => 
  api.get(`/characters/${characterId}`);

// Create a new character
export const createCharacter = async (characterData) => {
  try {
    const response = await api.post('/characters', characterData);
    return response;
  } catch (error) {
    console.error('API: Error creating character:', error);
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

// Update the getPlot function to match the pattern of getStory
export const getPlot = async (documentId) => {
  console.log('Fetching plot for document:', documentId);
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
    
    // Return default values if no plot exists
    if (!response.data) {
      return {
        structure: 'three_act',
        mainConflict: '',
        synopsis: '',
        plotPoints: [],
        mainConflictCharacters: []
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching plot:', error);
    throw error;
  }
};

// Update other plot-related functions to include auth headers
export const updatePlot = async (documentId, plotData) => {
  const token = await auth.currentUser?.getIdToken();
  return api.put(
    `/plots/document/${documentId}`, 
    plotData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

export const addPlotPoint = async (documentId, pointData) => {
  const token = await auth.currentUser?.getIdToken();
  return api.post(
    `/plots/document/${documentId}/points`, 
    pointData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

export const updatePlotPoint = async (documentId, pointId, data) => {
  const token = await auth.currentUser?.getIdToken();
  return api.put(
    `/plots/document/${documentId}/points/${pointId}`, 
    data,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

export const deletePlotPoint = async (documentId, pointId) => {
  const token = await auth.currentUser?.getIdToken();
  return api.delete(
    `/plots/document/${documentId}/points/${pointId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

// Settings endpoints
export const getSetting = async (documentId) => {
  const token = await auth.currentUser?.getIdToken();
  return api.get(`/settings/document/${documentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const updateSetting = async (documentId, settingData) => {
  const token = await auth.currentUser?.getIdToken();
  return api.put(
    `/settings/document/${documentId}`, 
    settingData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

// Location endpoints
export const addLocation = async (documentId, locationData) => {
  const token = await auth.currentUser?.getIdToken();
  return api.post(
    `/settings/document/${documentId}/locations`, 
    locationData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

export const updateLocation = async (documentId, locationId, updates) => {
  const token = await auth.currentUser?.getIdToken();
  return api.put(
    `/settings/document/${documentId}/locations/${locationId}`, 
    updates,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

export const deleteLocation = async (documentId, locationId) => {
  const token = await auth.currentUser?.getIdToken();
  return api.delete(
    `/settings/document/${documentId}/locations/${locationId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

// Timeline period endpoints
export const addTimelinePeriod = async (documentId, periodData) => {
  const token = await auth.currentUser?.getIdToken();
  return api.post(
    `/settings/document/${documentId}/timeline`, 
    periodData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

export const updateTimelinePeriod = async (documentId, periodId, updates) => {
  const token = await auth.currentUser?.getIdToken();
  return api.put(
    `/settings/document/${documentId}/timeline/${periodId}`, 
    updates,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

export const deleteTimelinePeriod = async (documentId, periodId) => {
  const token = await auth.currentUser?.getIdToken();
  return api.delete(
    `/settings/document/${documentId}/timeline/${periodId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

// Themes endpoints
export const getTheme = (documentId) => 
  api.get(`/themes/document/${documentId}`);

export const updateTheme = (documentId, themeData) => 
  api.put(`/themes/document/${documentId}`, themeData);

// Theme-specific endpoints
export const addMainTheme = (documentId, themeData) => 
  api.post(`/themes/document/${documentId}/main-themes`, themeData);

export const updateMainTheme = (documentId, themeId, updates) => 
  api.put(`/themes/document/${documentId}/main-themes/${themeId}`, updates);

export const deleteMainTheme = (documentId, themeId) => 
  api.delete(`/themes/document/${documentId}/main-themes/${themeId}`);

// Motifs
export const addMotif = (documentId, motifData) => 
  api.post(`/themes/document/${documentId}/motifs`, motifData);

export const updateMotif = (documentId, motifId, updates) => 
  api.put(`/themes/document/${documentId}/motifs/${motifId}`, updates);

export const deleteMotif = (documentId, motifId) => 
  api.delete(`/themes/document/${documentId}/motifs/${motifId}`);

// Symbols
export const addSymbol = (documentId, symbolData) => 
  api.post(`/themes/document/${documentId}/symbols`, symbolData);

export const updateSymbol = (documentId, symbolId, updates) => 
  api.put(`/themes/document/${documentId}/symbols/${symbolId}`, updates);

export const deleteSymbol = (documentId, symbolId) => 
  api.delete(`/themes/document/${documentId}/symbols/${symbolId}`);