# Bidora Security Audit

Audit date: 2026-11-05

## Scope and results

Reviewed the frontend source, environment-variable handling, package manifest and lockfile, tracked files, Git history, Supabase schema and RLS policies, and Cloudflare Pages headers.

- No tracked environment/key files or common credential patterns were found in the checked Git history. The ignored local environment file contains only the Supabase project URL and browser anon key; values were not copied into this report. Browser keys are public identifiers and are not a substitute for RLS. Never put a Supabase `service_role` or `sb_secret` key in a `VITE_*` variable.
- No known npm advisories were reported by the package audit. Seven unused direct packages were removed and remaining dependencies were updated within declared semver ranges.
- No raw HTML injection sinks (`dangerouslySetInnerHTML`, `innerHTML`, `eval`, or `document.write`) were found in the frontend scan. React renders user text as text. Database insert triggers now trim and bound listing/message inputs.
- The app has no custom API server or Edge Functions. It calls Supabase directly; row-level policies and SQL grants are the authorization boundary. Security headers are provided for Cloudflare Pages in `frontend/public/_headers`.
- Database changes tighten profile, listing, auction, conversation, message, order, and admin permissions; add persistent per-user write quotas (5 listings/day, 20 conversations/hour, 30 messages/minute, 30 bids/minute, and 10 orders/hour); and restrict security-definer functions.
- Passwords are handled by Supabase Auth. The application schema has no password column and must not store password hashes itself.

## Required deployment work

The live marketplace migration and Storage/Auth settings have now been applied and verified where listed below. Production-domain email delivery, first-admin provisioning, hosting headers, and real-account acceptance are still pending.

1. The canonical `database/migrations/2026-11-05-marketplace-core.sql` migration was applied successfully to the backed-up live project. The pre-migration custom-format backup was archive-verified. Required tables, view, and stricter policies were verified; the first administrator provisioning is still unverified.
2. The public `listing-images` bucket is configured with a 10 MB limit and JPEG, PNG, and WebP MIME types. Its ownership policies were verified. Provision and verify the first administrator through the documented trusted procedure; acceptance checks are still outstanding.
3. Supabase Auth now has the local development Site URL and exact password-recovery redirect, email confirmation and secure email changes enabled, secure password changes enabled, and an 8-character minimum. Replace the local URL with the real HTTPS production domain, verify/configure custom SMTP, and review endpoint limits before launch. The dashboard currently shows 2 emails/hour; SQL quotas do not provide IP-level protection or rate-limit public reads.
4. Configure hosting with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (the existing `VITE_SUPABASE_ANON_KEY` remains supported for compatibility). Ensure `frontend/public/_headers` is present at the deployed Pages root and verify the served CSP and response headers. Enable HSTS only after confirming the production domain is HTTPS-only.
5. If adding Edge Functions or another server API, restrict CORS to the exact production origins and add server-side request/IP limits. Supabase CORS does not replace authentication or RLS.
6. Run acceptance checks against real buyer, seller, and admin accounts: cross-account reads/writes, profile privilege edits, admin-only moderation, auction lifecycle, order transitions, storage ownership, and quota boundaries. Review Supabase logs after deployment.

## Limits of this audit

The live Supabase dashboard/database and Cloudflare account were not changed. The repository cannot prove production Auth settings, database grants/policies, bucket configuration, secrets stored in the hosting dashboard, or whether Pages is currently serving the headers. Git history checks used common credential-pattern scans; they cannot prove the absence of every secret format. The production build completed successfully. Static checks found no common secret patterns or unsafe HTML sinks; `npm audit` reported zero known vulnerabilities. The SQL was reviewed statically; no PostgreSQL CLI/parser or live database session was available for execution tests.
