const DEFAULT_API_URL = 'http://localhost:4100/api'

function normalizeApiUrl(url: string) {
  const cleanUrl = url.trim().replace(/\/+$/, '')

  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`
}

const rawApiUrl = import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
const API_URL = normalizeApiUrl(rawApiUrl)

type ApiOptions = RequestInit & {
  token?: string | null
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}) {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(payload.message ?? 'Request gagal.', response.status)
  }

  return payload as T
}

export const apiBaseUrl = API_URL
