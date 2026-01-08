// Client-side only — no server secrets or database access here

export { api } from './api-client';
export type { ApiResult, FetchOptions } from './api-client';

// Upload functions
export { uploadQuestionImage, deleteQuestionImage } from './uploads';
export type { UploadResult, UploadResponse } from './uploads';
