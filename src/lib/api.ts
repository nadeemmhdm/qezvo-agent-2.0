import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import { auth } from './firebase'
import type { ApiResult, ApiError } from '@/types'

const baseURL = import.meta.env['VITE_API_URL'] ?? '/api'

export const apiClient = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Firebase ID token to every authenticated request
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Normalize API errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.data?.success === false) {
      return Promise.reject(error.response.data)
    }

    // Network / timeout error
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message ?? 'Network request failed',
        requestId: 'unknown',
      },
    }
    return Promise.reject(apiError)
  }
)

// Typed API methods
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<ApiResult<T>>(url, config)
  const result = response.data
  if (!result.success) throw result
  return result.data
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<ApiResult<T>>(url, data, config)
  const result = response.data
  if (!result.success) throw result
  return result.data
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<ApiResult<T>>(url, data, config)
  const result = response.data
  if (!result.success) throw result
  return result.data
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<ApiResult<T>>(url, data, config)
  const result = response.data
  if (!result.success) throw result
  return result.data
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<ApiResult<T>>(url, config)
  const result = response.data
  if (!result.success) throw result
  return result.data
}

// Extract user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'success' in error &&
    !error.success &&
    'error' in error
  ) {
    const apiErr = error as ApiError
    return apiErr.error.message
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred. Please try again.'
}
