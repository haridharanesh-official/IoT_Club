import type { GoogleSheetsAdapter } from '../../lib/integrations/google-sheets/types'

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
