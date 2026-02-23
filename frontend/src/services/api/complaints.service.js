import api from '../api.js';

/**
 * Complaints Service
 * 
 * Handles all complaint-related API calls
 */

/**
 * Submit a new complaint
 */
export async function submitComplaint(complaintData) {
  try {
    console.log('🔍 Submitting complaint:', complaintData);
    // Construct payload matching backend expectation
    const payload = {
      serviceType: complaintData.serviceType,
      complaintType: complaintData.complaintType,
      title: complaintData.title,
      description: complaintData.description,
    };
    const response = await api.post('/complaints', payload);
    console.log('✅ Submit Complaint Response:', response.data);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('❌ API submitComplaint error:', error);
    throw error;
  }
}

/**
 * Track a complaint by ID
 */
export async function trackComplaint(id) {
  try {
    console.log(`🔍 Tracking complaint: ${id}`);
    const response = await api.get(`/complaints/track/${id}`);
    console.log('✅ Track Complaint Response:', response.data);
    return response.data.complaint;
  } catch (error) {
    console.error('❌ API trackComplaint error:', error);
    throw error;
  }
}

/**
 * Get user's complaints with optional filters
 */
export async function getUserComplaints(filters = {}) {
  try {
    console.log('🔍 Getting user complaints...', filters);
    const response = await api.get('/complaints', { params: filters });
    console.log('✅ User Complaints Response:', response.data);
    return response.data.complaints || [];
  } catch (error) {
    console.error('❌ API getUserComplaints error:', error);
    throw error;
  }
}

// Re-export as a grouped object for backward compatibility with some imports
export const complaintService = {
  submit: submitComplaint,
  track: trackComplaint,
  getUserComplaints
};