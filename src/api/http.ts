import keycloak from '../keycloak'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export async function apiRequest<TResponse>(
  path: string,
  method: HttpMethod,
  body?: unknown,
): Promise<TResponse> {
  const token = keycloak.token
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}
