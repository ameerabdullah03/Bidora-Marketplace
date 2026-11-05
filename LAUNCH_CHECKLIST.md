# Bidora launch checklist

**Launch status: NOT CLEARED. Do not publish another deployment until every required gate below is complete.**

| Gate | Status | Required action |
| --- | --- | --- |
| Custom domain | Pending | Owner connects and verifies a custom domain, including DNS and HTTPS. |
| Favicon | Complete in source | Branded SVG favicon is present at `frontend/public/favicon.svg`. Confirm it appears on the final custom-domain deployment. |
| Remove AI attribution | Complete in source | No “Made with AI” badge is included in the current source. |
| Privacy policy | Draft added in source | Review the policy, configure a real privacy/support contact, and confirm the published page reflects production data flows. |
| Terms and conditions | Draft added in source | Review the terms and configure a real support route before launch. |
| Signup and recovery email | Pending | Configure and verify Gmail SMTP in Supabase without sharing the app password in chat. Test signup confirmation and password recovery. |
| Production review | Pending | Review the custom-domain experience, security settings, database policies, and policy pages before publishing. |

The existing public Pages deployment is unchanged. This work is source-only until the owner clears the launch gates.
