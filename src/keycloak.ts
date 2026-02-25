import Keycloak from 'keycloak-js'

const requiredEnvKeys = [
  'VITE_KEYCLOAK_URL',
  'VITE_KEYCLOAK_REALM',
  'VITE_KEYCLOAK_CLIENT_ID',
] as const

function getEnvValue(key: (typeof requiredEnvKeys)[number]): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Missing required env var: ${key}`)
  }

  return value
}

const keycloak = new Keycloak({
  url: getEnvValue('VITE_KEYCLOAK_URL'),
  realm: getEnvValue('VITE_KEYCLOAK_REALM'),
  clientId: getEnvValue('VITE_KEYCLOAK_CLIENT_ID'),
})

export async function initKeycloak(): Promise<boolean> {
  return keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  })
}

export default keycloak
