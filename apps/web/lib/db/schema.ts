import {
  pgTable,
  pgSchema,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  time,
  date,
  uniqueIndex,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// -----------------------------------------------------------------------------
// Supabase Auth Schema Reference
// -----------------------------------------------------------------------------
export const authSchema = pgSchema('auth')

export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
})

// -----------------------------------------------------------------------------
// Enum Types
// -----------------------------------------------------------------------------
export const bookingSourceEnum = pgEnum('booking_source', [
  'ONLINE',
  'WALK_IN',
  'PHONE',
  'STAFF',
])

export const bookingStatusEnum = pgEnum('booking_status', [
  'CONFIRMED',
  'CHECKED_IN',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
])

export const memberRoleEnum = pgEnum('member_role', ['OWNER', 'STAFF'])

export const themeEnum = pgEnum('theme', ['system', 'light', 'dark'])
export const languageEnum = pgEnum('language', ['en', 'hi'])

// -----------------------------------------------------------------------------
// Tables
// -----------------------------------------------------------------------------

// 0. App Users (Canonical Application User)
export const appUsers = pgTable('app_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  authUserId: uuid('auth_user_id')
    .notNull()
    .unique()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  displayName: text('display_name'),
  avatarImageUrl: text('avatar_image_url'),
  preferredLanguage: languageEnum('preferred_language').notNull().default('en'),
  theme: themeEnum('theme').notNull().default('system'),
  timezone: text('timezone'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// 1. Organizations
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    phone: text('phone'),
    email: text('email'),
    address: text('address'),
    timezone: text('timezone').notNull().default('UTC'),
    bookingInterval: integer('booking_interval').notNull().default(30),
    minAdvanceMinutes: integer('min_advance_minutes').notNull().default(0),
    cancellationCutoffHours: integer('cancellation_cutoff_hours')
      .notNull()
      .default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex('organizations_slug_unique').on(table.slug)]
)

// 2. Organization Members
export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => appUsers.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('org_members_org_user_unique').on(
      table.organizationId,
      table.userId
    ),
    index('org_members_user_id_idx').on(table.userId),
  ]
)

// 3. Customers
export const customers = pgTable(
  'customers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => appUsers.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('customers_org_phone_idx').on(table.organizationId, table.phone),
    index('customers_org_email_idx').on(table.organizationId, table.email),
    index('customers_user_id_idx').on(table.userId),
    check(
      'customers_contact_check',
      sql`${table.phone} IS NOT NULL OR ${table.email} IS NOT NULL`
    ),
  ]
)

// 4. Services
export const services = pgTable(
  'services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    duration: integer('duration').notNull(),
    price: integer('price').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('services_org_active_idx').on(table.organizationId, table.isActive),
  ]
)

// 5. Resources
export const resources = pgTable(
  'resources',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('resources_org_active_idx').on(table.organizationId, table.isActive),
  ]
)

// 6. Business Hours
export const businessHours = pgTable(
  'business_hours',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(),
    isClosed: boolean('is_closed').notNull().default(false),
    openTime: time('open_time'),
    closeTime: time('close_time'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('business_hours_org_day_unique').on(
      table.organizationId,
      table.dayOfWeek
    ),
    check(
      'business_hours_closed_or_times_check',
      sql`${table.isClosed} = true OR (${table.openTime} IS NOT NULL AND ${table.closeTime} IS NOT NULL)`
    ),
    check(
      'business_hours_close_after_open_check',
      sql`${table.isClosed} = true OR ${table.closeTime} > ${table.openTime}`
    ),
  ]
)

// 7. Business Closures
export const businessClosures = pgTable(
  'business_closures',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('business_closures_org_date_unique').on(
      table.organizationId,
      table.date
    ),
    index('business_closures_org_date_idx').on(table.organizationId, table.date),
  ]
)

// 8. Resource Schedules
export const resourceSchedules = pgTable(
  'resource_schedules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(),
    isUnavailable: boolean('is_unavailable').notNull().default(false),
    openTime: time('open_time'),
    closeTime: time('close_time'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('resource_schedules_res_day_unique').on(
      table.resourceId,
      table.dayOfWeek
    ),
    check(
      'resource_schedules_unavail_or_times_check',
      sql`${table.isUnavailable} = true OR (${table.openTime} IS NOT NULL AND ${table.closeTime} IS NOT NULL)`
    ),
    check(
      'resource_schedules_close_after_open_check',
      sql`${table.isUnavailable} = true OR ${table.closeTime} > ${table.openTime}`
    ),
  ]
)

// 9. Bookings
export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reference: text('reference').notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id),
    resourceId: uuid('resource_id').references(() => resources.id, {
      onDelete: 'set null',
    }),
    date: date('date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    source: bookingSourceEnum('source').notNull(),
    status: bookingStatusEnum('status').notNull().default('CONFIRMED'),
    cancellationReason: text('cancellation_reason'),
    notes: text('notes'),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('bookings_org_date_status_idx').on(
      table.organizationId,
      table.date,
      table.status
    ),
    index('bookings_res_date_status_idx').on(
      table.resourceId,
      table.date,
      table.status
    ),
    index('bookings_customer_id_idx').on(table.customerId),
    uniqueIndex('bookings_org_reference_unique').on(
      table.organizationId,
      table.reference
    ),
    check('bookings_end_after_start_check', sql`${table.endTime} > ${table.startTime}`),
  ]
)

// 10. Booking Services
export const bookingServices = pgTable(
  'booking_services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    bookingId: uuid('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id').references(() => services.id, {
      onDelete: 'set null',
    }),
    serviceName: text('service_name').notNull(),
    duration: integer('duration').notNull(),
    price: integer('price').notNull(),
    quantity: integer('quantity').notNull().default(1),
    total: integer('total').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('booking_services_booking_id_idx').on(table.bookingId)]
)
