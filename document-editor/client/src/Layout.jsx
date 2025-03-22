import { createDocument } from '../services/api';

export default function Layout() {
  const handleNewStory = async () => {
    try {
      const newDoc = {
        title: 'Untitled Story',
        content: '',
        userId: currentUser.uid,
        visibility: 'private',
        theme: {
          mainThemes: [],
          motifs: [],
          symbols: []
        }
      };
      
      const response = await createDocument(newDoc);
      
      if (response?.data?._id) {
        navigate(`/dashboard/documents/${response.data._id}/edit`);
      } else {
        console.error('Invalid response from server:', response);
      }
    } catch (error) {
      console.error('Error creating new story:', error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* ... other toolbar items ... */}
          
          {currentUser ? (
            <>
              <Button 
                color="inherit" 
                onClick={() => navigate('/dashboard')}
              >
                My Stories
              </Button>
              <Button 
                color="inherit" 
                onClick={handleNewStory}
              >
                New Story
              </Button>
            </>
          ) : (
            // ... guest navigation remains the same ...
          )}
          
          {/* ... rest of the toolbar ... */}
        </Toolbar>
      </AppBar>

      {/* ... rest of the component ... */}
    </>
  );
} 