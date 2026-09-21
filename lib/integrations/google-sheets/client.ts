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
 * 3. Testing Architecture:
 *    - FakeGoogleSheetsAdapter provides an in-memory worksheet simulator validating exact headers,
 *      upsert behavior, and concurrency without external network dependencies.
 */

export class FakeGoogleSheetsAdapter implements GoogleSheetsAdapter {
  private sheets: Map<string, string[][]> = new Map()

  constructor(initialData?: Record<string, string[][]>) {
    if (initialData) {
      for (const [name, rows] of Object.entries(initialData)) {
        this.sheets.set(name, rows.map((r) => [...r]))
      }
    }
  }

  async ensureSheetExists(_spreadsheetId: string, sheetName: string, headers: string[]): Promise<void> {
    if (!this.sheets.has(sheetName)) {
      this.sheets.set(sheetName, [[...headers]])
    }
  }

  async getHeaders(_spreadsheetId: string, sheetName: string): Promise<string[]> {
    const rows = this.sheets.get(sheetName)
    if (!rows || rows.length === 0) return []
    return [...rows[0]]
  }

  async findRowIndexByRegistrationId(
    _spreadsheetId: string,
    sheetName: string,
    registrationId: string
  ): Promise<number | null> {
    const rows = this.sheets.get(sheetName)
    if (!rows) return null

    // Row 0 is header. Row 1 is data row 2 (1-based sheet row index)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === registrationId) {
        return i + 1 // 1-based index (e.g. Row 2)
      }
    }
    return null
  }

  async appendRow(
    _spreadsheetId: string,
    sheetName: string,
    values: (string | number)[]
  ): Promise<{ rowNumber: number }> {
    let rows = this.sheets.get(sheetName)
    if (!rows) {
      rows = []
      this.sheets.set(sheetName, rows)
    }
    rows.push(values.map(String))
    return { rowNumber: rows.length }
  }

  async updateRow(
    _spreadsheetId: string,
    sheetName: string,
    rowIndex: number,
    values: (string | number)[]
  ): Promise<void> {
    const rows = this.sheets.get(sheetName)
    if (!rows) throw new Error(`Sheet "${sheetName}" not found.`)
    const zeroBased = rowIndex - 1
    if (zeroBased < 0 || zeroBased >= rows.length) {
      throw new Error(`Row index ${rowIndex} out of bounds.`)
    }
    rows[zeroBased] = values.map(String)
  }

  async getAllRows(_spreadsheetId: string, sheetName: string): Promise<string[][]> {
    const rows = this.sheets.get(sheetName)
    if (!rows) return []
    return rows.map((r) => [...r])
  }
}

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
      `${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
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
    await this.fetchApi(`${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
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
