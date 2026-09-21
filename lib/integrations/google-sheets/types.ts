export type SheetSyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'

export interface SheetSyncLog {
  id: string
  entity_type: 'MEMBERSHIP_APPLICATION'
  entity_id: string
  operation: 'UPSERT'
  sync_status: SheetSyncStatus
  attempt_count: number
  last_attempt_at: string | null
  synced_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface GoogleSheetsConfig {
  spreadsheetId: string
  sheetName: string
}

export interface GoogleSheetsAdapter {
  getHeaders(spreadsheetId: string, sheetName: string): Promise<string[]>
  ensureSheetExists(spreadsheetId: string, sheetName: string, headers: string[]): Promise<void>
  findRowIndexByRegistrationId(spreadsheetId: string, sheetName: string, registrationId: string): Promise<number | null>
  appendRow(spreadsheetId: string, sheetName: string, values: (string | number)[]): Promise<{ rowNumber: number }>
  updateRow(spreadsheetId: string, sheetName: string, rowIndex: number, values: (string | number)[]): Promise<void>
  getAllRows(spreadsheetId: string, sheetName: string): Promise<string[][]>
}

export interface SheetSyncResult {
  success: boolean
  operation?: 'APPEND' | 'UPDATE'
  rowNumber?: number
  registrationId?: string
  error?: string
}

export interface BatchSyncSummary {
  totalProcessed: number
  succeeded: number
  failed: number
  details: Array<{
    entityId: string
    registrationId?: string
    status: 'SYNCED' | 'FAILED'
    operation?: 'APPEND' | 'UPDATE'
    error?: string
  }>
}

export interface FullApplicationData {
  application: {
    id: string
    user_id: string
    registration_id: string
    reason_for_joining: string
    skill_level: string
    previous_iot_experience: boolean
    experience_description: string | null
    status: string
    submitted_at: string
    reviewed_at: string | null
    reviewed_by: string | null
    review_notes: string | null
  }
  profile: {
    id: string
    full_name: string | null
    email: string
  }
  studentProfile: {
    registration_id: string
    register_number: string
    department: string
    degree_programme: string
    year_of_study: number
    semester: number
    section: string | null
    batch: string
    mobile_number: string
    personal_email: string
    college_email: string
    gender: string | null
    github_url: string | null
    linkedin_url: string | null
    portfolio_url: string | null
  }
  interests: Array<{ interest: string }>
  skills: Array<{ category: string; skill: string; level: string }>
  reviewerProfile?: {
    full_name: string | null
    email: string
  } | null
}
