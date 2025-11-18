export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ApiSuccessResponse<T> extends ApiResponse {
  success: true;
  data: T;
}

export interface ApiErrorResponse extends ApiResponse {
  success: false;
  errors: null | { [key: string]: string[] };
  status?: string;
}

export type Response<T> = ApiSuccessResponse<T> | ApiErrorResponse;
