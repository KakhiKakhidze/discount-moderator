import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  Divider,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Event,
  Visibility,
  AttachMoney,
  Person,
  Business,
  Email,
  AccessTime,
  Refresh,
  Add,
  Edit,
  Delete,
  Star,
  Schedule,
  LocationOn,
  Category,
  Group,
  Assessment,
  Notifications,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import createAxiosInstance from '../services/axios';
import eventsApiService from '../services/eventsApi';

const Dashboard = () => {
  const { user, permissions } = useAuth();
  const [loginTime, setLoginTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Real data states
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalViews: 0,
    totalRevenue: 0,
    thisMonthEvents: 0,
    thisMonthRevenue: 0,
    averageRating: 0,
    totalBookings: 0
  });

  const axiosInstance = createAxiosInstance();

  useEffect(() => {
    setLoginTime(new Date().toLocaleString());
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all data in parallel
      const [eventsResponse, categoriesResponse, citiesResponse, countriesResponse, companyResponse] = await Promise.allSettled([
        eventsApiService.getCompanyEvents(user),
        axiosInstance.get('/category/list/'),
        axiosInstance.get('/city/admin/list/'),
        axiosInstance.get('/v2/country/list'),
        axiosInstance.get('/v2/auth/profile')
      ]);

      // Process events data
      if (eventsResponse.status === 'fulfilled') {
        // eventsApiService.getCompanyEvents() already returns the processed array
        const eventsList = eventsResponse.value || [];
        
        console.log('Dashboard - Events data:', {
          eventsResponse: eventsResponse,
          eventsList: eventsList,
          eventsCount: eventsList.length,
          firstEvent: eventsList[0]
        });
        
        setEvents(eventsList);
        
        // Calculate statistics
        const totalEvents = eventsList.length;
        const activeEvents = eventsList.filter(event => event.is_active !== false).length;
        const totalViews = eventsList.reduce((sum, event) => sum + (event.views || 0), 0);
        const totalRevenue = eventsList.reduce((sum, event) => sum + (event.revenue || 0), 0);
        const thisMonthEvents = eventsList.filter(event => {
          const eventDate = new Date(event.created_at || event.date_created);
          const now = new Date();
          return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
        }).length;
        const thisMonthRevenue = eventsList
          .filter(event => {
            const eventDate = new Date(event.created_at || event.date_created);
            const now = new Date();
            return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, event) => sum + (event.revenue || 0), 0);
        const averageRating = eventsList.length > 0 
          ? eventsList.reduce((sum, event) => sum + (event.rating || 0), 0) / eventsList.length 
          : 0;
        const totalBookings = eventsList.reduce((sum, event) => sum + (event.bookings || 0), 0);

        setStats({
          totalEvents,
          activeEvents,
          totalViews,
          totalRevenue,
          thisMonthEvents,
          thisMonthRevenue,
          averageRating,
          totalBookings
        });
        
        console.log('Dashboard - Calculated stats:', {
          totalEvents,
          activeEvents,
          totalViews,
          totalRevenue,
          thisMonthEvents,
          thisMonthRevenue,
          averageRating,
          totalBookings
        });
      } else {
        console.error('Dashboard - Events fetch failed:', eventsResponse.reason);
        setError('Failed to load events data');
        
        // Set empty stats if events fetch fails
        setStats({
          totalEvents: 0,
          activeEvents: 0,
          totalViews: 0,
          totalRevenue: 0,
          thisMonthEvents: 0,
          thisMonthRevenue: 0,
          averageRating: 0,
          totalBookings: 0
        });
      }

      // Process categories data
      if (categoriesResponse.status === 'fulfilled') {
        const categoriesData = categoriesResponse.value.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }

      // Process cities data
      if (citiesResponse.status === 'fulfilled') {
        const citiesData = citiesResponse.value.data;
        setCities(Array.isArray(citiesData) ? citiesData : []);
      }

      // Process countries data
      if (countriesResponse.status === 'fulfilled') {
        const countriesData = countriesResponse.value.data;
        setCountries(Array.isArray(countriesData) ? countriesData : []);
        console.log('Dashboard - Countries loaded:', countriesData);
      }

      // Process company data
      if (companyResponse.status === 'fulfilled') {
        setCompanyData(companyResponse.value.data);
      }
      
      // Fetch detailed company information
      try {
        const companyInfo = await eventsApiService.getCompanyInfo(user);
        setCompanyData(companyInfo);
        console.log('Dashboard - Company info loaded:', companyInfo);
      } catch (error) {
        console.error('Error fetching company info in dashboard:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Calculate event categories distribution
  const getEventCategoriesData = () => {
    const categoryCounts = {};
    events.forEach(event => {
      const categoryName = event.category?.name || event.category || 'Unknown';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];
    return Object.entries(categoryCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  // Calculate monthly revenue trend
  const getMonthlyRevenueData = () => {
    const monthlyData = {};
    events.forEach(event => {
      const date = new Date(event.created_at || event.date_created);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, revenue: 0, events: 0 };
      }
      monthlyData[monthKey].revenue += event.revenue || 0;
      monthlyData[monthKey].events += 1;
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months
      .map(item => ({
        ...item,
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' })
      }));
  };

  // Get recent events
  const getRecentEvents = () => {
    return events
      .sort((a, b) => new Date(b.created_at || b.date_created) - new Date(a.created_at || a.date_created))
      .slice(0, 5);
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Company Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.first_name || user?.name || 'Moderator'}! Here's your company overview.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ minWidth: 120 }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* User Info Card */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 , color: 'black'}}>
                  {user?.first_name || user?.name || 'Moderator'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 1  , color: 'black'}}>
                  {user?.email || 'No email provided'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1  , color: 'black'}}>
                  <Business fontSize="small" />
                  <Typography variant="body2" sx={{ color: 'black' }}>
                    {companyData?.name || user?.company?.name || 'Company Name'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 , color: 'black' }}>
                  <AccessTime fontSize="small" />
                  <Typography variant="body2">
                    Logged in: {loginTime}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ mb: 2 , color: 'black'  }}>
                Permissions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' , color: 'black' }}>
                {permissions && permissions.length > 0 ? (
                  permissions.map((permission, index) => (
                    <Chip
                      key={index}
                      label={permission}
                      size="small"
                      sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)' , color: 'black'  }}
                    />
                  ))
                ) : (
                  <Chip
                    label="Basic Access"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)' , color: 'black'  }}
                  />
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment />
              Revenue & Events Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getMonthlyRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.6}
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="events"
                  stroke="#dc004e"
                  strokeWidth={3}
                  name="Events"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Event Categories Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Category />
              Event Categories
            </Typography>
            {getEventCategoriesData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getEventCategoriesData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getEventCategoriesData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Typography color="text.secondary">No event categories data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Events and Quick Actions */}
      <Grid container spacing={3}>
        {/* Recent Events */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Event />
              Recent Events
            </Typography>
            {getRecentEvents().length > 0 ? (
              <List>
                {getRecentEvents().map((event, index) => (
                  <ListItem key={event.id || index} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Event />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {event.name || 'Unnamed Event'}
                          </Typography>
                          {event.is_active !== false && (
                            <Chip label="Active" size="small" color="success" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {event.description?.substring(0, 100)}...
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="caption">
                                {event.location || 'No location'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AttachMoney fontSize="small" color="action" />
                              <Typography variant="caption">
                                ${event.price_per_person || event.base_price || '0'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Visibility fontSize="small" color="action" />
                              <Typography variant="caption">
                                {event.views || 0} views
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" size="small">
                        <Edit />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Event sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No events found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start by creating your first event
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions & Stats */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Add />
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                Create New Event
              </Button>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                Manage Events
              </Button>
              <Button
                variant="outlined"
                startIcon={<Business />}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                Update Company Profile
              </Button>
            </Box>
          </Paper>

          {/* Additional Stats */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment />
              Additional Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Average Rating</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star fontSize="small" color="warning" />
                  <Typography variant="body2" fontWeight="bold">
                    {stats.averageRating.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Total Bookings</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {stats.totalBookings}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">This Month Events</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {stats.thisMonthEvents}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Categories Available</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {categories.length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;