import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  BugReport,
  Image as ImageIcon,
  Map as MapIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  DeleteOutline as DeleteImageIcon,
  EditOutlined as EditImageIcon,
  CheckCircle as CheckCircleIcon,
  StarBorder as FeaturedIcon,
} from '@mui/icons-material';
import createAxiosInstance from '../services/axios';
import eventsApiService from '../services/eventsApi';
import { categoryApi, cityApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ImageManager from '../components/ImageManager';
import MapPicker from '../components/MapPicker';

const Events = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    search: ''
  });
  const [testing, setTesting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [imageManagerOpen, setImageManagerOpen] = useState(false);
  const [selectedEventForImages, setSelectedEventForImages] = useState(null);
  
  // Map picker state
  const [openMapPicker, setOpenMapPicker] = useState(false);
  
  // Event details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Image management state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [imageUploadData, setImageUploadData] = useState({
    image: null,
    alt_text: '',
    is_primary: false
  });
  const [imageUploading, setImageUploading] = useState(false);
  
  // Image update modal state
  const [imageUpdateModalOpen, setImageUpdateModalOpen] = useState(false);
  const [selectedImageForUpdate, setSelectedImageForUpdate] = useState(null);
  const [imageUpdateData, setImageUpdateData] = useState({
    alt_text: '',
    is_primary: false
  });
  const [imageUpdating, setImageUpdating] = useState(false);

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching categories from API...');
      
      const response = await categoryApi.getAll();
      console.log('Categories API response:', response);
      
      let categoriesData = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response && response.results && Array.isArray(response.results)) {
        categoriesData = response.results;
      } else {
        console.warn('Unexpected categories API response format:', response);
        setCategories([]);
        return;
      }
      
      // Ensure all categories have valid display properties
      const validCategories = categoriesData.map(cat => ({
        id: cat.id || cat.value || 0,
        name: cat.name || cat.label || `Category ${cat.id || cat.value}`,
        label: cat.label || cat.name || `Category ${cat.id || cat.value}`,
        value: cat.value || cat.id || 0
      }));
      
      console.log('Processed categories list:', validCategories);
      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch cities from API
  const fetchCities = async () => {
    try {
      setCitiesLoading(true);
      console.log('Fetching cities from API...');
      
      const response = await cityApi.getAll();
      console.log('Cities API response:', response);
      
      let citiesData = [];
      if (Array.isArray(response)) {
        citiesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        citiesData = response.data;
      } else if (response && response.results && Array.isArray(response.results)) {
        citiesData = response.results;
      } else {
        console.warn('Unexpected cities API response format:', response);
        setCities([]);
        return;
      }
      
      // Ensure all cities have valid display properties
      const validCities = citiesData.map(city => ({
        id: city.id || city.value || 0,
        name: city.name || city.label || `City ${city.id || city.value}`,
        label: city.label || city.name || `City ${city.id || city.value}`,
        value: city.value || city.id || 0
      }));
      
      console.log('Processed cities list:', validCities);
      setCities(validCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      const axiosInstance = createAxiosInstance();
      console.log('Fetching countries from API...');
      
      const response = await axiosInstance.get('/v2/country/list');
      console.log('Countries API response:', response.data);
      
      let countriesData = [];
      if (response.data && Array.isArray(response.data)) {
        countriesData = response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        countriesData = response.data.results;
      } else {
        console.warn('Unexpected countries API response format:', response.data);
        setCountries([]);
        return;
      }
      
      // Ensure all countries have valid display properties
      const validCountries = countriesData.map(country => ({
        id: country.id || country.value || 0,
        name: country.name || country.label || `Country ${country.id || country.value}`,
        label: country.label || country.name || `Country ${country.id || country.value}`,
        value: country.value || country.id || 0
      }));
      
      setCountries(validCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    }
  };

  // API Integration - GET company-specific events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching company events from API...');
      
      const eventsData = await eventsApiService.getCompanyEvents(user);
      console.log('Company events API response:', eventsData);
      console.log('Events retrieved:', eventsData.length);
      
      // Debug: Log categories and cities data
      console.log('Available categories:', categories);
      console.log('Available cities:', cities);
      
      // Ensure all events have valid properties and convert category/city IDs to names
      const validEvents = eventsData.map(event => {
        console.log('Processing event:', event);
        
        // Handle different possible field names for category and city
        const categoryId = event.category || event.category_id || event.categoryId;
        const cityId = event.city || event.city_id || event.cityId;
        
        // Find category and city names
        const categoryObj = categories.find(cat => 
          String(cat.id || cat.value) === String(categoryId)
        );
        const cityObj = cities.find(city => 
          String(city.id || city.value) === String(cityId)
        );
        
        // Handle nested category/city objects
        const categoryName = categoryObj ? (categoryObj.name || categoryObj.label) : 
                           (event.category_name || event.categoryName || 
                            (event.category && event.category.name) || 'Unknown');
        
        const cityName = cityObj ? (cityObj.name || cityObj.label) : 
                        (event.city_name || event.cityName || 
                         (event.city && event.city.name) || 'Unknown');
        
        console.log('Event mapping:', {
          eventId: event.id,
          categoryId,
          cityId,
          categoryName,
          cityName,
          categoryObj: !!categoryObj,
          cityObj: !!cityObj
        });
        
        return {
          ...event,
          id: event.id || 0,
          name: event.name || 'Unnamed Event',
          description: event.description || 'No description',
          category: categoryName,
          city: cityName,
          base_price: event.base_price || '0',
          price_per_person: event.price_per_person || '0',
          location: event.location || 'Unknown location'
        };
      });
      
      setEvents(validEvents);
    } catch (error) {
      console.error('Error fetching company events:', error);
      setError('Failed to load company events. Please try again.');
      
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch company information
  const fetchCompanyInfo = async () => {
    try {
      const companyData = await eventsApiService.getCompanyInfo(user);
      setCompanyInfo(companyData);
      console.log('Company info loaded:', companyData);
    } catch (error) {
      console.error('Error fetching company info:', error);
      setCompanyInfo({ id: null, name: 'Unknown Company', email: null, phone: null });
    }
  };

  // Load events, categories, cities, countries, and company info on component mount
  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchCities();
    fetchCountries();
    fetchCompanyInfo();
  }, []);

  const handleRefresh = () => {
    fetchEvents();
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Debug function to show API response structure
  const handleDebugAPI = async () => {
    try {
      setTesting(true);
      setDebugInfo('Testing events feed API...');
      
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/v2/event/feed');
      
      const debugData = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasResults: response.data?.results ? 'Yes' : 'No',
        hasEvents: response.data?.events ? 'Yes' : 'No',
        dataKeys: response.data ? Object.keys(response.data) : 'No data',
        resultsLength: response.data?.results?.length || 'N/A',
        eventsLength: response.data?.events?.length || 'N/A',
        directLength: Array.isArray(response.data) ? response.data.length : 'N/A'
      };
      
      setDebugInfo(JSON.stringify(debugData, null, 2));
    } catch (error) {
      setDebugInfo(`API Debug Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = !filters.search || 
      event.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Filter by category and city names
    const matchesCategory = !filters.category || event.category === filters.category;
    const matchesCity = !filters.city || event.city === filters.city;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  // Debug: Log counts for troubleshooting
  console.log('Events Count Debug:', {
    totalEvents: events.length,
    filteredEvents: filteredEvents.length,
    activeEvents: filteredEvents.filter(e => e.status === 'active').length,
    categories: categories.length,
    cities: cities.length,
    countries: countries.length,
    filters: filters
  });

  const handleAdd = () => {
    setEditingEvent(null);
    setOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setOpen(true);
  };

  const handleManageImages = (event) => {
    setSelectedEventForImages(event);
    setImageManagerOpen(true);
  };

  // Handle view details button click
  const handleViewDetails = async (event) => {
    console.log('Viewing details for event:', event.name, 'ID:', event.id);
    setDetailsLoading(true);
    setDetailsModalOpen(true);
    
    try {
      const response = await eventsApiService.getEventDetails(event.id);
      console.log('Event details response:', response);
      console.log('Event details keys:', Object.keys(response));
      console.log('Company:', response.company);
      console.log('Company ID:', response.company_id);
      console.log('Latitude:', response.latitude);
      console.log('Longitude:', response.longitude);
      console.log('Lat:', response.lat);
      console.log('Lng:', response.lng);
      console.log('Lon:', response.lon);
      console.log('Full response structure:', JSON.stringify(response, null, 2));
      setEventDetails(response);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setSnackbar({
        open: true,
        message: `Error loading event details: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
      setDetailsModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle close details modal
  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setEventDetails(null);
    setDetailsLoading(false);
  };

  // Handle delete image
  const handleDeleteImage = async (imageId, eventId) => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting image:', imageId, 'from event:', eventId);
      await eventsApiService.deleteEventImage(user, eventId, imageId);
      
      setSnackbar({
        open: true,
        message: 'Image deleted successfully!',
        severity: 'success'
      });
      
      // Refresh event details to show updated data
      if (eventDetails) {
        await handleViewDetails({ id: eventDetails.id });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setSnackbar({
        open: true,
        message: `Error deleting image: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    }
  };

  // Handle edit image button click
  const handleEditImage = (image, eventId) => {
    console.log('Editing image:', image, 'for event:', eventId);
    setSelectedImageForUpdate({ ...image, eventId });
    setImageUpdateData({
      alt_text: image.alt_text || '',
      is_primary: image.is_primary || false
    });
    setImageUpdateModalOpen(true);
  };

  // Handle close image update modal
  const handleCloseImageUpdateModal = () => {
    setImageUpdateModalOpen(false);
    setSelectedImageForUpdate(null);
    setImageUpdateData({
      alt_text: '',
      is_primary: false
    });
    setImageUpdating(false);
  };

  // Handle image update form submission
  const handleImageUpdate = async () => {
    if (!selectedImageForUpdate) {
      setSnackbar({
        open: true,
        message: 'No image selected for update',
        severity: 'error'
      });
      return;
    }

    if (!imageUpdateData.alt_text.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide alternative text for the image',
        severity: 'error'
      });
      return;
    }

    setImageUpdating(true);

    try {
      const updateData = {
        alt_text: imageUpdateData.alt_text.trim(),
        is_primary: imageUpdateData.is_primary
      };

      console.log('Updating image:', selectedImageForUpdate.id, 'with data:', updateData);
      
      const response = await eventsApiService.updateEventImage(
        user,
        selectedImageForUpdate.eventId, 
        selectedImageForUpdate.id, 
        updateData
      );

      console.log('Image update response:', response);

      setSnackbar({
        open: true,
        message: 'Image updated successfully!',
        severity: 'success'
      });

      handleCloseImageUpdateModal();
      
      // Refresh event details to show updated data
      if (eventDetails) {
        await handleViewDetails({ id: eventDetails.id });
      }
    } catch (error) {
      console.error('Error updating image:', error);
      setSnackbar({
        open: true,
        message: `Error updating image: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    } finally {
      setImageUpdating(false);
    }
  };

  // Handle add image button click
  const handleAddImage = (event) => {
    console.log('Add image for event:', event.name);
    setSelectedEvent(event);
    setImageUploadData({
      image: null,
      alt_text: '',
      is_primary: false
    });
    setImageModalOpen(true);
  };

  // Handle image upload modal close
  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setSelectedEvent(null);
    setImageUploadData({
      image: null,
      alt_text: '',
      is_primary: false
    });
    setImageUploading(false);
  };

  // Handle image file selection
  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: 'Please select a valid image file (PNG, JPEG, GIF, or WebP)',
          severity: 'error'
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image file size must be less than 10MB',
          severity: 'error'
        });
        return;
      }

      setImageUploadData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Handle image upload form submission
  const handleImageUpload = async () => {
    if (!imageUploadData.image) {
      setSnackbar({
        open: true,
        message: 'Please select an image file',
        severity: 'error'
      });
      return;
    }

    if (!imageUploadData.alt_text.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide alternative text for the image',
        severity: 'error'
      });
      return;
    }

    setImageUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', imageUploadData.image);
      formData.append('alt_text', imageUploadData.alt_text);
      formData.append('is_primary', imageUploadData.is_primary);

      const response = await eventsApiService.addEventImage(user, selectedEvent.id, formData);

      setSnackbar({
        open: true,
        message: 'Image uploaded successfully!',
        severity: 'success'
      });

      handleImageModalClose();
      
      // Refresh event details to show updated data
      if (eventDetails) {
        await handleViewDetails({ id: eventDetails.id });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setSnackbar({
        open: true,
        message: `Error uploading image: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Map picker functions
  const handleOpenMapPicker = () => {
    setOpenMapPicker(true);
  };

  const handleCloseMapPicker = () => {
    setOpenMapPicker(false);
  };

  const handleLocationSelect = (location) => {
    // Format coordinates to have no more than 9 digits total
    const formatCoordinate = (coord) => {
      const str = coord.toString();
      if (str.length <= 9) {
        return coord;
      }
      // Truncate to 9 digits total
      return parseFloat(str.substring(0, 9));
    };

    const formattedLat = formatCoordinate(location.lat);
    const formattedLng = formatCoordinate(location.lng);

    // Update the form data in the dialog
    if (window.handleLocationUpdate) {
      window.handleLocationUpdate({
        lat: formattedLat,
        lng: formattedLng
      });
    }

    setSnackbar({
      open: true,
      message: `Location selected: ${formattedLat}, ${formattedLng}`,
      severity: 'success'
    });
  };

  const handleDelete = async (id) => {
    try {
      console.log('Deleting event:', id);
      
      await eventsApiService.deleteEvent(id);
      console.log('Event deleted successfully');
      
      // Remove from local state
      setEvents(events.filter(event => event.id !== id));
      showSnackbar('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to delete event';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleSave = async (eventData) => {
    try {
      const axiosInstance = createAxiosInstance();
      
      // Convert category and city names back to IDs for API
      const categoryObj = categories.find(cat => 
        (cat.name || cat.label) === eventData.category
      );
      const cityObj = cities.find(city => 
        (city.name || city.label) === eventData.city
      );
      
      const apiEventData = {
        ...eventData,
        category: categoryObj ? (categoryObj.id || categoryObj.value) : eventData.category,
        city: cityObj ? (cityObj.id || cityObj.value) : eventData.city
      };
      
      if (editingEvent) {
        // Update existing event using the new API service
        console.log('Updating event:', editingEvent.id, apiEventData);
        const updatedEvent = await eventsApiService.updateEvent(editingEvent.id, apiEventData);
        
        // Update local state with names preserved
        const eventWithNames = {
          ...updatedEvent,
          id: editingEvent.id,
          category: eventData.category,
          city: eventData.city
        };
        setEvents(events.map(event => 
          event.id === editingEvent.id ? eventWithNames : event
        ));
        showSnackbar('Event updated successfully!');
      } else {
        // Create new event using the new API service
        console.log('Creating new event:', apiEventData);
        const newEvent = await eventsApiService.createEvent(user, apiEventData);
        
        // Add to local state with names preserved
        const eventWithNames = {
          ...newEvent,
          category: eventData.category,
          city: eventData.city
        };
        setEvents([...events, eventWithNames]);
        showSnackbar('Event created successfully!');
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to save event';
      showSnackbar(errorMessage, 'error');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Event Name', width: 200 },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 130,
      renderCell: (params) => {
        // Display the category name directly
        return params.value || 'Unknown';
      }
    },
    { 
      field: 'city', 
      headerName: 'City', 
      width: 100,
      renderCell: (params) => {
        // Display the city name directly
        return params.value || 'Unknown';
      }
    },
    { field: 'base_price', headerName: 'Base Price', width: 100 },
    { field: 'price_per_person', headerName: 'Price Per Person', width: 120 },
    { field: 'location', headerName: 'Location', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 350,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Add Image">
            <IconButton 
              size="small" 
              color="secondary"
              onClick={() => handleAddImage(params.row)}
            >
              <ImageIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Event">
            <IconButton onClick={() => handleEdit(params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Images">
            <IconButton onClick={() => handleManageImages(params.row)} size="small" color="primary">
              <ImageIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Event">
            <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Company Events
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage company events with dynamic categories and cities from API
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
                     <Button
             variant="outlined"
             startIcon={<RefreshIcon />}
            onClick={handleRefresh}
             disabled={loading}
           >
             Refresh
           </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={categoriesLoading || citiesLoading}
            sx={{ bgcolor: '#1976d2' }}
          >
            Add New Event
          </Button>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Filter Controls */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Filters
          </Typography>
        {(categoriesLoading || citiesLoading) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Loading categories and cities...
                        </Typography>
                      </Box>
        )}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Search Events"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                label="Category"
                disabled={categoriesLoading}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categoriesLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  categories.map((cat) => {
                    const catId = cat.id || cat.value;
                    const catName = cat.name || cat.label || `Category ${catId}`;
                    return (
                      <MenuItem key={catId} value={catName}>
                        {catName}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>City</InputLabel>
              <Select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                label="City"
                disabled={citiesLoading}
              >
                <MenuItem value="">All Cities</MenuItem>
                {citiesLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  cities.map((city) => {
                    const cityId = city.id || city.value;
                    const cityName = city.name || city.label || `City ${cityId}`;
                    return (
                      <MenuItem key={cityId} value={cityName}>
                        {cityName}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
                        </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {filteredEvents.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {filteredEvents.filter(e => e.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                {countries.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Countries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                {cities.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events Table */}
      {!loading && filteredEvents.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {events.length === 0 ? 'No events found' : 'No events match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {events.length === 0 
              ? 'Start by adding your first event using the "Add New Event" button above.'
              : 'Try adjusting your filter criteria or clear all filters.'
            }
          </Typography>
                      </Box>
                    )}
      
      {!loading && filteredEvents.length > 0 && (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredEvents}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <EventDialog
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        event={editingEvent}
        categories={categories}
        cities={cities}
        categoriesLoading={categoriesLoading}
        citiesLoading={citiesLoading}
        onOpenMapPicker={handleOpenMapPicker}
        onLocationSelect={handleLocationSelect}
      />

      {/* Image Manager Dialog */}
      <ImageManager
        open={imageManagerOpen}
        onClose={() => {
          setImageManagerOpen(false);
          setSelectedEventForImages(null);
        }}
        eventId={selectedEventForImages?.id}
        eventName={selectedEventForImages?.name}
        user={user}
      />

      {/* Map Picker Modal */}
      <MapPicker
        open={openMapPicker}
        onClose={handleCloseMapPicker}
        onLocationSelect={handleLocationSelect}
        initialLocation={{ lat: 41.6500, lng: 41.6333 }}
        height="500px"
      />

      {/* Event Details Modal */}
      <Dialog open={detailsModalOpen} onClose={handleCloseDetailsModal} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h5">
              Event Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : eventDetails ? (
            <Box>
              {/* Basic Information */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                  Basic Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {eventDetails.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {eventDetails.id}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {eventDetails.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {eventDetails.city?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {eventDetails.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Pricing Information */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                  Pricing & Capacity
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <MoneyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        ${eventDetails.base_price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Base Price
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        ${eventDetails.price_per_person}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price Per Person
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        {eventDetails.min_people || 'N/A'} - {eventDetails.max_people || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        People Capacity
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Statistics */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {eventDetails.views_count || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Views
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 2, color: 'success.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {eventDetails.bookings_count || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Bookings
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ mr: 2, color: 'warning.main' }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {eventDetails.is_popular ? 'Yes' : 'No'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Popular
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Category & Company */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                  Category & Company
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Category
                      </Typography>
                      <Typography variant="body1">
                        {eventDetails.category?.name || 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Company
                      </Typography>
                      <Typography variant="body1">
                        {eventDetails.company?.name || eventDetails.company_name || eventDetails.company_id || 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Location & Coordinates */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                  Location & Coordinates
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Latitude
                      </Typography>
                      <Typography variant="body1">
                        {eventDetails.latitude || eventDetails.lat || 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Longitude
                      </Typography>
                      <Typography variant="body1">
                        {eventDetails.longitude || eventDetails.lng || eventDetails.lon || 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Status Flags */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                  Status Flags
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <StarIcon sx={{ fontSize: 40, color: eventDetails.is_popular ? 'warning.main' : 'grey.400', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold" color={eventDetails.is_popular ? 'warning.main' : 'text.secondary'}>
                        {eventDetails.is_popular ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Popular
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: eventDetails.is_active ? 'success.main' : 'grey.400', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold" color={eventDetails.is_active ? 'success.main' : 'text.secondary'}>
                        {eventDetails.is_active ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, textAlign: 'center' }}>
                      <FeaturedIcon sx={{ fontSize: 40, color: eventDetails.is_featured ? 'primary.main' : 'grey.400', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold" color={eventDetails.is_featured ? 'primary.main' : 'text.secondary'}>
                        {eventDetails.is_featured ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Featured
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Timestamps */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                  Timestamps
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Created At
                      </Typography>
                      <Typography variant="body1">
                        {eventDetails.created_at ? new Date(eventDetails.created_at).toLocaleString() : 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Updated At
                      </Typography>
                      <Typography variant="body1">
                        {eventDetails.updated_at ? new Date(eventDetails.updated_at).toLocaleString() : 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Images */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                    Event Images ({eventDetails.images?.length || 0})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={() => handleAddImage(eventDetails)}
                    size="small"
                  >
                    Add Image
                  </Button>
                </Box>
                
                {eventDetails.images && eventDetails.images.length > 0 ? (
                  <Grid container spacing={2}>
                    {eventDetails.images.map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ 
                          p: 2, 
                          position: 'relative',
                          border: image.is_primary ? '2px solid #1976d2' : '1px solid #e0e0e0',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}>
                          {/* Primary Image Badge */}
                          {image.is_primary && (
                            <Chip 
                              label="Primary Image" 
                              color="primary" 
                              size="small" 
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                zIndex: 1,
                                fontWeight: 'bold'
                              }} 
                            />
                          )}
                          
                          {/* Image */}
                          <Box sx={{ position: 'relative', mb: 2 }}>
                            <img
                              src={`${image.image}`}
                              alt={image.alt_text || 'Event image'}
                              style={{
                                width: '100%',
                                height: 200,
                                objectFit: 'cover',
                                borderRadius: 8,
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                // Open image in new tab for full view
                                window.open(image.image, '_blank');
                              }}
                            />
                            
                            {/* Image Overlay on Hover */}
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.2s ease-in-out',
                              borderRadius: 8,
                              '&:hover': {
                                opacity: 1
                              }
                            }}>
                              <Typography variant="body2" color="white" fontWeight="bold">
                                Click to view full size
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Image Info */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Alt Text:</strong> {image.alt_text || 'No description'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              <strong>ID:</strong> {image.id}
                            </Typography>
                          </Box>
                          
                          {/* Action Buttons */}
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Tooltip title="Edit Image">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleEditImage(image, eventDetails.id)}
                              >
                                <EditImageIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Image">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteImage(image.id, eventDetails.id)}
                              >
                                <DeleteImageIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    border: '2px dashed #e0e0e0', 
                    borderRadius: 2,
                    bgcolor: '#fafafa'
                  }}>
                    <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No Images Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add images to make your event more attractive
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<ImageIcon />}
                      onClick={() => handleAddImage(eventDetails)}
                    >
                      Add First Image
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Creation Date */}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created: {eventDetails.created_at ? new Date(eventDetails.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No event details available
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDetailsModal} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Upload Modal */}
      <Dialog open={imageModalOpen} onClose={handleImageModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ImageIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">
              Upload Image for "{selectedEvent?.name}"
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload an image for this event. Supported formats: PNG, JPEG, GIF, WebP (max 10MB)
            </Typography>
            
            {/* File Upload */}
            <Box sx={{ mb: 3 }}>
              <input
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageFileChange}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ 
                    py: 2,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    '&:hover': {
                      borderStyle: 'dashed',
                      borderWidth: 2,
                    }
                  }}
                >
                  {imageUploadData.image ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" color="primary">
                        {imageUploadData.image.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(imageUploadData.image.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body1">
                        Click to select image file
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        or drag and drop
                      </Typography>
                    </Box>
                  )}
                </Button>
              </label>
            </Box>

            {/* Alt Text */}
            <TextField
              fullWidth
              label="Alternative Text"
              placeholder="Describe the image for accessibility"
              value={imageUploadData.alt_text}
              onChange={(e) => setImageUploadData(prev => ({
                ...prev,
                alt_text: e.target.value
              }))}
              multiline
              rows={2}
              required
              sx={{ mb: 3 }}
            />

            {/* Primary Image Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={imageUploadData.is_primary}
                  onChange={(e) => setImageUploadData(prev => ({
                    ...prev,
                    is_primary: e.target.checked
                  }))}
                />
              }
              label="Set as primary image"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Primary images are displayed as the main event image
            </Typography>
          </Box>

          {/* Upload Progress */}
          {imageUploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Uploading image...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleImageModalClose} disabled={imageUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleImageUpload} 
            variant="contained"
            disabled={!imageUploadData.image || !imageUploadData.alt_text.trim() || imageUploading}
            startIcon={<ImageIcon />}
          >
            {imageUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Update Modal */}
      <Dialog open={imageUpdateModalOpen} onClose={handleCloseImageUpdateModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditImageIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">
              Update Image
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedImageForUpdate && (
            <Box>
              {/* Current Image Preview */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Current Image:
                </Typography>
                <img
                  src={`${selectedImageForUpdate.image}`}
                  alt={selectedImageForUpdate.alt_text || 'Event image'}
                  style={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>

              {/* Alt Text */}
              <TextField
                fullWidth
                label="Alternative Text"
                placeholder="Describe the image for accessibility"
                value={imageUpdateData.alt_text}
                onChange={(e) => setImageUpdateData(prev => ({
                  ...prev,
                  alt_text: e.target.value
                }))}
                multiline
                rows={2}
                required
                sx={{ mb: 3 }}
              />

              {/* Primary Image Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={imageUpdateData.is_primary}
                    onChange={(e) => setImageUpdateData(prev => ({
                      ...prev,
                      is_primary: e.target.checked
                    }))}
                  />
                }
                label="Set as primary image"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Primary images are displayed as the main event image
              </Typography>

              {/* Update Progress */}
              {imageUpdating && (
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Updating image...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseImageUpdateModal} disabled={imageUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={handleImageUpdate} 
            variant="contained"
            disabled={!imageUpdateData.alt_text.trim() || imageUpdating}
            startIcon={<EditImageIcon />}
          >
            {imageUpdating ? 'Updating...' : 'Update Image'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </Box>
  );
};

// Event Dialog Component
const EventDialog = ({ open, onClose, onSave, event, categories, cities, categoriesLoading, citiesLoading, onOpenMapPicker, onLocationSelect }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    base_price: '',
    price_per_person: '',
    location: '',
    min_people: '',
    max_people: '',
    latitude: '',
    longitude: '',
    is_popular: false,
    is_active: true,
    is_featured: false,
  });

  React.useEffect(() => {
    if (event) {
      // Ensure we're using the correct property names and handle potential data inconsistencies
      setFormData({
        name: event.name || '',
        description: event.description || '',
        category: event.category || '',
        city: event.city || '',
        base_price: event.base_price || '',
        price_per_person: event.price_per_person || '',
        location: event.location || '',
        min_people: event.min_people || '',
        max_people: event.max_people || '',
        latitude: event.latitude || '',
        longitude: event.longitude || '',
        is_popular: event.is_popular || false,
        is_active: event.is_active !== undefined ? event.is_active : true,
        is_featured: event.is_featured || false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        city: '',
        base_price: '',
        price_per_person: '',
        location: '',
        min_people: '',
        max_people: '',
        latitude: '',
        longitude: '',
        is_popular: false,
        is_active: true,
        is_featured: false,
      });
    }
  }, [event]);

  // Handle location updates from map picker
  React.useEffect(() => {
    if (onLocationSelect) {
      // This will be called when location is selected from map
      const handleLocationUpdate = (location) => {
        setFormData(prev => ({
          ...prev,
          latitude: location.lat.toString(),
          longitude: location.lng.toString()
        }));
      };
      
      // Store the handler for external use
      window.handleLocationUpdate = handleLocationUpdate;
    }
  }, [onLocationSelect]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Event name is required');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Description is required');
      return false;
    }
    if (!formData.category) {
      alert('Category is required');
      return false;
    }
    if (!formData.city) {
      alert('City is required');
      return false;
    }
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      alert('Base price must be greater than 0');
      return false;
    }
    if (!formData.price_per_person || parseFloat(formData.price_per_person) <= 0) {
      alert('Price per person must be greater than 0');
      return false;
    }
    if (!formData.min_people || parseInt(formData.min_people) <= 0) {
      alert('Minimum people must be greater than 0');
      return false;
    }
    if (!formData.max_people || parseInt(formData.max_people) <= 0) {
      alert('Maximum people must be greater than 0');
      return false;
    }
    if (parseInt(formData.min_people) > parseInt(formData.max_people)) {
      alert('Minimum people cannot be greater than maximum people');
      return false;
    }
    if (!formData.location.trim()) {
      alert('Location is required');
      return false;
    }
    if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
      alert('Valid latitude is required');
      return false;
    }
    if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
      alert('Valid longitude is required');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
    onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
        {event ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
              Event Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                label="Event Name"
                  value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                margin="normal"
                  placeholder="Enter event name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  margin="normal"
                  placeholder="Enter event description"
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
              Category & City
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? (
                    <MenuItem disabled>Loading categories...</MenuItem>
                  ) : (
                    categories.map((cat) => {
                      const catId = cat.id || cat.value;
                      const catName = cat.name || cat.label || `Category ${catId}`;
                      return (
                        <MenuItem key={catId} value={catName}>
                          {catName}
                      </MenuItem>
                      );
                    })
                  )}
                  </Select>
                </FormControl>
              </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                  <InputLabel>City</InputLabel>
                  <Select
                    value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    label="City"
                  disabled={citiesLoading}
                >
                  {citiesLoading ? (
                    <MenuItem disabled>Loading cities...</MenuItem>
                  ) : (
                    cities.map((city) => {
                      const cityId = city.id || city.value;
                      const cityName = city.name || city.label || `City ${cityId}`;
                      return (
                        <MenuItem key={cityId} value={cityName}>
                          {cityName}
                      </MenuItem>
                      );
                    })
                  )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
              Pricing & Capacity
            </Typography>
            <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                label="Base Price"
                  type="number"
                  value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  required
                margin="normal"
                  placeholder="e.g., 150"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                label="Price Per Person"
                  type="number"
                  value={formData.price_per_person}
                onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                  required
                margin="normal"
                  placeholder="e.g., 25"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                label="Min People"
                  type="number"
                value={formData.min_people}
                onChange={(e) => setFormData({ ...formData, min_people: e.target.value })}
                  required
                margin="normal"
                placeholder="e.g., 2"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                label="Max People"
                type="number"
                value={formData.max_people}
                onChange={(e) => setFormData({ ...formData, max_people: e.target.value })}
                  required
                margin="normal"
                placeholder="e.g., 10"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
              Location & Coordinates
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  margin="normal"
                  placeholder="e.g., Batumi Beach"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                label="Latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Limit to 9 digits total
                    if (value.length <= 9) {
                    setFormData({ ...formData, latitude: value });
                    }
                  }}
                  helperText="Max 9 digits total"
                  required
                margin="normal"
                placeholder="e.g., 41.6168"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                label="Longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Limit to 9 digits total
                    if (value.length <= 9) {
                    setFormData({ ...formData, longitude: value });
                    }
                  }}
                  helperText="Max 9 digits total"
                  required
                margin="normal"
                placeholder="e.g., 41.6168"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={onOpenMapPicker}
                  sx={{
                    borderColor: '#ff6b35',
                    color: '#ff6b35',
                    '&:hover': {
                      borderColor: '#e55a2b',
                      backgroundColor: '#fff5f2',
                    },
                    mt: 2,
                    height: '56px'
                  }}
                >
                  Pick Location on Map
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
              Event Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Is Popular"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Is Active"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Is Featured"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {event ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
      </Dialog>
  );
};

export default Events;
