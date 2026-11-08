# Bidora product compliance and trust audit

**Review date:** November 8, 2026  
**Scope:** Repository source review only. No legal compliance opinion, production-domain scan, or live database change was performed.

## Checklist results

| Checklist item | Finding and action | Status |
| --- | --- | --- |
| Privacy policy | Existing page describes account, listing, messaging, order, provider, storage, and request data. It is marked as a draft and has a signed-in request form. | Source added; migration and business contact pending |
| Terms of service | Existing terms are marked as a draft. They describe marketplace roles, COD, delivery charges, and cancellation limits. | Source updated; legal and business review pending |
| Refund policy | Added a factual policy: current checkout is cash-on-delivery, no advance payment or in-app reversal exists, and delivery charges are not calculated by the app. | Draft added; confirm seller/courier operations and review before launch |
| Cookie policy and consent banner | Added a browser-storage policy. The banner offers equally styled “Essential only” and “Allow campaign tags” choices. No optional advertising or analytics SDK is configured. Campaign tags can be attached to signup metadata only after both storage consent and a separate optional signup opt-in. | Source added; inspect final-host/provider behavior |
| Data minimization | Signup asks for name, email, password, account type, required age/terms acknowledgements, and optional attribution. No date of birth is collected. UTM `term` and `content` fields are no longer retained. The deletion request stores only account ID, request type, status, and timestamps. | Improved; confirm retention and delete fulfillment procedure |
| Third-party SDKs | Runtime packages are React/React DOM, Supabase JS, Framer Motion, and Lucide. Supabase handles Auth/data; Framer Motion and Lucide provide UI behavior/icons. No analytics, ad, or marketing-list SDK was found. `npm audit --audit-level=moderate` reported zero known vulnerabilities on this date. | Source and dependency audit complete |
| Dark patterns and fees | Removed hard-coded seller response/feedback percentages, unsupported secure-checkout wording, and free-shipping/tax-included labels. Checkout now says its total is the item price only and tells buyers to confirm delivery charges with sellers. | Source corrected |
| Reviews and claims | Review counts/ratings continue to come from database fields. Empty states now say “No reviews yet.” Removed the fabricated 95% response rate and rating-derived positive-feedback percentage. | Source corrected; check any production seed data separately |
| Alt text and contrast | Product/listing images have descriptive alt text; upload previews have numbered preview alt text. The muted text token was changed to a measured 5.1:1 contrast on the paper background; common gray text/icon colors were darkened in light mode. | Source improved; full visual/manual contrast certification remains outstanding |
| Keyboard access | Native links, buttons, forms, checkboxes, and selects are used; a skip link and visible focus style exist. The new request/admin screens use native controls. | Source reviewed; manual keyboard pass still needed |
| Business details | The site identifies the Bidora brand and Pakistan only. No verified legal operator name, address, support email, or phone is available in the project files. | Owner input required; do not launch |
| Children’s data | Signup now requires a user to confirm they are at least 18. This is self-attestation only, not age verification; no birth date is requested. | Source gate added; policy/legal review required |
| Email unsubscribe | The source uses signup confirmation and password-recovery emails; no marketing newsletter or mailing-list SDK was found. An unsubscribe link is not applicable to those transactional messages. Reassess before sending marketing email. | No marketing email flow present |
| Fonts and images | No remote font import was found; the app uses a local system-font stack. The generic starter React/Vite SVGs and unused purple sample hero image were removed. Product photographs are uploaded by marketplace users; the listing form now requires an ownership/permission attestation. Existing user uploads cannot be individually verified by this source scan. | Source cleaned; owner moderation remains necessary |
| Data deletion requests | Added authenticated request intake, owner/admin RLS, one-open-request constraint, and an admin review queue. Requests are not automatically fulfilled; trusted server-side account deletion is still required. | Migration must be applied and tested before the form is active |

## Required before launch

1. Supply Bidora’s legal operator name, business address, and working privacy/support contact.
2. Obtain appropriate legal review for the privacy, terms, refund, cookie, age, consumer, and retention wording. The pages are intentionally marked as drafts.
3. Apply `database/migrations/2026-11-08-privacy-requests.sql` to Supabase, then verify owner/admin isolation and document a trusted process for fulfilling and closing requests.
4. Confirm the actual delivery/cancellation/refund arrangement with sellers and couriers. The app currently records the item price only and does not calculate or collect shipping or tax.
5. Verify signup, password recovery, cookie/storage behavior, headers, image rights moderation, keyboard navigation, and color contrast on the final HTTPS custom domain.
6. Keep production launch blocked until the custom domain and verified transactional email sender are configured.

The official Ministry of IT legislation list currently labels the Personal Data Protection Bills from 2020 and 2023 as drafts. This report does not infer that no other obligations apply and does not determine legal compliance. [MoITT legislation list](https://www.moitt.gov.pk/Legislations). Obtain local legal advice before launch.
