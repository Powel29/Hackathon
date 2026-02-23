import api from '../api.js';

/**
 * New Connections Service
 * 
 * Handles new connection application API calls
 */

/**
 * Submit new connection application
 */
export async function submitConnectionApplication(connectionData) {
  try {
    console.log('🔍 Submitting connection application:', connectionData);
    const response = await api.post('/connections/new', connectionData);
    console.log('✅ New Connection Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API submitConnectionApplication error:', error);
    throw error;
  }
}

/**
 * Get connection application by ID or application number
 */
export async function getConnectionApplication(id) {
  try {
    console.log(`🔍 Tracking connection application: ${id}`);
    const response = await api.get(`/connections/track/${id}`);
    console.log('✅ Track Connection Response:', response.data);
    return response.data.application;
  } catch (error) {
    console.error('❌ API getConnectionApplication error:', error);
    throw error;
  }
}

/**
 * Get user's connection applications with optional filters
 */
export async function getUserApplications(filters = {}) {
  try {
    console.log('🔍 Getting user connection applications...', filters);
    const response = await api.get('/connections', { params: filters });
    console.log('✅ User Applications Response:', response.data);
    return response.data.applications || [];
  } catch (error) {
    console.error('❌ API getUserApplications error:', error);
    throw error;
  }
}

// Re-export as a grouped object for consistency
export const connectionService = {
  requestNew: submitConnectionApplication,
  track: getConnectionApplication,
  getMyApplications: getUserApplications
};
