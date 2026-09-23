export function normalizeSpreadsheetId(rawValue: string | undefined): string {
  if (!rawValue) return ''

  let value = rawValue.trim()

  // Vercel values occasionally get pasted with surrounding quotes.
  value = value.replace(/^['"]|['"]$/g, '').trim()

  // Accept either the raw spreadsheet ID or a full Google Sheets URL.
  const urlMatch = value.match(
    /https?:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]+)/i
  )

  if (urlMatch?.[1]) {
    value = urlMatch[1]
  }

  return value.trim()
}

export function isPlausibleSpreadsheetId(value: string): boolean {
  return /^[A-Za-z0-9_-]{20,}$/.test(value)
}

export function spreadsheetIdFingerprint(value: string): string {
  if (!value) return 'missing'
  if (value.length <= 8) return `len=${value.length}`
  return `${value.slice(0, 4)}…${value.slice(-4)} (len=${value.length})`
}

export function normalizeSheetName(rawValue: string | undefined): string {
  const value = (rawValue || 'Registrations').trim().replace(/^['"]|['"]$/g, '').trim()
  return value || 'Registrations'
}
