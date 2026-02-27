/**
 * API Service Index
 * 
 * Central export point for all modular API services.
 * This file resolves conflicts between the /api/ directory and the legacy api.js file.
 */

import { authService as legacyAuth } from '../api.js';
import { billService as legacyBill } from '../api.js';
import { complaintService as legacyComplaint } from '../api.js';
import { connectionService as legacyConnection } from '../api.js';
import { departmentService as legacyDepartment } from '../api.js';
import { paymentService as legacyPayment } from '../api.js';
import { documentService as legacyDocument } from '../api.js';
import { serviceRequestService as legacyServiceRequest } from '../api.js';

// Export objects for components that expect service objects
export const authService = legacyAuth;
export const billService = legacyBill;
export const complaintService = legacyComplaint;
export const connectionService = legacyConnection;
export const departmentService = legacyDepartment;
export const paymentService = legacyPayment;
export const documentService = legacyDocument;
export const serviceRequestService = legacyServiceRequest;

// Export individual functions if needed
export * from './auth.service.js';
export * from './bills.service.js';
export * from './complaints.service.js';
export * from './connections.service.js';
export * from './kiosk.service.js';
export * from './serviceRequest.service.js';
