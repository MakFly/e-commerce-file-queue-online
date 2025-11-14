/**
 * Common Types
 *
 * Types utilisés dans toute l'application
 */

export type ApiError = {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type Timestamp = {
  created_at: string;
  updated_at: string;
};

export type WithId = {
  id: number;
};

export type BaseEntity = WithId & Timestamp;
