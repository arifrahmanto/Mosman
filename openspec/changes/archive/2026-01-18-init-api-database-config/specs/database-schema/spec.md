# Spec: Database Schema

**Capability:** `database-schema`
**Status:** Draft
**Related Capabilities:** `api-server`, `authentication`
**Language:** TypeScript (with SQL migrations)

## ADDED Requirements

### Requirement: Database TypeScript Types

The system MUST generate and use TypeScript types from the Supabase schema.

#### Scenario: Supabase types are generated

**Given** the database schema exists in Supabase
**When** Supabase CLI generates types
**Then** TypeScript types are created for all tables
**And** types include Row, Insert, and Update variants
**And** types are saved to src/types/database.types.ts

#### Scenario: Database queries are type-safe

**Given** Supabase types are generated
**When** queries are executed using Supabase client
**Then** query results are properly typed
**And** IDE provides autocomplete for table columns
**And** TypeScript catches schema mismatches at compile time

---

### Requirement: Supabase Client Initialization

The system MUST establish a connection to Supabase with proper configuration.

#### Scenario: Supabase client is initialized

**Given** valid Supabase credentials are configured
**When** the application starts
**Then** a Supabase client instance is created
**And** the client uses the configured SUPABASE_URL and SUPABASE_ANON_KEY
**And** the client is available for database operations

#### Scenario: Connection validation

**Given** the Supabase client is initialized
**When** a test query is executed
**Then** the connection is verified as working
**And** any connection errors are logged and handled

---

### Requirement: Donation Categories Table

The system MUST provide a table for categorizing donations.

#### Scenario: Donation categories table structure

**Given** the database schema is created
**When** the donation_categories table is inspected
**Then** it contains columns: id, name, description, is_active, created_at, updated_at
**And** id is a UUID primary key with auto-generation
**And** name is required and unique
**And** is_active defaults to true

#### Scenario: Seed donation categories

**Given** the database is initialized
**When** seed data is loaded
**Then** default categories exist: "Infaq Umum", "Zakat", "Sedekah", "Wakaf"
**And** each category has appropriate description

---

### Requirement: Donations Table

The system MUST provide a table for recording donations with support for line items.

#### Scenario: Donations table structure

**Given** the database schema is created
**When** the donations table is inspected
**Then** it contains columns: id, pocket_id, donor_name, is_anonymous, payment_method, receipt_url, notes, donation_date, recorded_by, created_at, updated_at
**And** id is a UUID primary key
**And** pocket_id is a foreign key to pockets table
**And** donor_name is nullable (for anonymous donations)
**And** recorded_by is a foreign key to auth.users
**And** amount is NOT stored in donations table (stored in donation_items)

#### Scenario: Anonymous donation handling

**Given** a donation record is inserted
**When** is_anonymous is set to true
**Then** donor_name can be null
**And** the donation is still recorded with all other details

#### Scenario: Donation date defaults to current date

**Given** a donation is inserted without specifying donation_date
**When** the record is created
**Then** donation_date is set to current date

---

### Requirement: Donation Items Table

The system MUST provide a table for recording individual line items within donations.

#### Scenario: Donation items table structure

**Given** the database schema is created
**When** the donation_items table is inspected
**Then** it contains columns: id, donation_id, category_id, amount, description, created_at, updated_at
**And** id is a UUID primary key
**And** donation_id is a foreign key to donations with CASCADE delete
**And** category_id is a foreign key to donation_categories
**And** amount is a numeric(15,2) field
**And** description is nullable

#### Scenario: Multiple line items per donation

**Given** a donation exists
**When** donation items are inserted
**Then** multiple items can be associated with the same donation
**And** each item has its own category and amount
**And** total donation amount equals sum of all item amounts

#### Scenario: Cascade delete on parent donation

**Given** a donation has associated items
**When** the parent donation is deleted
**Then** all associated donation_items are automatically deleted

#### Scenario: Line item validation

**Given** a donation is created
**When** donation items are validated
**Then** at least one item must exist
**And** each item amount must be greater than zero
**And** each item must have a valid category_id

---

### Requirement: Expense Categories Table

The system MUST provide a table for categorizing expenses.

#### Scenario: Expense categories table structure

**Given** the database schema is created
**When** the expense_categories table is inspected
**Then** it contains columns: id, name, description, is_active, created_at, updated_at
**And** id is a UUID primary key with auto-generation
**And** name is required and unique
**And** is_active defaults to true

#### Scenario: Seed expense categories

**Given** the database is initialized
**When** seed data is loaded
**Then** default categories exist: "Operasional", "Pemeliharaan Gedung", "Gaji Pegawai", "Kegiatan Keagamaan", "Utilitas"
**And** each category has appropriate description

---

### Requirement: Expenses Table

The system MUST provide a table for recording expenses with support for line items.

#### Scenario: Expenses table structure

**Given** the database schema is created
**When** the expenses table is inspected
**Then** it contains columns: id, pocket_id, description, receipt_url, expense_date, approved_by, recorded_by, status, notes, created_at, updated_at
**And** id is a UUID primary key
**And** pocket_id is a foreign key to pockets table
**And** status is an enum: "pending", "approved", "rejected"
**And** status defaults to "pending"
**And** recorded_by is a foreign key to auth.users
**And** approved_by is nullable foreign key to auth.users
**And** amount is NOT stored in expenses table (stored in expense_items)

#### Scenario: Expense approval workflow

**Given** an expense is created
**When** status is initially set
**Then** status is "pending"
**And** approved_by is null
**When** an admin approves the expense
**Then** status changes to "approved"
**And** approved_by is set to admin's user ID

---

### Requirement: Expense Items Table

The system MUST provide a table for recording individual line items within expenses.

#### Scenario: Expense items table structure

**Given** the database schema is created
**When** the expense_items table is inspected
**Then** it contains columns: id, expense_id, category_id, amount, description, created_at, updated_at
**And** id is a UUID primary key
**And** expense_id is a foreign key to expenses with CASCADE delete
**And** category_id is a foreign key to expense_categories
**And** amount is a numeric(15,2) field
**And** description is nullable

#### Scenario: Multiple line items per expense

**Given** an expense exists
**When** expense items are inserted
**Then** multiple items can be associated with the same expense
**And** each item has its own category and amount
**And** total expense amount equals sum of all item amounts

#### Scenario: Cascade delete on parent expense

**Given** an expense has associated items
**When** the parent expense is deleted
**Then** all associated expense_items are automatically deleted

#### Scenario: Line item validation

**Given** an expense is created
**When** expense items are validated
**Then** at least one item must exist
**And** each item amount must be greater than zero
**And** each item must have a valid category_id

---

### Requirement: User Profiles Table

The system MUST extend Supabase auth.users with custom profile information.

#### Scenario: User profiles table structure

**Given** the database schema is created
**When** the user_profiles table is inspected
**Then** it contains columns: id, full_name, role, phone, is_active, created_at, updated_at
**And** id is a UUID primary key and foreign key to auth.users
**And** role is required with values: "admin", "treasurer", "viewer"
**And** is_active defaults to true

#### Scenario: Profile creation on user registration

**Given** a new user is created in Supabase Auth
**When** the auth trigger fires
**Then** a corresponding user_profiles record is created automatically
**And** the default role is "viewer"

---

### Requirement: Database Indexes

The system MUST create indexes for optimizing query performance.

#### Scenario: Indexes on foreign keys

**Given** the database schema is created
**When** indexes are inspected
**Then** indexes exist on pocket_id in donations and expenses tables
**And** indexes exist on donation_id in donation_items table
**And** indexes exist on expense_id in expense_items table
**And** indexes exist on category_id in donation_items table
**And** indexes exist on category_id in expense_items table
**And** indexes exist on recorded_by in donations and expenses tables
**And** composite indexes exist on (donation_id, category_id) in donation_items
**And** composite indexes exist on (expense_id, category_id) in expense_items

#### Scenario: Indexes on date fields

**Given** the database schema is created
**When** indexes are inspected
**Then** an index exists on donation_date in donations table
**And** an index exists on expense_date in expenses table

#### Scenario: Indexes on status field

**Given** the database schema is created
**When** indexes are inspected
**Then** an index exists on status in expenses table

---

### Requirement: Row Level Security Policies

The system MUST enforce data access rules at the database level.

#### Scenario: Donations table SELECT policy

**Given** a user is authenticated
**When** they query the donations table
**Then** they can read all donation records
**And** unauthenticated users cannot read any records

#### Scenario: Donations table INSERT/UPDATE policy

**Given** a user is authenticated with role "admin" or "treasurer"
**When** they attempt to insert or update a donation
**Then** the operation succeeds
**Given** a user is authenticated with role "viewer"
**When** they attempt to insert or update a donation
**Then** the operation is denied with permission error

#### Scenario: Donations table DELETE policy

**Given** a user is authenticated with role "admin"
**When** they attempt to delete a donation
**Then** the operation succeeds
**Given** a user is authenticated with role "treasurer" or "viewer"
**When** they attempt to delete a donation
**Then** the operation is denied with permission error

#### Scenario: Donation items table policies

**Given** a user is authenticated
**When** they query the donation_items table
**Then** they can read all donation items
**Given** a user is authenticated with role "admin" or "treasurer"
**When** they insert, update, or delete donation items
**Then** the operation succeeds (same permissions as parent donation)
**Given** a user is authenticated with role "viewer"
**When** they attempt to modify donation items
**Then** the operation is denied

#### Scenario: Expense items table policies

**Given** a user is authenticated
**When** they query the expense_items table
**Then** they can read all expense items
**Given** a user is authenticated with role "admin" or "treasurer"
**When** they insert or update expense items
**Then** the operation succeeds (same permissions as parent expense)
**Given** a user is authenticated with role "admin"
**When** they delete expense items
**Then** the operation succeeds
**Given** a user is authenticated with role "viewer"
**When** they attempt to modify expense items
**Then** the operation is denied

#### Scenario: Expenses table approval policy

**Given** a user is authenticated with role "admin"
**When** they update an expense status field
**Then** the operation succeeds
**Given** a user is authenticated with role "treasurer"
**When** they update an expense status field
**Then** the operation is denied (only admin can approve)

#### Scenario: Categories tables management policy

**Given** a user is authenticated with role "admin"
**When** they insert, update, or delete categories
**Then** the operation succeeds
**Given** a user is authenticated with role "treasurer" or "viewer"
**When** they attempt to modify categories
**Then** the operation is denied

#### Scenario: User profiles access policy

**Given** a user is authenticated
**When** they query user_profiles for their own profile
**Then** they can read their profile
**When** they query other users' profiles
**Then** they can read basic information (id, full_name, role)
**And** only admin can update any user profile

---

### Requirement: Database Migrations

The system MUST provide repeatable database migrations.

#### Scenario: Initial migration creates all tables

**Given** a fresh Supabase project
**When** the initial migration is run
**Then** all tables are created (pockets, donation_categories, donations, donation_items, expense_categories, expenses, expense_items, user_profiles)
**And** all constraints and indexes are applied
**And** foreign key CASCADE relationships are configured for item tables
**And** RLS policies are enabled and configured

#### Scenario: Migrations are idempotent

**Given** migrations have been run
**When** migrations are run again
**Then** no errors occur
**And** the schema remains unchanged

#### Scenario: Migration rollback

**Given** a migration has been applied
**When** a rollback is needed
**Then** the migration can be reverted
**And** the schema returns to previous state

---

### Requirement: Seed Data

The system MUST provide seed data for development and testing.

#### Scenario: Category seed data

**Given** the seed script is run
**When** categories are seeded
**Then** donation categories are created if not exist
**And** expense categories are created if not exist

#### Scenario: Test user seed data

**Given** the seed script is run in development mode
**When** user seed data is inserted
**Then** test users are created with different roles (admin, treasurer, viewer)
**And** corresponding user_profiles are created

---

### Requirement: Timestamps and Audit Trail

The system MUST automatically manage created_at and updated_at timestamps.

#### Scenario: Automatic timestamp on insert

**Given** a new record is inserted into any table
**When** the insert completes
**Then** created_at is set to current timestamp
**And** updated_at is set to current timestamp

#### Scenario: Automatic timestamp on update

**Given** an existing record is updated
**When** the update completes
**Then** created_at remains unchanged
**And** updated_at is set to current timestamp
