/**
 * API Endpoints Index
 * Centralized export of all API endpoint modules
 */

export { authEndpoints } from './authEndpoints';
export { userEndpoints } from './userEndpoints';
export { examEndpoints } from './examEndpoints';
export { resultEndpoints } from './resultEndpoints';
export { flashcardEndpoints } from './flashcardEndpoints';
export { osceEndpoints } from './osceEndpoints';
export { analyticsEndpoints } from './analyticsEndpoints';

// Re-export API client for direct usage when needed
export { apiClient, ApiError } from '../apiClient';
