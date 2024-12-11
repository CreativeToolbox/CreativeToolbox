import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'  // Local development
  : 'https://document-editor-api.onrender.com/api'; // Production

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

// API endpoints
export const getDocuments = () => api.get('/documents');
export const getDocument = (id) => api.get(`/documents/${id}`);
export const createDocument = (data) => api.post('/documents', data);
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// Optional: Add health check endpoint
export const checkApiHealth = () => api.get('/health');

// Get all characters for a document
export const getDocumentCharacters = async (documentId) => {
  return axios.get(`${API_BASE_URL}/characters/document/${documentId}`);
};

// Get a single character
export const getCharacter = async (characterId) => {
  return axios.get(`${API_BASE_URL}/characters/${characterId}`);
};

// Create a new character
export const createCharacter = async (characterData) => {
  return axios.post(`${API_BASE_URL}/characters`, characterData);
};

// Update a character
export const updateCharacter = async (characterId, updates) => {
  return axios.put(`${API_BASE_URL}/characters/${characterId}`, updates);
};

// Delete a character
export const deleteCharacter = async (characterId) => {
  return axios.delete(`${API_BASE_URL}/characters/${characterId}`);
};

// Toggle character tracking for a document
export const toggleCharacterTracking = async (documentId, enabled) => {
  return axios.post(`${API_BASE_URL}/characters/document/${documentId}/tracking`, { enabled });
};

export const getStory = async (documentId) => {
  console.log('Fetching story for document:', documentId);
  console.log('API URL:', `${API_BASE_URL}/stories/document/${documentId}`);
  return axios.get(`${API_BASE_URL}/stories/document/${documentId}`);
};

export const updateStoryMood = async (documentId, mood) => {
  console.log('Updating story mood:', { documentId, mood });
  return axios.put(
    `${API_BASE_URL}/stories/document/${documentId}/mood`, 
    { mood }
  );
};

// Add this new export for story mode updates
export const updateStoryMode = async (documentId, modeData) => {
  console.log('Updating story mode:', { documentId, modeData });
  return axios.put(
    `${API_BASE_URL}/stories/document/${documentId}/mode`, 
    modeData
  );
};