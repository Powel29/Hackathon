/**
 * Complaints Service
 * 
 * Handles all complaint-related API calls
 * Currently using mock data - replace with actual database calls when ready
 */

import { query, transaction } from '../../db/config';
import type { ServiceType } from '../../store/useStore';

export interface CreateComplaintRequest {
  userId: string;
  consumerServiceId: string;
  serviceType: ServiceType;
  complaintTypeId: string;
  description: string;
  attachmentUrl?: string;
}

export interface UpdateComplaintRequest {
  complaintId: string;
  status?: string;
  assignedTo?: string;
  resolutionNotes?: string;
}

export interface GetComplaintRequest {
  complaintId?: string;
  complaintNumber?: string;
  userId?: string;
  serviceType?: ServiceType;
  status?: string;
}

export interface Complaint {
  complaintId: string;
  complaintNumber: string;
  userId: string;
  serviceType: ServiceType;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  createdAt: string;
  updatedAt: string;
  assignedTechnician?: {
    name: string;
    phone: string;
  };
  timeline: {
    status: string;
    timestamp: string;
    note: string;
  }[];
}

export interface ComplaintType {
  complaintTypeId: string;
  serviceType: ServiceType;
  typeCode: string;
  typeName: string;
  priority: string;
  slaHours: number;
}

/**
 * Get complaint types for a service
 */
export async function getComplaintTypes(serviceType: ServiceType, language: string = 'en'): Promise<ComplaintType[]> {
  try {
    // Database implementation (uncomment when ready):
    /*
    const languageColumn = `type_name_${language}`;
    const result = await query(
      `SELECT 
        complaint_type_id,
        service_type,
        type_code,
        COALESCE(${languageColumn}, type_name_en) as type_name,
        priority,
        sla_hours
       FROM complaint_types
       WHERE service_type = $1 AND is_active = true
       ORDER BY priority DESC, type_name`,
      [serviceType]
    );
    
    return result.rows.map(row => ({
      complaintTypeId: row.complaint_type_id,
      serviceType: row.service_type,
      typeCode: row.type_code,
      typeName: row.type_name,
      priority: row.priority,
      slaHours: row.sla_hours
    }));
    */

    // Mock implementation
    console.log('Getting complaint types for service:', serviceType);
    
    const complaintTypesByService: Record<ServiceType, ComplaintType[]> = {
      electricity: [
        { complaintTypeId: '1', serviceType: 'electricity', typeCode: 'POWER_CUT', typeName: 'Power Outage', priority: 'high', slaHours: 4 },
        { complaintTypeId: '2', serviceType: 'electricity', typeCode: 'VOLTAGE_ISSUE', typeName: 'Voltage Fluctuation', priority: 'normal', slaHours: 24 },
        { complaintTypeId: '3', serviceType: 'electricity', typeCode: 'METER_FAULT', typeName: 'Meter Fault', priority: 'normal', slaHours: 48 },
        { complaintTypeId: '4', serviceType: 'electricity', typeCode: 'BILLING_ERROR', typeName: 'Billing Error', priority: 'normal', slaHours: 72 },
        { complaintTypeId: '5', serviceType: 'electricity', typeCode: 'POLE_DAMAGE', typeName: 'Damaged Pole/Wire', priority: 'critical', slaHours: 2 },
      ],
      gas: [
        { complaintTypeId: '6', serviceType: 'gas', typeCode: 'GAS_LEAK', typeName: 'Gas Leakage', priority: 'critical', slaHours: 1 },
        { complaintTypeId: '7', serviceType: 'gas', typeCode: 'NO_SUPPLY', typeName: 'No Gas Supply', priority: 'high', slaHours: 4 },
        { complaintTypeId: '8', serviceType: 'gas', typeCode: 'LOW_PRESSURE', typeName: 'Low Pressure', priority: 'normal', slaHours: 24 },
        { complaintTypeId: '9', serviceType: 'gas', typeCode: 'METER_ISSUE', typeName: 'Meter Reading Issue', priority: 'normal', slaHours: 48 },
        { complaintTypeId: '10', serviceType: 'gas', typeCode: 'PIPELINE_DAMAGE', typeName: 'Pipeline Damage', priority: 'critical', slaHours: 2 },
      ],
      water: [
        { complaintTypeId: '11', serviceType: 'water', typeCode: 'NO_WATER', typeName: 'No Water Supply', priority: 'high', slaHours: 6 },
        { complaintTypeId: '12', serviceType: 'water', typeCode: 'LOW_PRESSURE', typeName: 'Low Water Pressure', priority: 'normal', slaHours: 24 },
        { complaintTypeId: '13', serviceType: 'water', typeCode: 'DIRTY_WATER', typeName: 'Contaminated Water', priority: 'critical', slaHours: 2 },
        { complaintTypeId: '14', serviceType: 'water', typeCode: 'PIPE_LEAK', typeName: 'Pipe Leakage', priority: 'high', slaHours: 12 },
        { complaintTypeId: '15', serviceType: 'water', typeCode: 'METER_FAULT', typeName: 'Meter Malfunction', priority: 'normal', slaHours: 48 },
      ],
      municipal: [
        { complaintTypeId: '16', serviceType: 'municipal', typeCode: 'GARBAGE_COLLECTION', typeName: 'Garbage Not Collected', priority: 'normal', slaHours: 24 },
        { complaintTypeId: '17', serviceType: 'municipal', typeCode: 'STREET_LIGHT', typeName: 'Street Light Not Working', priority: 'normal', slaHours: 48 },
        { complaintTypeId: '18', serviceType: 'municipal', typeCode: 'ROAD_DAMAGE', typeName: 'Road Damage', priority: 'high', slaHours: 72 },
        { complaintTypeId: '19', serviceType: 'municipal', typeCode: 'DRAINAGE_ISSUE', typeName: 'Drainage Problem', priority: 'high', slaHours: 24 },
        { complaintTypeId: '20', serviceType: 'municipal', typeCode: 'PUBLIC_TOILET', typeName: 'Public Toilet Issue', priority: 'normal', slaHours: 48 },
      ],
    };
    
    return complaintTypesByService[serviceType] || [];
  } catch (error) {
    console.error('Get complaint types error:', error);
    return [];
  }
}

/**
 * Create new complaint
 */
export async function createComplaint(request: CreateComplaintRequest): Promise<{ success: boolean; complaintNumber?: string; error?: string }> {
  try {
    // Database implementation (uncomment when ready):
    /*
    return await transaction(async (client) => {
      // Generate complaint number
      const complaintNumber = await generateComplaintNumber(request.serviceType);
      
      // Insert complaint
      const complaintResult = await client.query(
        `INSERT INTO complaints 
         (complaint_number, user_id, consumer_service_id, complaint_type_id, service_type, description, attachment_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
         RETURNING complaint_id`,
        [complaintNumber, request.userId, request.consumerServiceId, request.complaintTypeId, 
         request.serviceType, request.description, request.attachmentUrl]
      );
      
      const complaintId = complaintResult.rows[0].complaint_id;
      
      // Add initial timeline entry
      await client.query(
        `INSERT INTO complaint_timeline (complaint_id, status, note)
         VALUES ($1, 'open', 'Complaint registered')`,
        [complaintId]
      );
      
      // Create notification for user
      await client.query(
        `INSERT INTO notifications (user_id, notification_type, title, message)
         VALUES ($1, 'complaint_registered', 'Complaint Registered', $2)`,
        [request.userId, `Your complaint has been registered with number ${complaintNumber}`]
      );
      
      // Log audit
      await client.query(
        `INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id)
         VALUES ($1, 'complaint_created', 'complaint', $2)`,
        [request.userId, complaintId]
      );
      
      return { success: true, complaintNumber };
    });
    */

    // Mock implementation
    console.log('Creating complaint:', request);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const complaintNumber = `CMP-${request.serviceType.toUpperCase().substring(0, 3)}-${Date.now()}`;
    
    return { success: true, complaintNumber };
  } catch (error) {
    console.error('Create complaint error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get complaint by ID or number
 */
export async function getComplaint(request: GetComplaintRequest): Promise<Complaint | null> {
  try {
    // Database implementation (uncomment when ready):
    /*
    let whereClause = [];
    let params: any[] = [];
    let paramIndex = 1;
    
    if (request.complaintId) {
      whereClause.push(`c.complaint_id = $${paramIndex++}`);
      params.push(request.complaintId);
    }
    if (request.complaintNumber) {
      whereClause.push(`c.complaint_number = $${paramIndex++}`);
      params.push(request.complaintNumber);
    }
    if (request.userId) {
      whereClause.push(`c.user_id = $${paramIndex++}`);
      params.push(request.userId);
    }
    if (request.serviceType) {
      whereClause.push(`c.service_type = $${paramIndex++}`);
      params.push(request.serviceType);
    }
    if (request.status) {
      whereClause.push(`c.status = $${paramIndex++}`);
      params.push(request.status);
    }
    
    const result = await query(
      `SELECT 
        c.complaint_id,
        c.complaint_number,
        c.user_id,
        c.service_type,
        c.description,
        c.status,
        c.priority,
        c.created_at,
        c.updated_at,
        t.full_name as technician_name,
        t.phone_number as technician_phone
       FROM complaints c
       LEFT JOIN technicians t ON c.assigned_to = t.technician_id
       WHERE ${whereClause.join(' AND ')}
       LIMIT 1`,
      params
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const complaint = result.rows[0];
    
    // Get timeline
    const timelineResult = await query(
      `SELECT status, timestamp, note
       FROM complaint_timeline
       WHERE complaint_id = $1
       ORDER BY timestamp ASC`,
      [complaint.complaint_id]
    );
    
    return {
      complaintId: complaint.complaint_id,
      complaintNumber: complaint.complaint_number,
      userId: complaint.user_id,
      serviceType: complaint.service_type,
      description: complaint.description,
      status: complaint.status,
      priority: complaint.priority,
      createdAt: complaint.created_at,
      updatedAt: complaint.updated_at,
      assignedTechnician: complaint.technician_name ? {
        name: complaint.technician_name,
        phone: complaint.technician_phone
      } : undefined,
      timeline: timelineResult.rows
    };
    */

    // Mock implementation
    console.log('Getting complaint:', request);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      complaintId: '1',
      complaintNumber: request.complaintNumber || 'CMP-2026-12345',
      userId: request.userId || 'mock-user-id',
      serviceType: request.serviceType || 'electricity',
      description: 'Frequent power cuts in the area',
      status: 'in_progress',
      priority: 'high',
      createdAt: '2026-01-28T10:30:00',
      updatedAt: '2026-01-29T14:20:00',
      assignedTechnician: {
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210'
      },
      timeline: [
        {
          status: 'open',
          timestamp: '2026-01-28T10:30:00',
          note: 'Complaint registered'
        },
        {
          status: 'in_progress',
          timestamp: '2026-01-29T14:20:00',
          note: 'Technician assigned, inspection scheduled'
        }
      ]
    };
  } catch (error) {
    console.error('Get complaint error:', error);
    return null;
  }
}

/**
 * Get user's complaints
 */
export async function getUserComplaints(userId: string, serviceType?: ServiceType): Promise<Complaint[]> {
  try {
    // Database implementation (uncomment when ready):
    /*
    const whereClause = serviceType 
      ? 'WHERE c.user_id = $1 AND c.service_type = $2'
      : 'WHERE c.user_id = $1';
    const params = serviceType ? [userId, serviceType] : [userId];
    
    const result = await query(
      `SELECT 
        c.complaint_id,
        c.complaint_number,
        c.user_id,
        c.service_type,
        c.description,
        c.status,
        c.priority,
        c.created_at,
        c.updated_at,
        t.full_name as technician_name,
        t.phone_number as technician_phone
       FROM complaints c
       LEFT JOIN technicians t ON c.assigned_to = t.technician_id
       ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );
    
    const complaints = await Promise.all(
      result.rows.map(async (complaint) => {
        const timelineResult = await query(
          `SELECT status, timestamp, note
           FROM complaint_timeline
           WHERE complaint_id = $1
           ORDER BY timestamp ASC`,
          [complaint.complaint_id]
        );
        
        return {
          complaintId: complaint.complaint_id,
          complaintNumber: complaint.complaint_number,
          userId: complaint.user_id,
          serviceType: complaint.service_type,
          description: complaint.description,
          status: complaint.status,
          priority: complaint.priority,
          createdAt: complaint.created_at,
          updatedAt: complaint.updated_at,
          assignedTechnician: complaint.technician_name ? {
            name: complaint.technician_name,
            phone: complaint.technician_phone
          } : undefined,
          timeline: timelineResult.rows
        };
      })
    );
    
    return complaints;
    */

    // Mock implementation
    console.log('Getting user complaints:', userId, serviceType);
    
    return [
      {
        complaintId: '1',
        complaintNumber: 'CMP-2026-12345',
        userId,
        serviceType: serviceType || 'electricity',
        description: 'Frequent power cuts in the area',
        status: 'in_progress',
        priority: 'high',
        createdAt: '2026-01-28T10:30:00',
        updatedAt: '2026-01-29T14:20:00',
        assignedTechnician: {
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210'
        },
        timeline: [
          {
            status: 'open',
            timestamp: '2026-01-28T10:30:00',
            note: 'Complaint registered'
          },
          {
            status: 'in_progress',
            timestamp: '2026-01-29T14:20:00',
            note: 'Technician assigned, inspection scheduled'
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Get user complaints error:', error);
    return [];
  }
}

/**
 * Update complaint status
 */
export async function updateComplaint(request: UpdateComplaintRequest): Promise<{ success: boolean; error?: string }> {
  try {
    // Database implementation (uncomment when ready):
    /*
    return await transaction(async (client) => {
      const updates = [];
      const params: any[] = [];
      let paramIndex = 1;
      
      if (request.status) {
        updates.push(`status = $${paramIndex++}`);
        params.push(request.status);
      }
      if (request.assignedTo) {
        updates.push(`assigned_to = $${paramIndex++}`);
        params.push(request.assignedTo);
      }
      if (request.resolutionNotes) {
        updates.push(`resolution_notes = $${paramIndex++}`);
        params.push(request.resolutionNotes);
      }
      
      if (request.status === 'resolved') {
        updates.push(`resolved_at = CURRENT_TIMESTAMP`);
      } else if (request.status === 'closed') {
        updates.push(`closed_at = CURRENT_TIMESTAMP`);
      }
      
      params.push(request.complaintId);
      
      await client.query(
        `UPDATE complaints 
         SET ${updates.join(', ')}
         WHERE complaint_id = $${paramIndex}`,
        params
      );
      
      // Add timeline entry
      if (request.status) {
        await client.query(
          `INSERT INTO complaint_timeline (complaint_id, status, note)
           VALUES ($1, $2, $3)`,
          [request.complaintId, request.status, request.resolutionNotes || `Status updated to ${request.status}`]
        );
      }
      
      return { success: true };
    });
    */

    // Mock implementation
    console.log('Updating complaint:', request);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  } catch (error) {
    console.error('Update complaint error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Helper function to generate complaint number
 */
async function generateComplaintNumber(serviceType: ServiceType): Promise<string> {
  const prefix = serviceType.toUpperCase().substring(0, 3);
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `CMP-${prefix}-${year}-${random}`;
}
