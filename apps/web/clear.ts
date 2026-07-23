import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from 'dotenv'

config({ path: '.env.local' })

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

async function main() {
  console.log('Truncating tables...')
  await client`TRUNCATE TABLE organizations CASCADE`
  await client`TRUNCATE TABLE customers CASCADE`
  console.log('Done.')
  process.exit(0)
}

main().catch(console.error)
