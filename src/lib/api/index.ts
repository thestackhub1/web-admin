/**
 * API Module Index (Server-Side)
 * 
 * Re-exports server-side API utilities.
 * For client-side API client, use @/client/api/api-client
 */

export * from './response';
export * from './supabase-admin';
export * from './validators';
export { serverApi } from './api-client';
export { authServerApi, isAuthenticated } from './auth-server-api';
