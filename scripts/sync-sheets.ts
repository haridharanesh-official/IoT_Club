import { drainGoogleSheetsOutbox } from '../lib/integrations/google-sheets'

async function main() {
  console.log('========================================================')
  console.log('STARTING GOOGLE SHEETS OUTBOX DRAIN WORKER')
  console.log('========================================================')

  const summary = await drainGoogleSheetsOutbox(10)
  console.log('Total Processed:', summary.totalProcessed)
  console.log('Succeeded:      ', summary.succeeded)
  console.log('Failed:         ', summary.failed)

  if (summary.error) {
    console.error('Worker Warning/Error:', summary.error)
  }

  if (summary.details.length > 0) {
    console.log('\nDetails:')
    for (const d of summary.details) {
      console.log(`- [${d.status}] Registration: ${d.registrationId || d.entityId} (${d.operation || 'N/A'}) ${d.error ? 'Error: ' + d.error : ''}`)
    }
  }

  console.log('========================================================')
  console.log('OUTBOX DRAIN COMPLETE')
  console.log('========================================================')
}

main().catch((err) => {
  console.error('Fatal error during outbox drain:', err)
  process.exit(1)
})
