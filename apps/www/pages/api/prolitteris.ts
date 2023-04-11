import { NextApiRequest, NextApiResponse } from 'next'
import truncateIP from '../../lib/api/TruncateIP'
import withReqMethodGuard from '../../lib/api/withReqMethodGuard'
import HTTPMethods from '../../lib/api/HTTPMethods'
import crypto from 'node:crypto'
import { object } from 'prop-types'

/**
 * Generate a sha256 hash from a string, number, object or array
 * @param input
 * @returns
 */
function getHash(input: string | number | object): string {
  const hash = crypto.createHash('sha256')
  if (input instanceof object || Array.isArray(input)) {
    hash.update(JSON.stringify(input))
  } else {
    hash.update(input.toString())
  }
  return hash.digest('hex')
}

const {
  PROLITTERIS_MEMBER_ID,
  PROLITTERIS_DOMAIN,
  PROLITTERIS_USER_AGENT,
  PUBLIC_BASE_URL,
  PROLITTERIS_DEV_UID,
} = process.env

/**
 *
 * @param req
 * @param res
 */
async function handler(request: NextApiRequest, response: NextApiResponse) {
  const requestIps =
    request.headers['x-forwarded-for'] || request.socket.remoteAddress

  const ua = request.headers['user-agent']

  // throw error if no IP is supplied
  if (!requestIps) {
    throw new Error('IP undefined')
  }

  // if x-forwarded-for contains an array of ip's, use the left most (client)
  const requestIp = Array.isArray(requestIps) ? requestIps[0] : requestIps

  // Query Parameters of request
  // 1) paid (string, 'pw' || 'na'): request by paying user (pw) or public (na)
  // 2) uid (string): documentId of the article
  // 3) path (string): article slug

  const { paid, uid, path } = request.query

  // Check that all query parameters are defined.
  if (!paid) {
    return response.status(400).json({
      body: 'paid parameter required.',
    })
  }

  if (paid !== 'na' && paid !== 'pw') {
    return response.status(400).json({
      body: "Paid parameter must be string 'na' or 'pw'",
    })
  }

  if (!uid) {
    return response.status(400).json({
      body: 'uid parameter required.',
    })
  }

  if (!path) {
    return response.status(400).json({
      body: 'path parameter required.',
    })
  }

  // create unique C-Parameter for each request (20 characters hex) from the ip and user agent
  const cParam: string = getHash([requestIp, ua]).substring(0, 20)
  const uidParam = PROLITTERIS_DEV_UID || uid
  const maskedIP = truncateIP(requestIp)

  const fetchUrl =
    `${PROLITTERIS_DOMAIN}` +
    `/${paid}/vzm.${PROLITTERIS_MEMBER_ID}-${uidParam}` +
    `?c=${cParam}`

  const requestHeaders = {
    'User-Agent': PROLITTERIS_USER_AGENT,
    Referer: PUBLIC_BASE_URL + path,
    'X-Forwarded-For': maskedIP,
  }

  return await fetch(fetchUrl, {
    method: 'GET',
    headers: requestHeaders,
  }).then((res: Response) => {
    if (!res.ok) {
      console.error('Prolitteris API responded with an error', {
        status: res.status,
        statusText: res.statusText,
      })
    }
    return response.status(204).send(null)
  })
}

export default withReqMethodGuard(handler, [HTTPMethods.GET, HTTPMethods.HEAD])
