import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      bookingAlerts: true,
      marketingEmails: false,
      weeklyReports: true,
    },
    company: {
      autoApproveBookings: false,
      requireDeposit: true,
      depositPercentage: 20,
      cancellationPolicy: '24 hours',
      maxGroupSize: 10,
    },
    display: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Tbilisi',
      currency: 'GEL',
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
    }
  });

  const [showAlert, setShowAlert] = useState(false);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your company preferences and account settings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>

      {showAlert && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive notifications via SMS"
                  />
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Booking Alerts"
                    secondary="Get notified when new bookings are made"
                  />
                  <Switch
                    checked={settings.notifications.bookingAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'bookingAlerts', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Marketing Emails"
                    secondary="Receive promotional emails and updates"
                  />
                  <Switch
                    checked={settings.notifications.marketingEmails}
                    onChange={(e) => handleSettingChange('notifications', 'marketingEmails', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Weekly Reports"
                    secondary="Receive weekly performance reports"
                  />
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Settings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Company Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Auto-approve Bookings"
                    secondary="Automatically approve new bookings"
                  />
                  <Switch
                    checked={settings.company.autoApproveBookings}
                    onChange={(e) => handleSettingChange('company', 'autoApproveBookings', e.target.checked)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Require Deposit"
                    secondary="Require deposit for bookings"
                  />
                  <Switch
                    checked={settings.company.requireDeposit}
                    onChange={(e) => handleSettingChange('company', 'requireDeposit', e.target.checked)}
                  />
                </ListItem>
              </List>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Deposit Percentage"
                    type="number"
                    value={settings.company.depositPercentage}
                    onChange={(e) => handleSettingChange('company', 'depositPercentage', e.target.value)}
                    InputProps={{ endAdornment: '%' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Group Size"
                    type="number"
                    value={settings.company.maxGroupSize}
                    onChange={(e) => handleSettingChange('company', 'maxGroupSize', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Cancellation Policy</InputLabel>
                    <Select
                      value={settings.company.cancellationPolicy}
                      onChange={(e) => handleSettingChange('company', 'cancellationPolicy', e.target.value)}
                      label="Cancellation Policy"
                    >
                      <MenuItem value="2 hours">2 hours</MenuItem>
                      <MenuItem value="24 hours">24 hours</MenuItem>
                      <MenuItem value="48 hours">48 hours</MenuItem>
                      <MenuItem value="1 week">1 week</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Display Settings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaletteIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Display Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={settings.display.theme}
                      onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
                      label="Theme"
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.display.language}
                      onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                      label="Language"
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ka">Georgian</MenuItem>
                      <MenuItem value="ru">Russian</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.display.timezone}
                      onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
                      label="Timezone"
                    >
                      <MenuItem value="Asia/Tbilisi">Asia/Tbilisi</MenuItem>
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="Europe/London">Europe/London</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={settings.display.currency}
                      onChange={(e) => handleSettingChange('display', 'currency', e.target.value)}
                      label="Currency"
                    >
                      <MenuItem value="GEL">GEL (₾)</MenuItem>
                      <MenuItem value="USD">USD ($)</MenuItem>
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Security</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security"
                  />
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                </ListItem>
              </List>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Session Timeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                    InputProps={{ endAdornment: 'minutes' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Password Expiry"
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => handleSettingChange('security', 'passwordExpiry', e.target.value)}
                    InputProps={{ endAdornment: 'days' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">Contact Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Primary Email"
                    defaultValue="info@adventuretours.com"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    defaultValue="+995 555 123 456"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Support Email"
                    defaultValue="support@adventuretours.com"
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
