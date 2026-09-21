import type { GoogleSheetsAdapter, GoogleSheetsConfig, SheetSyncResult } from './types'
import { REGISTRATIONS_SHEET_HEADERS, validateSheetHeaders } from './mapper'

export async function upsertRegistrationRow(
  adapter: GoogleSheetsAdapter,
  config: GoogleSheetsConfig,
  rowValues: string[]
): Promise<SheetSyncResult> {
  const { spreadsheetId, sheetName } = config
  const registrationId = rowValues[0]

  if (!registrationId || !registrationId.startsWith('IOT-')) {
    return {
      success: false,
      error: `Invalid registration ID format: "${registrationId}".`,
    }
  }

  try {
    // 1. Ensure sheet exists with proper headers
    await adapter.ensureSheetExists(spreadsheetId, sheetName, [...REGISTRATIONS_SHEET_HEADERS])

    // 2. Validate current headers
    const currentHeaders = await adapter.getHeaders(spreadsheetId, sheetName)
    const headerValidation = validateSheetHeaders(currentHeaders)
    if (!headerValidation.valid) {
      return {
        success: false,
        registrationId,
        error: `Sheet header validation failed: ${headerValidation.error}`,
      }
    }

    // 3. Check for existing row index by Registration ID (Column A)
    const existingRowIndex = await adapter.findRowIndexByRegistrationId(
      spreadsheetId,
      sheetName,
      registrationId
    )

    if (existingRowIndex !== null && existingRowIndex > 0) {
      // 4. Update existing row
      await adapter.updateRow(spreadsheetId, sheetName, existingRowIndex, rowValues)
      return {
        success: true,
        operation: 'UPDATE',
        rowNumber: existingRowIndex,
        registrationId,
      }
    } else {
      // 5. Append new row
      const appendResult = await adapter.appendRow(spreadsheetId, sheetName, rowValues)
      return {
        success: true,
        operation: 'APPEND',
        rowNumber: appendResult.rowNumber,
        registrationId,
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    // Sanitize any accidental token or credential exposure in error messages
    const sanitized = message.replace(/(?:Bearer|token|secret|key|AIza)[^\s'"]+/gi, '[REDACTED]')
    return {
      success: false,
      registrationId,
      error: `Google Sheets upsert error: ${sanitized}`,
    }
  }
}
