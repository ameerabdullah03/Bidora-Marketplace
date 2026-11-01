# Bidora Database Setup Guide

## Step 1: Execute the Schema SQL

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your **Bidora** project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `D:\Bidora\database\schema.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for it to complete (you'll see green checkmarks)

This creates all your database tables and inserts the initial categories.

## Step 2: Execute the RLS Policies SQL

1. In the same **SQL Editor**, click **New Query** again
2. Copy the entire contents of `D:\Bidora\database\rls-policies.sql`
3. Paste it into the SQL editor
4. Click **Run**
5. Wait for completion

This secures your database with Row-Level Security policies.

## Step 3: Verify the Setup

After both scripts run successfully:

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

3. Click on **categories** → you should see 6 categories pre-loaded (Phones, Laptops, Audio, etc.)

## Step 4: Configure Supabase Storage for Images

1. Go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name: `listing-images`
4. Make it **Public** (toggle on)
5. Click **Create bucket**

This bucket will store product images.

## Step 5: Test Authentication (Optional)

To verify your auth is working:

1. Go to **Authentication** (left sidebar)
2. You should see the **Providers** tab
3. Email/Password is enabled by default

## What's Next

Once you've executed both SQL scripts and verified the tables exist:

1. I'll create an authentication UI (Login/Sign Up pages)
2. We'll integrate the seller dashboard
3. Connect the homepage to real product data from your database
4. Build the product listing form
5. Test end-to-end workflow

## Important Notes

- The schema includes Row-Level Security (RLS) policies
- Users can only see approved products or their own products
- Sellers can only modify their own listings
- Bidders can only place bids on active auctions
- The database is designed for security first

## Troubleshooting

If you get an error:
- Check that you're in the **SQL Editor** (not the Table Editor)
- Make sure you copied the entire SQL script
- If a table already exists, the `IF NOT EXISTS` clause will skip it
- Check the error message at the bottom of the editor

Once complete, reply with: "✅ Database schema and RLS policies are set up!"
