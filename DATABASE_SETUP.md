# Bidora Database Setup Guide

## Choose the right setup path

Use exactly one path below. Never run setup SQL over an existing production database without a backup.

### New Supabase project

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your **Bidora** project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `D:\Bidora\database\schema.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for it to complete (you'll see green checkmarks)

`database/schema.sql` is the canonical schema. It creates the tables, auth-profile trigger, security-definer order/bid functions, ratings triggers, and seed categories. It does **not** enable RLS on all tables; applying the RLS script is required before using the app.

Do not run `database/schema-simplified.sql`; it is a legacy reference. If a simplified schema was installed previously, stop and prepare a project-specific migration after backing up the data. Do not run either setup path over that database.

### Existing canonical installation

Use this path only when `database/schema.sql` **and** the baseline `database/rls-policies.sql` have already been applied. Back up the project, then run `database/migrations/2026-11-05-marketplace-core.sql` once. It upgrades the existing canonical installation with profile backfill, favorites/admin tables, atomic marketplace functions, rating/message triggers, and the current policy definitions. Apply `database/migrations/2026-11-08-privacy-requests.sql` and `database/migrations/2026-11-08-general-marketplace-categories.sql` as separate additive migrations. The first enables the privacy request form/admin queue; the second adds general categories while preserving existing category IDs and listings.

If only `schema.sql` was applied, finish the new-project steps below before using the app. The RLS script is a one-time setup script and is not intended to be rerun over an installation that already has policies.

## New-project Step 2: Apply the RLS Policies SQL

1. In the same **SQL Editor**, click **New Query** again
2. Copy the entire contents of `D:\Bidora\database\rls-policies.sql`
3. Paste it into the SQL editor
4. Click **Run**
5. Wait for completion

This enables Row-Level Security and installs the policies required by the frontend. Run it after `schema.sql`.

To enable listing moderation, follow `ADMIN_SETUP.md` to grant the first administrator. Admin access is not granted automatically.

## Step 3: Verify the Setup

After the selected SQL path completes successfully:

1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - users
   - categories
   - products
   - product_images
   - auctions
   - bids
   - orders
   - reviews
   - reports
   - conversations
   - messages
   - admins
   - favorites
   - privacy_requests

3. Click on **categories** → after applying the marketplace category migration, you should see general goods categories alongside the existing electronics categories.

Also verify the `public_profiles` view is available and these RPCs appear in the Supabase API schema: `place_auction_bid`, `place_product_order`, `place_auction_order`, and `advance_order_status`. The frontend needs these objects for public seller details, favorites/admin features, bidding, and order workflows.

## Step 4: Configure Supabase Storage for Images

1. Go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name: `listing-images`
4. Make it **Public** (toggle on)
5. Set the file size limit to **10 MB** and allowed MIME types to `image/jpeg`, `image/png`, and `image/webp`
6. Click **Create bucket**

This bucket stores product images. SQL policies restrict writes to authenticated sellers and their own product folders; public read access is required for listing images.

## Step 5: Configure Authentication

1. In Supabase **Authentication → URL Configuration**, add your local and production app URLs to the allowed redirect URLs.
2. Include `{APP_ORIGIN}/auth?mode=recover` so password reset links return to Bidora.
3. Enable the Email provider and configure production email delivery before launch.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `frontend/.env.local` and in the hosting environment. The legacy anon variable is still accepted during transition. These browser keys are public; never put a secret or service-role key in a `VITE_*` variable. Configure allowed production Auth rate limits and redirect URLs in Supabase.

For moderation, create and verify the administrator account, then follow `ADMIN_SETUP.md`. Admin membership is not granted automatically.

## Important Notes

- Both the schema and RLS policies are required for a new installation
- Users can only see approved products or their own products
- Sellers can only modify their own listings
- Bidders can only place bids on active auctions
- The database is designed for security first

## Troubleshooting

If you get an error:
- Check that you're in the **SQL Editor** (not the Table Editor)
- Make sure you copied the entire SQL script
- Do not treat `IF NOT EXISTS` as a migration mechanism; it does not update existing table definitions
- Check the error message at the bottom of the editor
