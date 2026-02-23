export function canAssignComplaints(role) {
    return role === 'super_admin' || role === 'dept_admin' || role === 'csr';
}
export function canApproveConnections(role) {
    return role === 'super_admin' || role === 'dept_admin';
}
export function canManageBilling(role) {
    return role === 'super_admin' || role === 'dept_admin' || role === 'billing';
}
export function canViewAnalytics(role) {
    return role === 'super_admin' || role === 'dept_admin';
}
export function canSwitchAllDepartments(role) {
    return role === 'super_admin';
}
