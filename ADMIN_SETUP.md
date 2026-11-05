# Granting the first Bidora administrator

The Admin panel is protected by the `admins` table and its Row-Level Security policies. New accounts cannot grant themselves admin access.

1. Create and verify the account that should administer the marketplace.
2. In the Supabase SQL Editor, run this statement with that account's email:

```sql
INSERT INTO public.admins (user_id)
SELECT id FROM public.users WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO NOTHING;
```

Replace the example email with the verified administrator account. Run this only as a trusted project owner.
