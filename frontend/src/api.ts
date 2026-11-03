const BASE = 'http://localhost:8081/api'

export const getToken = () => localStorage.getItem('token')

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export function api(path: string, options: RequestInit = {}) {
  const token = getToken()
  return fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}