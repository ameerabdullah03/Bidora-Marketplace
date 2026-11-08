# Bidora launch checklist

**Launch status: NOT CLEARED. Do not publish another deployment until every required gate below is complete.**

| Gate | Status | Required action |
| --- | --- | --- |
| Custom domain | Pending | Owner connects and verifies a custom domain, including DNS and HTTPS. |
| Favicon | Complete in source | Branded SVG favicon is present at `frontend/public/favicon.svg`. Confirm it appears on the final custom-domain deployment. |
| Remove AI attribution | Complete in source | No “Made with AI” badge is included in the current source. |
| Privacy policy | Draft added in source | Review the policy, configure a real privacy/support contact, and confirm the published page reflects production data flows. |
| Terms and conditions | Draft added in source | Review the terms and configure a real support route before launch. |
| Refund and cookie policies | Draft added in source | Confirm operational return/cancellation rules, inspect provider storage on the custom domain, and complete legal review. |
| Age and form consent | Source gate added | Signup requires 18+ self-attestation and terms/privacy acknowledgement. Listing image rights and order delivery-charge acknowledgements are also required. These are UI checks, not identity verification or a durable consent audit log. |
| Privacy requests | Source flow added, inactive | Apply `database/migrations/2026-11-08-privacy-requests.sql`, verify RLS with buyer/admin accounts, define a trusted fulfillment procedure, and publish a support route. Requests do not automatically delete accounts. |
| Business details | Pending | Owner supplies legal operator name, address, support contact, and any required registration/tax details. Do not invent these values. |
| Third-party and asset review | Source scan complete | `npm audit` found no known vulnerabilities. Confirm uploaded seller images are authorized and review provider behavior on the final domain. |
| Signup and recovery email | Pending | Configure and verify Gmail SMTP in Supabase without sharing the app password in chat. Test signup confirmation and password recovery. |
| Production review | Pending | Review the custom-domain experience, security settings, database policies, and policy pages before publishing. |

The existing public Pages deployment is unchanged. This work is source-only until the owner clears the launch gates.
