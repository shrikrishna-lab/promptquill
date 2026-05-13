import { supabase } from './supabase';

/**
 * Audit logging functions for admin actions
 * Temporarily disabled to prevent 404 network errors until admin_audit_logs table is created.
 */

export const auditCreateAdmin = async () => {};
export const auditDeleteUser = async () => {};
export const auditPromotePro = async () => {};
export const auditDemotePro = async () => {};
export const auditAdjustCredits = async () => {};
export const auditActionFailed = async () => {};
