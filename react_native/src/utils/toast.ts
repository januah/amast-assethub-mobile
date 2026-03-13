import Toast from 'react-native-toast-message';

const API_ERROR_MSG = 'Something is wrong';

function getSuccessMessage(path: string, method: string): string {
  if (path.startsWith('/service-requests/') && path.endsWith('/status')) return 'Status updated successfully';
  if (path === '/service-requests' && method === 'POST') return 'Breakdown reported successfully';
  if (path.startsWith('/profile')) return 'Profile updated successfully';
  if (path.includes('/notifications') && path.includes('/read')) return 'Marked as read';
  if (path.includes('/replacements')) return 'Replacement requested successfully';
  if (path.includes('/removal-requests')) return 'Removal request submitted successfully';
  if (path.includes('/appointments/ppm/') && path.includes('/confirm')) return 'Schedule confirmed successfully';
  if (path.includes('/appointments/ppm/') && path.includes('/request-new-dates')) return 'Date change requested successfully';
  if (path.includes('/team/users') || path.includes('/users')) return 'Staff added successfully';
  if (path.includes('/pending-approvals') || path.includes('/approve') || path.includes('/reject')) return 'Approval submitted successfully';
  return 'Request completed successfully';
}

export function showSuccessToast(message?: string, path?: string, method?: string) {
  const text = message || (path && method ? getSuccessMessage(path, method) : 'Request completed successfully');
  Toast.show({ type: 'success', text1: text });
}

export function showErrorToast(message?: string) {
  Toast.show({ type: 'error', text1: message || API_ERROR_MSG });
}

export function showApiErrorToast(message?: string) {
  showErrorToast(message || API_ERROR_MSG);
}
