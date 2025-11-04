import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import ImageUploader from './ImageUploader';
import eventsApiService from '../services/eventsApi';

const ImageManager = ({ 
  open, 
  onClose, 
  eventId, 
  eventName = 'Event',
  user = null
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load images when dialog opens
  useEffect(() => {
    if (open && eventId) {
      loadEventImages();
    }
  }, [open, eventId]);

  const loadEventImages = async () => {
    try {
      setLoading(true);
      setError('');
      
      const eventImages = await eventsApiService.getEventImages(eventId);
      console.log('Loaded event images:', eventImages);
      
      // Handle different response structures
      let imagesList = [];
      if (Array.isArray(eventImages)) {
        imagesList = eventImages;
      } else if (eventImages?.images && Array.isArray(eventImages.images)) {
        imagesList = eventImages.images;
      } else if (eventImages?.data && Array.isArray(eventImages.data)) {
        imagesList = eventImages.data;
      }
      
      setImages(imagesList);
    } catch (error) {
      console.error('Error loading event images:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to load images';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = async (newImages) => {
    // Find newly added images (ones without an ID from the server)
    const addedImages = newImages.filter(img => 
      !images.some(existingImg => existingImg.id === img.id)
    );

    // Find removed images
    const removedImages = images.filter(img => 
      !newImages.some(newImg => newImg.id === img.id)
    );

    try {
      // Handle uploads
      for (const newImage of addedImages) {
        if (newImage.file || newImage.url.startsWith('blob:')) {
          // This is a new upload
          const formData = new FormData();
          
          // If we have the original file, use it
          if (newImage.file) {
            formData.append('image', newImage.file);
          } else {
            // Convert blob URL back to file if needed
            const response = await fetch(newImage.url);
            const blob = await response.blob();
            formData.append('image', blob, newImage.alt_text || 'image.jpg');
          }
          
          formData.append('alt_text', newImage.alt_text || '');
          
          try {
            if (!user) {
              throw new Error('User information is required for image upload');
            }
            const uploadedImage = await eventsApiService.addEventImage(user, eventId, formData);
            console.log('Image uploaded successfully:', uploadedImage);
            
            showSnackbar('Image uploaded successfully', 'success');
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            showSnackbar('Failed to upload image', 'error');
          }
        }
      }

      // Handle deletions
      for (const removedImage of removedImages) {
        try {
          if (!user) {
            throw new Error('User information is required for image deletion');
          }
          await eventsApiService.deleteEventImage(user, eventId, removedImage.id);
          console.log('Image deleted successfully:', removedImage.id);
          showSnackbar('Image deleted successfully', 'success');
        } catch (deleteError) {
          console.error('Error deleting image:', deleteError);
          showSnackbar('Failed to delete image', 'error');
        }
      }

      // Reload images to get the latest state from server
      if (addedImages.length > 0 || removedImages.length > 0) {
        await loadEventImages();
      } else {
        // Just update local state if no API calls were made
        setImages(newImages);
      }

    } catch (error) {
      console.error('Error managing images:', error);
      showSnackbar('Error managing images', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSetPrimary = async (image) => {
    try {
      await eventsApiService.setPrimaryImage(eventId, image.id);
      console.log('Primary image set successfully:', image.id);
      showSnackbar('Primary image updated successfully', 'success');
      
      // Update local state to reflect the change
      setImages(prevImages => 
        prevImages.map(img => ({
          ...img,
          is_primary: img.id === image.id
        }))
      );
    } catch (error) {
      console.error('Error setting primary image:', error);
      showSnackbar('Failed to set primary image', 'error');
    }
  };

  const handleClose = () => {
    setImages([]);
    setError('');
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Typography variant="h6">
            Manage Images - {eventName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload and manage images for this event
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          {loading && images.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading images...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              <Button 
                size="small" 
                onClick={loadEventImages}
                sx={{ ml: 2 }}
              >
                Retry
              </Button>
            </Alert>
          ) : (
            <ImageUploader
              eventId={eventId}
              images={images}
              onImagesChange={handleImagesChange}
              onSetPrimary={handleSetPrimary}
              maxImages={20}
              maxSizeMB={10}
              acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
              disabled={loading}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Close
          </Button>
          <Button 
            variant="outlined" 
            onClick={loadEventImages}
            disabled={loading}
          >
            Refresh
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ImageManager;
