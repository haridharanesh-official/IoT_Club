import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpGoogleSheetsAdapter } from '../../lib/integrations/google-sheets/client'

afterEach(() => vi.unstubAllGlobals())

describe('Google Sheets literal writes', () => {
  it('sends formula-looking student text with RAW append semantics', async () => {
    const requests: Array<{ url: string; body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn(async (input: string, init: RequestInit) => {
      requests.push({ url: input, body: JSON.parse(String(init.body)) })
      return new Response(JSON.stringify({ updates: { updatedRange: 'Registrations!A2:AB2' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }))

    const value = '=IMPORTXML("https://example.test", "//x")'
    const adapter = new HttpGoogleSheetsAdapter(async () => '')
    const result = await adapter.appendRow('synthetic-sheet', 'Registrations', ['IOT-TEST-00001', value])

    expect(result.rowNumber).toBe(2)
    expect(requests[0].url).toContain('valueInputOption=RAW')
    expect(requests[0].body).toEqual({ values: [['IOT-TEST-00001', value]] })
  })

  it('sends formula-looking text with RAW update semantics', async () => {
    const requests: Array<{ url: string; body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn(async (input: string, init: RequestInit) => {
      requests.push({ url: input, body: JSON.parse(String(init.body)) })
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))

    const value = '+SUM(1,2)'
    const adapter = new HttpGoogleSheetsAdapter(async () => '')
    await adapter.updateRow('synthetic-sheet', 'Registrations', 2, ['IOT-TEST-00001', value])

    expect(requests[0].url).toContain('valueInputOption=RAW')
    expect(requests[0].body).toEqual({ values: [['IOT-TEST-00001', value]] })
  })
})
