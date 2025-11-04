import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Card,
  CardMedia,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  PhotoCamera as CameraIcon,
  Close as CloseIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

const ImageUploader = ({ 
  eventId, 
  images = [], 
  onImagesChange,
  onSetPrimary,
  maxImages = 10,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
console.log(images);
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      // Validate files
      for (const file of files) {
        // Check file type
        if (!acceptedTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}. Accepted types: ${acceptedTypes.join(', ')}`);
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          throw new Error(`File ${file.name} is too large (${fileSizeMB.toFixed(2)}MB). Maximum size: ${maxSizeMB}MB`);
        }
      }

      // Check total images limit
      if (images.length + files.length > maxImages) {
        throw new Error(`Cannot upload ${files.length} files. Maximum ${maxImages} images allowed (currently have ${images.length})`);
      }

      // Upload files one by one
      const uploadedImages = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('alt_text', file.name);

        // Create a preview image object for immediate display
        const previewImage = {
          id: `temp_${Date.now()}_${Math.random()}`,
          url: URL.createObjectURL(file),
          alt_text: file.name,
          size: file.size,
          type: file.type,
          file: file, // Keep reference to original file for upload
          uploaded_at: new Date().toISOString(),
          isTemporary: true
        };

        uploadedImages.push(previewImage);
      }

      // Update parent component
      if (onImagesChange) {
        onImagesChange([...images, ...uploadedImages]);
      }

    } catch (error) {
      console.error('Error uploading images:', error);
      setError(error.message);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageDelete = async (imageId) => {
    try {
      setUploading(true);
      
      // Here you would call your API service to delete the image
      // For now, we'll just remove it from the local state
      const updatedImages = images.filter(img => img.id !== imageId);
      
      if (onImagesChange) {
        onImagesChange(updatedImages);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    } finally {
      setUploading(false);
    }
  };

  const handleImagePreview = (image) => {
    setPreviewImage(image);
    setPreviewOpen(true);
  };

  const handleSetPrimary = async (image) => {
    if (onSetPrimary) {
      try {
        setUploading(true);
        await onSetPrimary(image);
      } catch (error) {
        console.error('Error setting primary image:', error);
        setError('Failed to set primary image');
      } finally {
        setUploading(false);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Box sx={{ mb: 3 }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept={acceptedTypes.join(',')}
          style={{ display: 'none' }}
          disabled={disabled || uploading}
        />
        
        <Button
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || images.length >= maxImages}
          sx={{ mr: 2 }}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {images.length}/{maxImages} images • Max {maxSizeMB}MB each • {acceptedTypes.join(', ')}
        </Typography>
      </Box>

      {/* Images Grid */}
      {images.length > 0 ? (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={image.id || index}>
              <Card sx={{ 
                position: 'relative', 
                height: 200,
                border: image.is_primary ? '3px solid #1976d2' : 'none',
                boxShadow: image.is_primary ? '0 4px 12px rgba(25, 118, 210, 0.3)' : undefined
              }}>
                {/* Primary Badge */}
                {image.is_primary && (
                  <Badge
                    badgeContent="PRIMARY"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 2,
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        px: 1
                      }
                    }}
                  />
                )}
                
                <CardMedia
                  component="img"
                  height="140"
                  image={image.url || `https://admin.discount.com.ge/${image.image}`}
                  alt={image.alt_text || `Event image ${index + 1}`}
                  sx={{ 
                    objectFit: 'cover',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => handleImagePreview(image)}
                />
                
                <CardActions sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  p: 0.5,
                  background: 'rgba(0,0,0,0.5)',
                  minHeight: 'auto',
                  gap: 0.5
                }}>
                  {!image.isTemporary && (
                    <Tooltip title={image.is_primary ? "Primary image" : "Set as primary"}>
                      <IconButton
                        size="small"
                        onClick={() => handleSetPrimary(image)}
                        disabled={uploading || image.is_primary}
                        sx={{ 
                          color: image.is_primary ? '#ffd700' : 'white',
                          '&:hover': { color: '#ffd700' }
                        }}
                      >
                        {image.is_primary ? (
                          <StarIcon fontSize="small" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete image">
                    <IconButton
                      size="small"
                      onClick={() => handleImageDelete(image.id)}
                      disabled={uploading}
                      sx={{ color: 'white' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>

                {/* Image Info */}
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" noWrap>
                    {image.alt_text || `Image ${index + 1}`}
                    {image.is_primary && (
                      <StarIcon 
                        sx={{ 
                          fontSize: '0.8rem', 
                          color: '#1976d2', 
                          ml: 0.5,
                          verticalAlign: 'middle'
                        }} 
                      />
                    )}
                  </Typography>
                  {image.size && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatFileSize(image.size)}
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: 'grey.50',
            cursor: disabled ? 'not-allowed' : 'pointer',
            '&:hover': disabled ? {} : {
              bgcolor: 'grey.100',
              borderColor: 'primary.main'
            }
          }}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <ImageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No images uploaded
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click to upload or drag and drop images here
          </Typography>
        </Box>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {previewImage?.alt_text || 'Image Preview'}
          </Typography>
          <IconButton onClick={() => setPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {previewImage && (
            <img
              src={`https://admin.discount.com.ge/${previewImage.image}`}
              alt={previewImage.alt_text || 'Preview'}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUploader;
