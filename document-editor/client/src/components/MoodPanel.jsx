const loadStoryMood = async () => {
  try {
    console.log('Loading story mood for document:', documentId);
    const story = await getStory(documentId);
    console.log('Loaded story data:', story); // Add this to see the actual response
    
    // Check if story exists and has mood property
    if (story && story.mood) {
      setMood(story.mood);
    } else {
      // Set default mood if no story exists
      setMood('peaceful');
      console.log('Using default mood value');
    }
  } catch (error) {
    console.error('Error loading story mood:', error);
    // Set default value on error
    setMood('peaceful');
    if (error.response?.status === 401) {
      console.log('Auth error, current user:', auth.currentUser);
    }
  }
}; 