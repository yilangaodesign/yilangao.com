/**
 * Updates only `site-config.role` to the canonical SITE_ROLE_DISPLAY.
 * Run: PAYLOAD_CONFIG_PATH=src/payload.config.ts npx tsx src/scripts/patch-site-role.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { SITE_ROLE_DISPLAY } from '@/lib/site-role-display'

async function main() {
  const payload = await getPayload({ config })
  await payload.updateGlobal({
    slug: 'site-config',
    data: { role: SITE_ROLE_DISPLAY },
  })
  console.log('Updated site-config.role:', SITE_ROLE_DISPLAY)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
