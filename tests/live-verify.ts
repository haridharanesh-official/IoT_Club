import assert from 'node:assert/strict'
import {
  createGoogleSheetsAdapterFromEnv,
  loadServiceAccountCredentialsFromEnv,
  getGoogleAccessToken,
  HttpGoogleSheetsAdapter,
} from '../lib/integrations/google-sheets/client'
import {
  REGISTRATIONS_SHEET_HEADERS,
  REGISTRATIONS_SHEET_NAME,
  validateSheetHeaders,
} from '../lib/integrations/google-sheets/mapper'

async function main() {
  console.log('========================================================')
  console.log('PHASE 07.1: LIVE GOOGLE SHEETS ACCESS VERIFICATION')
  console.log('========================================================')

  const creds = loadServiceAccountCredentialsFromEnv()
  assert.ok(creds, 'Service account credentials loaded')
  console.log('Credential file loaded successfully.')
  console.log('Service account email:', creds.client_email)

  console.log('\nTesting OAuth token exchange...')
  const token = await getGoogleAccessToken(creds)
  assert.ok(token && typeof token === 'string' && token.length > 20, 'Token exchange succeeded')
  console.log('Google authentication: PASS')

  const spreadsheetId = '1QCiG6yWk8IG--qO14BWx6rfw5IZfd01DKDvgjNUZ7VE'
  const adapter = new HttpGoogleSheetsAdapter(() => getGoogleAccessToken(creds))

  console.log('\nReading headers from sheet:', `${REGISTRATIONS_SHEET_NAME}!A1:AB1`)
  const actualHeaders = await adapter.getHeaders(spreadsheetId, REGISTRATIONS_SHEET_NAME)

  console.log('Spreadsheet access: PASS')
  console.log('Worksheet access: PASS')

  console.log(`Found ${actualHeaders.length} headers in row 1:`)
  console.log(JSON.stringify(actualHeaders))

  const validation = validateSheetHeaders(actualHeaders)
  if (!validation.valid) {
    console.error('\nHeader validation: FAIL')
    console.error('Error:', validation.error)
    process.exit(1)
  }

  console.log('\nHeader validation: PASS')
  console.log('Exact 28-column header contract verified against live Google Sheet!')
}

main().catch((err) => {
  console.error('\nLIVE VERIFICATION FAILED:')
  console.error(err.message || err)
  process.exit(1)
})
