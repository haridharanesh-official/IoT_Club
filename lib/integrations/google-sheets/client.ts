import type { GoogleSheetsAdapter } from './types'

/**
 * GOOGLE AUTHENTICATION ARCHITECTURAL GUIDANCE:
 *
 * 1. Production Architecture (Recommended):
 *    - Use Vercel Workload Identity (OIDC) federated to Google Cloud IAM Workload Identity Federation.
 *    - In this model, Vercel provides a signed JWT for the serverless invocation.
 *    - Google Cloud STS exchanges the Vercel OIDC token for short-lived Google access tokens.
 *    - ADVANTAGE: Zero long-lived private keys stored in environment variables, automated rotation,
 *      and principle of least privilege.
 *
 * 2. Fallback / Local Service Account Architecture:
 *    - Use a dedicated Google Cloud Service Account with "Editor" permissions on the designated spreadsheet.
 *    - Configured locally via GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS.
 *    - IMPORTANT: Never expose service account keys to client bundles (no NEXT_PUBLIC_* prefix).
 *
 * Test-only adapters live under tests/fixtures and are never imported here.
 */

/**
 * Real Google Sheets REST API adapter for server-side execution.
 */
export class HttpGoogleSheetsAdapter implements GoogleSheetsAdapter {
  private accessTokenProvider: () => Promise<string>

  constructor(accessTokenProvider: () => Promise<string>) {
    this.accessTokenProvider = accessTokenProvider
  }

  private async fetchApi(path: string, options: RequestInit = {}) {
    const token = await this.accessTokenProvider()
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Google Sheets API error (${res.status}): ${errorText}`)
    }
    return res.json()
  }

  async ensureSheetExists(spreadsheetId: string, sheetName: string, headers: string[]): Promise<void> {
    const meta = await this.fetchApi(`${spreadsheetId}`)
    const existingSheet = (meta.sheets || []).find(
      (s: { properties?: { title?: string } }) => s.properties?.title === sheetName
    )
    if (!existingSheet) {
      // Add sheet
      await this.fetchApi(`${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [{ addSheet: { properties: { title: sheetName } } }],
        }),
      })
      // Write headers
      await this.updateRow(spreadsheetId, sheetName, 1, headers)
    }
  }

  async getHeaders(spreadsheetId: string, sheetName: string): Promise<string[]> {
    const range = encodeURIComponent(`${sheetName}!A1:AB1`)
    const data = await this.fetchApi(`${spreadsheetId}/values/${range}`)
    return (data.values && data.values[0]) || []
  }

  async findRowIndexByRegistrationId(
    spreadsheetId: string,
    sheetName: string,
    registrationId: string
  ): Promise<number | null> {
    const range = encodeURIComponent(`${sheetName}!A:A`)
    const data = await this.fetchApi(`${spreadsheetId}/values/${range}`)
    const rows: string[][] = data.values || []
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && rows[i][0] === registrationId) {
        return i + 1
      }
    }
    return null
  }

  async appendRow(
    spreadsheetId: string,
    sheetName: string,
    values: (string | number)[]
  ): Promise<{ rowNumber: number }> {
    const range = encodeURIComponent(`${sheetName}!A:AB`)
    const res = await this.fetchApi(
      `${spreadsheetId}/values/${range}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        body: JSON.stringify({
          values: [values],
        }),
      }
    )
    const updatedRange: string = res.updates?.updatedRange || ''
    const match = updatedRange.match(/!A(\d+):/)
    const rowNumber = match ? parseInt(match[1], 10) : 0
    return { rowNumber }
  }

  async updateRow(
    spreadsheetId: string,
    sheetName: string,
    rowIndex: number,
    values: (string | number)[]
  ): Promise<void> {
    const range = encodeURIComponent(`${sheetName}!A${rowIndex}:AB${rowIndex}`)
    await this.fetchApi(`${spreadsheetId}/values/${range}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({
        values: [values],
      }),
    })
  }

  async getAllRows(spreadsheetId: string, sheetName: string): Promise<string[][]> {
    const range = encodeURIComponent(`${sheetName}!A:AB`)
    const data = await this.fetchApi(`${spreadsheetId}/values/${range}`)
    return data.values || []
  }
}

export interface ServiceAccountCredentials {
  client_email: string
  private_key: string
  [key: string]: unknown
}

export function loadServiceAccountCredentialsFromEnv(): ServiceAccountCredentials | null {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (inline) {
    try {
      const trimmed = inline.trim()
      if (trimmed.startsWith('{')) {
        return JSON.parse(trimmed)
      }
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8')
      return JSON.parse(decoded)
    } catch {
      return null
    }
  }

  let filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const { existsSync, readFileSync } = require('node:fs')

  if (!filePath && existsSync('.env.local')) {
    try {
      const localEnv = Object.fromEntries(
        readFileSync('.env.local', 'utf8')
          .split(/\r?\n/)
          .filter((line: string) => line.includes('=') && !line.startsWith('#'))
          .map((line: string) => {
            const at = line.indexOf('=')
            return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')]
          })
      )
      filePath = localEnv.GOOGLE_APPLICATION_CREDENTIALS
    } catch {
      // ignore
    }
  }

  if (filePath) {
    try {
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf8')
        return JSON.parse(content)
      }
    } catch {
      return null
    }
  }

  return null
}

export async function getGoogleAccessToken(creds: ServiceAccountCredentials): Promise<string> {
  const { createSign } = require('node:crypto')
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const base64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')

  const encodedHeader = base64url(header)
  const encodedPayload = base64url(payload)
  const message = `${encodedHeader}.${encodedPayload}`

  const signer = createSign('RSA-SHA256')
  signer.update(message)
  signer.end()
  const signature = signer.sign(creds.private_key, 'base64url')

  const assertion = `${message}.${signature}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Google OAuth token exchange failed (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.access_token
}

export function createGoogleSheetsAdapterFromEnv(): GoogleSheetsAdapter {
  const creds = loadServiceAccountCredentialsFromEnv()
  if (!creds) {
    const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'C:/Secure/IoT-Club/iot-club-sheets-dev.json'
    throw new Error(
      `Google credentials not found at "${filePath}". To enable live Google Sheets synchronization, please place your Service Account JSON key at that location or set GOOGLE_SERVICE_ACCOUNT_KEY.`
    )
  }
  return new HttpGoogleSheetsAdapter(() => getGoogleAccessToken(creds))
}
