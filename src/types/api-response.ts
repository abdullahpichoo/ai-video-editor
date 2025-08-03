export interface IApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
