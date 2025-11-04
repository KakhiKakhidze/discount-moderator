import createAxiosInstance from './axios';

/**
 * Events API service for company-specific event management
 * Implements the new API endpoint structure
 */
class EventsApiService {
  constructor() {
    this.axiosInstance = createAxiosInstance();
  }

  /**
   * Get company ID from user data or staff profile
   * @param {Object} user - User object from AuthContext
   * @returns {Promise<number>} Company ID
   */
  async getCompanyId(user) {
    console.log('Getting company ID for user:', {
      user: user,
      companies: user?.companies,
      company: user?.companies?.[0],
      company_id: user?.company_id,
      user_id: user?.user_id,
      id: user?.id
    });
    
    // Try to extract from user data first (prioritize companies array)
    const companies = user?.companies || [];
    const company = companies.length > 0 ? companies[0] : null;
    const companyId = company?.id || user?.company?.id || user?.company_id || user?.user_id || user?.id;
    
    if (companyId) {
      console.log(`Found company ID from user data: ${companyId}`);
      // Validate that companyId is a valid number
      const numericCompanyId = parseInt(companyId);
      if (isNaN(numericCompanyId) || numericCompanyId <= 0) {
        throw new Error('Invalid company ID. Please contact your administrator.');
      }
      return numericCompanyId;
    }

    // Fallback: fetch from staff profile API
    try {
      console.log('Fetching company ID from staff profile...');
      const profileResponse = await this.axiosInstance.get('/v2/auth/profile');
      const profileData = profileResponse.data;
      
      console.log('Profile API Response for Company ID:', {
        fullResponse: profileResponse,
        profileData: profileData,
        companies: profileData?.companies,
        company: profileData?.companies?.[0],
        company_id: profileData?.company_id,
        user_id: profileData?.user_id,
        id: profileData?.id
      });
      
      // Extract company ID from companies array
      const companies = profileData?.companies || [];
      const company = companies.length > 0 ? companies[0] : null;
      
      const fallbackCompanyId = company?.id || 
                               profileData?.company_id || 
                               profileData?.user_id || 
                               profileData?.id;
      
      if (!fallbackCompanyId) {
        throw new Error('Company ID not found in user profile');
      }
      
      console.log(`Found company ID from profile: ${fallbackCompanyId}`);
      // Validate that companyId is a valid number
      const numericCompanyId = parseInt(fallbackCompanyId);
      if (isNaN(numericCompanyId) || numericCompanyId <= 0) {
        throw new Error('Invalid company ID from profile. Please contact your administrator.');
      }
      return numericCompanyId;
    } catch (error) {
      console.error('Failed to fetch company ID from profile:', error);
      throw new Error('Company ID not found. Please ensure you are properly authenticated.');
    }
  }

  /**
   * Get full company information from staff profile
   * @param {Object} user - User object from AuthContext
   * @returns {Promise<Object>} Company information object
   */
  async getCompanyInfo(user) {
    try {
      const profileResponse = await this.axiosInstance.get('/v2/auth/profile');
      const profileData = profileResponse.data;
      
      console.log('Getting company info from profile:', {
        profileData: profileData,
        companies: profileData?.companies,
        company: profileData?.companies?.[0]
      });
      
      // Extract company information from companies array
      const companies = profileData?.companies || [];
      const company = companies.length > 0 ? companies[0] : null;
      
      const companyInfo = {
        id: company?.id || profileData?.company_id,
        name: company?.name || profileData?.company_name || 'Unknown Company',
        description: company?.description,
        is_verified: company?.is_verified,
        is_active: company?.is_active,
        created_at: company?.created_at,
        updated_at: company?.updated_at,
        email: profileData?.company?.email || profileData?.company_email,
        phone: profileData?.company?.phone || profileData?.company_phone,
        address: profileData?.company?.address || profileData?.company_address,
        website: profileData?.company?.website || profileData?.company_website
      };
      
      return companyInfo;
    } catch (error) {
      console.error('Error fetching company info:', error);
      throw new Error('Failed to fetch company information');
    }
  }

  /**
   * Verify that the staff member belongs to the specified company
   * @param {Object} user - User object from AuthContext
   * @param {number} companyId - Company ID to verify
   * @returns {Promise<boolean>} True if staff belongs to company
   */
  async verifyStaffCompanyAccess(user, companyId) {
    try {
      // Get user's company information
      const userCompanyId = await this.getCompanyId(user);
      
      // Verify the staff member belongs to the requested company
      if (userCompanyId !== companyId) {
        console.error(`Access denied: Staff company ID (${userCompanyId}) does not match requested company ID (${companyId})`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying staff company access:', error);
      return false;
    }
  }

  /**
   * Get all events for a company
   * @param {Object} user - User object from AuthContext
   * @returns {Promise<Array>} Array of events
   */
  async getCompanyEvents(user) {
    let companyId;
    try {
      companyId = await this.getCompanyId(user);
      console.log(`Fetching events for company ID: ${companyId}`);
      
      // Verify staff has access to this company
      const hasAccess = await this.verifyStaffCompanyAccess(user, companyId);
      if (!hasAccess) {
        throw new Error('Access denied: You do not have permission to view events for this company.');
      }
      
      const response = await this.axiosInstance.get(`/v2/event/${companyId}/list`);
      
      // Handle different response structures
      let events = [];
      if (Array.isArray(response.data)) {
        events = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        events = response.data.results;
      } else if (response.data?.events && Array.isArray(response.data.events)) {
        events = response.data.events;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        events = response.data.data;
      }
      
      console.log(`Retrieved ${events.length} events for company ${companyId}`);
      console.log('Events API Response:', {
        companyId,
        response: response,
        events: events,
        eventsLength: events.length
      });
      return events;
    } catch (error) {
      console.error('Error fetching company events:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        companyId: companyId
      });
      // Return empty array instead of throwing to prevent dashboard crash
      return [];
    }
  }

  /**
   * Create a new event for the company
   * @param {Object} user - User object from AuthContext
   * @param {Object} eventData - Event data to create
   * @returns {Promise<Object>} Created event
   */
  async createEvent(user, eventData) {
    try {
      const companyId = await this.getCompanyId(user);
      console.log(`Creating event for company ID: ${companyId}`, eventData);
      
      // Verify staff has access to this company
      const hasAccess = await this.verifyStaffCompanyAccess(user, companyId);
      if (!hasAccess) {
        throw new Error('Access denied: You do not have permission to create events for this company.');
      }
      
       const response = await this.axiosInstance.post(
         `/v2/event/${companyId}/create`, 
         eventData
       );
      
      console.log('Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific event
   * @param {number} eventId - Event ID
   * @returns {Promise<Object>} Event details
   */
  async getEventDetails(eventId) {
    try {
      console.log(`Fetching details for event ID: ${eventId}`);
      
       const response = await this.axiosInstance.get(
         `/v2/event/details/${eventId}`
       );
      
      console.log('Event details retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   * @param {number} eventId - Event ID to update
   * @param {Object} eventData - Updated event data
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, eventData) {
    try {
      console.log(`Updating event ID: ${eventId}`, eventData);
      
       const response = await this.axiosInstance.patch(
         `/v2/event/update/${eventId}`, 
         eventData
       );
      
      console.log('Event updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   * @param {number} eventId - Event ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteEvent(eventId) {
    try {
      console.log(`Deleting event ID: ${eventId}`);
      
       await this.axiosInstance.delete(
         `/v2/event/company/events/${eventId}/delete`
       );
      
      console.log('Event deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Get images for an event (included in detailed event data)
   * @param {number} eventId - Event ID
   * @returns {Promise<Array>} Array of event images
   */
  async getEventImages(eventId) {
    try {
      console.log(`Fetching images for event ID: ${eventId}`);
      
      // Get detailed event data which includes images
      const response = await this.axiosInstance.get(
        `/v2/event/company/events/${eventId}`
      );
      
      console.log('Event details with images retrieved:', response.data);
      
      // Extract images from the event details
      let images = [];
      if (response.data?.images && Array.isArray(response.data.images)) {
        images = response.data.images;
      } else if (response.data?.data?.images && Array.isArray(response.data.data.images)) {
        images = response.data.data.images;
      }
      
      return images;
    } catch (error) {
      console.error('Error fetching event images:', error);
      throw error;
    }
  }

  /**
   * Upload/Add image to an event
   * @param {Object} user - User object from AuthContext
   * @param {number} eventId - Event ID
   * @param {FormData} imageData - Image form data
   * @returns {Promise<Object>} Uploaded image info
   */
  async addEventImage(user, eventId, imageData) {
    try {
      const companyId = await this.getCompanyId(user);
      console.log(`Adding image to event ID: ${eventId} for company ID: ${companyId}`);
      
      const response = await this.axiosInstance.post(
        `/v2/event/${eventId}/images`,
        imageData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for image upload
        }
      );
      
      console.log('Image added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding event image:', error);
      throw error;
    }
  }

  /**
   * Update an event image
   * @param {Object} user - User object from AuthContext
   * @param {number} eventId - Event ID
   * @param {number} imageId - Image ID to update
   * @param {Object} imageData - Updated image data (alt_text, is_primary)
   * @returns {Promise<Object>} Updated image info
   */
  async updateEventImage(user, eventId, imageId, imageData) {
    try {
      const companyId = await this.getCompanyId(user);
      console.log(`Updating image ${imageId} for event ID: ${eventId} for company ID: ${companyId}`);
      
      const response = await this.axiosInstance.put(
        `/v2/event/admin/event/${eventId}/image/${imageId}`,
        imageData
      );
      
      console.log('Image updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating event image:', error);
      throw error;
    }
  }

  /**
   * Delete an event image
   * @param {Object} user - User object from AuthContext
   * @param {number} eventId - Event ID
   * @param {number} imageId - Image ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteEventImage(user, eventId, imageId) {
    try {
      const companyId = await this.getCompanyId(user);
      console.log(`Deleting image ${imageId} from event ID: ${eventId} for company ID: ${companyId}`);
      
      await this.axiosInstance.delete(
        `/v2/event/admin/event/${eventId}/image/${imageId}`
      );
      
      console.log('Image deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting event image:', error);
      throw error;
    }
  }

  /**
   * Set an image as primary for an event
   * @param {number} eventId - Event ID
   * @param {number} imageId - Image ID to set as primary
   * @returns {Promise<Object>} Updated image info
   */
  async setPrimaryImage(eventId, imageId) {
    try {
      console.log(`Setting image ${imageId} as primary for event ID: ${eventId}`);
      
      const response = await this.axiosInstance.patch(
        `/v2/event/company/events/${eventId}/images/update/${imageId}`,
        { is_primary: true }
      );
      
      console.log('Primary image set successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error setting primary image:', error);
      throw error;
    }
  }
}

// Create singleton instance
const eventsApiService = new EventsApiService();

export default eventsApiService;

// Export individual methods for easier importing
export const {
  getCompanyEvents,
  createEvent,
  getEventDetails,
  updateEvent,
  deleteEvent,
  getEventImages,
  addEventImage,
  updateEventImage,
  deleteEventImage,
  setPrimaryImage,
} = eventsApiService;
