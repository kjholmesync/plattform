import * as jose from 'jose'
import { NextRequest } from 'next/server'

// Extend jose JWTPayload with our expected payload properties
export type JWTPayload = jose.JWTPayload & {
  roles?: string[]
}

export function getSessionCookieValue(req: NextRequest) {
  const sessionCookieName = process.env.COOKIE_NAME ?? 'connect.sid'
  return req.cookies[sessionCookieName]
}

function getJWTCookieValue(req: NextRequest) {
  const jwtCookieName = process.env.JWT_COOKIE_NAME ?? 'republik-token'
  return req.cookies[jwtCookieName]
}

/**
 * Load the public key from env-variables and parse to work with `jose`
 */
async function loadPublicKey() {
  const rawPublicKey = process.env.JWT_PUBLIC_KEY
    ? Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString()
    : null
  const publicKey = await jose.importSPKI(rawPublicKey, 'ES256')
  if (!publicKey) {
    throw new Error('JWT_PUBLIC_KEY is not defined')
  }
  return publicKey
}

/**
 * Verify the JWT token and validate the payloads shape
 * @param token
 */
async function verifyJWT(token: string): Promise<JWTPayload> {
  const publicKey = await loadPublicKey()
  const { payload } = await jose.jwtVerify(token, publicKey, {
    issuer: process.env.JWT_ISSUER,
  })

  return payload
}

/**
 * Check if both the session cookie and the JWT are present.
 * If both are present, check if the JWT is valid and return the payload
 * @param req
 */
export async function parseAndVerifyJWT(
  req: NextRequest,
): Promise<JWTPayload | null> {
  const sessionCookie = getSessionCookieValue(req)
  const jwtCookie = getJWTCookieValue(req)

  if (!sessionCookie || !jwtCookie) {
    return null
  }

  return await verifyJWT(jwtCookie)
}
