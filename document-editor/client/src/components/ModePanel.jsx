const loadStoryMode = async () => {
  try {
    console.log('Loading story mode for document:', documentId);
    const story = await getStory(documentId);
    console.log('Loaded story data:', story);
    
    // Check if story exists and has mode property
    if (story && story.mode) {
      setMode(story.mode);
    } else {
      // Set default mode if no story exists
      setMode({ narrative: 50, dialogue: 50 });
      console.log('Using default mode values');
    }
  } catch (error) {
    console.error('Error loading story mode:', error);
    // Set default values on error
    setMode({ narrative: 50, dialogue: 50 });
    if (error.response?.status === 401) {
      console.log('Auth error, current user:', auth.currentUser);
    }
  }
}; 