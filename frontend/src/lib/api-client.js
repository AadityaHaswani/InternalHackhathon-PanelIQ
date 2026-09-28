/**
 * PanelIQ Shared API Client
 * Follows the backend contract strictly:
 * - Base URL: import.meta.env.VITE_API_BASE_URL or 'http://localhost:4000/api/v1'
 * - Bearer authorization token on protected routes
 * - Parses standard backend envelopes:
 *   Success: { data: ..., requestId: '...' }
 *   Error:   { error: { code: '...', message: '...', retryable: boolean }, requestId: '...' }
 * - Preserves X-Request-Id header and requestId
 * - Supports AbortSignal
 */

export class ApiClientError extends Error {
  constructor(status, code, message, retryable = false, requestId = null, details = null) {
    super(message || 'An API error occurred');
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code || 'UNKNOWN_ERROR';
    this.retryable = Boolean(retryable);
    this.requestId = requestId;
    this.details = details;
  }
}

let currentAccessToken = null;

export function setApiAccessToken(token) {
  currentAccessToken = token;
}

export function getApiAccessToken() {
  return currentAccessToken;
}

function resolveBaseUrl(rawUrl) {
  const url = (rawUrl || 'http://localhost:4000/api/v1').trim().replace(/\/+$/, '');
  return url.endsWith('/api/v1') ? url : `${url}/api/v1`;
}

const DEFAULT_BASE_URL = resolveBaseUrl(import.meta.env.VITE_API_BASE_URL);

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    token = currentAccessToken,
    headers = {},
    signal,
    baseUrl = DEFAULT_BASE_URL,
    ...rest
  } = options;

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  const url = path.startsWith('http')
    ? path
    : cleanBase.endsWith('/api/v1') && cleanPath.startsWith('api/v1/')
      ? `${cleanBase.slice(0, -7)}/${cleanPath}`
      : `${cleanBase}/${cleanPath}`;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined && !(body instanceof FormData) ? JSON.stringify(body) : body,
      signal,
      ...rest,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    // Network failure / server unreachable
    throw new ApiClientError(
      0,
      'NETWORK_FAILURE',
      'Unable to connect to the PanelIQ backend server. Please verify the service is running.',
      true,
      null,
      err
    );
  }

  const requestId = response.headers.get('x-request-id') || null;
  let responseData = null;

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const errorPayload = responseData?.error;
    const code = errorPayload?.code || `HTTP_${response.status}`;
    const message = errorPayload?.message || response.statusText || 'Request failed';
    const retryable = Boolean(errorPayload?.retryable);
    const resolvedRequestId = responseData?.requestId || requestId;

    throw new ApiClientError(
      response.status,
      code,
      message,
      retryable,
      resolvedRequestId,
      errorPayload
    );
  }

  // Success envelope: { data: ..., requestId: '...' }
  return {
    data: responseData?.data !== undefined ? responseData.data : responseData,
    requestId: responseData?.requestId || requestId,
  };
}

export const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};

export default apiClient;
