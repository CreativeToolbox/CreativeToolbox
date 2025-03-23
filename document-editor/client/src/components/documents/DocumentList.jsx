const handleDeleteConfirm = async (documentId) => {
  try {
    setDeletingId(documentId);
    console.log('Attempting to delete document:', documentId);
    
    await deleteDocument(documentId);
    console.log('Document deleted successfully');
    
    // Remove the document from the list
    setDocuments(prevDocs => prevDocs.filter(doc => doc._id !== documentId));
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Document deleted successfully',
      severity: 'success'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    setSnackbar({
      open: true,
      message: 'Failed to delete document',
      severity: 'error'
    });
  } finally {
    setDeletingId(null);
    setDeleteDialogOpen(false);
  }
}; 