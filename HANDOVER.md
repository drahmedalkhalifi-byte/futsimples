# FutSimples — Complete Handover for Claude Code

> Last updated: April 2026  
> This document is the source of truth for any Claude Code session working on this project.

---

## 1. What Is FutSimples

A SaaS web app for Brazilian football school (escolinha) owners.  
Owners manage students, charge monthly fees via PIX/WhatsApp, track attendance,  
manage expenses, and view financial reports. Parents get a read-only portal.

**Live URL:** https://futsimples.netlify.app  
**Hosting:** Netlify (auto-deploys from GitHub `main` branch)  
**Stack:** Next.js 16.2.3 · React 19 · TypeScript · Tailwind CSS v4 · Firebase · Stripe

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router) — read `/node_modules/next/dist/docs/` before writing Next.js code |
| Auth | Firebase Auth (email/password) |
| Database | Firestore (multi-tenant by `schoolId`) |
| File Storage | Firebase Storage |
| Payments (cards) | Stripe (webhooks at `/api/stripe/webhook`) |
| Payments (PIX Brazil) | Mercado Pago (webhooks at `/api/mp/webhook`) |
| Email | Resend (via `src/lib/email.ts`) |
| UI Components | shadcn/ui + Base UI + Lucide React icons |
| Charts | Recharts |
| Hosting | Netlify |

---

## 3. Project Structure

```
escola-futebol/
├── src/
│   ├── app/
│   │   ├── page.tsx                        ← Landing page (public)
│   │   ├── layout.tsx                      ← Root layout + SEO metadata
│   │   ├── sitemap.ts                      ← Auto-generated sitemap.xml
│   │   ├── robots.ts                       ← Auto-generated robots.txt
│   │   │
│   │   ├── login/page.tsx                  ← Login page
│   │   ├── setup/page.tsx                  ← Registration (admin first-time setup)
│   │   ├── verificar-email/page.tsx        ← Email verification gate
│   │   ├── assinar/page.tsx                ← Subscription/payment page
│   │   │
│   │   ├── portal/[token]/page.tsx         ← Parent portal (public, token-gated)
│   │   ├── privacidade/page.tsx            ← Privacy policy
│   │   ├── termos/page.tsx                 ← Terms of use
│   │   │
│   │   ├── (dashboard)/                    ← Protected dashboard (requires auth + schoolId)
│   │   │   ├── layout.tsx                  ← Dashboard shell (sidebar + topbar)
│   │   │   ├── dashboard/page.tsx          ← Home: stats, charts, alerts
│   │   │   ├── alunos/page.tsx             ← Student management
│   │   │   ├── pagamentos/page.tsx         ← Payments + bulk WhatsApp charging
│   │   │   ├── presenca/page.tsx           ← Attendance tracking
│   │   │   ├── agenda/page.tsx             ← Training/game schedule
│   │   │   ├── gastos/page.tsx             ← Expenses management
│   │   │   ├── relatorio/page.tsx          ← Monthly financial report + PDF export
│   │   │   └── configuracoes/page.tsx      ← School settings + team management
│   │   │
│   │   └── api/
│   │       ├── portal/[token]/route.ts     ← Server-side portal data (bypasses Firestore rules)
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts       ← Create Stripe checkout session
│   │       │   ├── portal/route.ts         ← Stripe customer portal link
│   │       │   └── webhook/route.ts        ← Handle Stripe events (subscription lifecycle)
│   │       ├── mp/
│   │       │   ├── checkout/route.ts       ← Create Mercado Pago PIX payment
│   │       │   ├── status/route.ts         ← Check MP payment status
│   │       │   └── webhook/route.ts        ← Handle MP payment events
│   │       ├── email/
│   │       │   ├── welcome/route.ts        ← Send welcome email on signup
│   │       │   └── trial-reminder/route.ts ← Trial expiry reminder email
│   │       └── team/
│   │           ├── delete/route.ts         ← Delete professor (Firestore + Firebase Auth)
│   │           └── relink/route.ts         ← Re-link professor with existing Auth account
│   │
│   ├── components/
│   │   ├── ui/                             ← shadcn/ui base components
│   │   ├── dashboard/                      ← Dashboard widgets (charts, stat cards, alerts)
│   │   ├── students/                       ← Student form, table, medical form, documents
│   │   ├── expenses/                       ← Expense form and table
│   │   ├── relatorio/                      ← Monthly report component
│   │   ├── layout/                         ← Sidebar, topbar, mobile nav
│   │   └── landing/                        ← AnimatedBackground (not used in current landing)
│   │
│   ├── contexts/
│   │   └── auth-context.tsx                ← Global auth state (see Section 5)
│   │
│   ├── hooks/
│   │   ├── use-students.ts                 ← Firestore students CRUD
│   │   ├── use-payments.ts                 ← Firestore payments CRUD
│   │   ├── use-attendance.ts               ← Firestore attendance CRUD
│   │   ├── use-schedule.ts                 ← Firestore schedule CRUD
│   │   ├── use-expenses.ts                 ← Firestore expenses CRUD
│   │   ├── use-dashboard.ts                ← Aggregated dashboard stats
│   │   ├── use-championships.ts            ← Championships CRUD
│   │   └── use-firestore.ts                ← Generic Firestore helpers
│   │
│   ├── lib/
│   │   ├── firebase.ts                     ← Client-side Firebase (auth, db, storage)
│   │   ├── firebase-admin.ts               ← Server-side Firebase Admin (API routes only)
│   │   ├── email.ts                        ← Resend email sender (HTML + plain text)
│   │   └── utils.ts                        ← cn() helper + misc utilities
│   │
│   └── types/index.ts                      ← All TypeScript interfaces
│
├── firestore.rules                         ← Firestore security rules
├── firebase.json                           ← Firebase project config
├── CLAUDE.md → AGENTS.md                   ← AI instructions
└── HANDOVER.md                             ← This file
```

---

## 4. Firestore Data Model

All collections are **multi-tenant** — every document has a `schoolId` field.  
Rules use `sameSchool(resource.data.schoolId)` to enforce isolation.

```
/users/{uid}
  schoolId, email, name, role ("admin"|"coach"), createdAt, updatedAt

/schools/{schoolId}
  name, logo?, pixKey?, subscriptionStatus, trialStartedAt?,
  subscriptionExpiresAt?, stripeCustomerId?, stripeSubscriptionId?,
  mpSubscriptionId?, createdAt, updatedAt

/students/{docId}
  schoolId, name, birthDate (YYYY-MM-DD), age, category (sub6..sub15),
  guardian, phone, email, active, photoUrl?, portalToken (UUID),
  medicalInfo{}, documents[], createdAt, updatedAt

/payments/{docId}
  schoolId, studentId, studentName, type, amount, status ("pago"|"pendente"),
  dueDate, paidAt?, month (YYYY-MM), createdAt, updatedAt

/attendances/{docId}
  schoolId, date, category, coachId, coachName,
  records[{studentId, studentName, present}], createdAt, updatedAt

/schedules/{docId}
  schoolId, title, type ("treino"|"jogo"), category, date, time,
  location, notes?, recurring?, daysOfWeek[]?, createdAt, updatedAt

/expenses/{docId}
  schoolId, description, amount, type ("one-time"|"recurring"),
  category ("fixo"|"variavel"|"outros"), date?, dayOfMonth?,
  createdAt, updatedAt

/championships/{docId}
  schoolId, name, organizer?, startDate, endDate?, location,
  categories[], notes?, createdAt, updatedAt
```

---

## 5. Auth Context — How It Works

`src/contexts/auth-context.tsx` is the single source of truth for auth state.

```
firebaseUser        = Firebase Auth user object (or null)
user                = Firestore /users/{uid} document (or null)
schoolId            = user.schoolId (or null)
role                = "admin" | "coach" (or null)
isReady             = !loading && !!firebaseUser && !!schoolId
subscriptionStatus  = "trial" | "active" | "expired"
trialDaysLeft       = number of trial days remaining (null if not on trial)
```

**isReady = true** means the user is fully authenticated AND has a Firestore doc.  
All dashboard pages redirect to `/login` if `!isReady`.

**Orphaned state** = `firebaseUser` exists but `schoolId` is null (Firestore doc missing).  
Happens when a professor was deleted with the old delete function that only removed  
the Firestore doc but left the Firebase Auth account. The login page detects this and  
redirects to `/setup` where the admin can re-invite them via `/api/team/relink`.

---

## 6. Subscription Flow

```
Trial:   school.subscriptionStatus = "trial", trialStartedAt = now
         Expires after 7 days → status becomes "expired"

Stripe:  User clicks "Assinar" → /api/stripe/checkout creates session
         Webhook: checkout.session.completed → fetches subscription, sets status = "active" + subscriptionExpiresAt
         Webhook: invoice.payment_succeeded  → renews subscriptionExpiresAt using invoice.period_end
         Webhook: customer.subscription.deleted → sets status = "expired"

PIX/MP:  User clicks PIX option → /api/mp/checkout creates preference
         Webhook: payment.approved → sets status = "active" + subscriptionExpiresAt (+365 days)
```

---

## 7. Parent Portal

Each student has a `portalToken` (UUID generated on creation).  
URL: `/portal/{token}`

The page fetches `/api/portal/{token}` which uses **Firebase Admin** to bypass  
Firestore security rules (portal users are unauthenticated).

The API returns: student info, school name, payment history, attendance records,  
upcoming schedule events.

---

## 8. Team Management (Professors)

Admins can invite professors from **Configuracoes > Equipe**.

**Invite flow:**
1. `configuracoes/page.tsx` calls `createUserWithEmailAndPassword` with secondary Firebase app
2. Sends `sendEmailVerification` to new professor
3. Creates Firestore user doc with `role: "coach"` and same `schoolId`
4. On `auth/email-already-in-use` calls `/api/team/relink` instead

**Relink flow** (`/api/team/relink`):
- Finds existing Firebase Auth user by email via `getAdminAuth().getUserByEmail()`
- Creates/overwrites Firestore doc with correct `schoolId` + `role: "coach"`
- Blocks if email belongs to a user from a different school (returns 409)

**Delete flow** (`/api/team/delete`):
- Deletes Firestore user doc
- Deletes Firebase Auth account via Admin SDK (non-fatal if already gone)

---

## 9. Environment Variables

Set in Netlify dashboard (Site settings > Environment variables):

```bash
# Firebase Client (public — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Firebase Admin (server-side only — never expose to client)
# Option A — single JSON string:
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# Option B — individual vars (Netlify style):
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY    # Netlify stores literal \n — code does .replace(/\\n/g, "\n")

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Mercado Pago
MP_ACCESS_TOKEN
MP_WEBHOOK_SECRET

# Email (Resend)
RESEND_API_KEY
EMAIL_FROM=noreply@futsimples.com.br
EMAIL_REPLY_TO=contato@futsimples.com.br
```

---

## 10. Known Bugs & Technical Debt

| Issue | File | Status |
|---|---|---|
| TypeScript: Stripe API version mismatch `"2024-06-20"` vs `"2025-02-24.acacia"` | `api/stripe/*.ts` | Pre-existing, non-breaking |
| TypeScript: recharts TooltipProps types | `components/dashboard/*.tsx` | Pre-existing, visual only |
| TypeScript: relatorio type assertions | `relatorio/page.tsx` | Pre-existing |
| TypeScript: setup page `asChild` prop on Button | `setup/page.tsx` | Pre-existing |
| git index.lock cannot be deleted in Cowork sandbox | `.git/` | Commit from local terminal |

---

## 11. Deployment

**Auto-deploy:** push to `main` on GitHub -> Netlify builds and deploys (~2-3 min).

**Firestore rules must be deployed separately from your terminal:**
```bash
firebase deploy --only firestore:rules
```

**Pending changes not yet pushed (run from your terminal):**
```bash
cd C:\Users\drahm\Desktop\claude\escola-futebol
git add src/app/page.tsx src/app/sitemap.ts src/app/robots.ts
git commit -m "redesign: landing page + seo sitemap and robots"
git push origin main
firebase deploy --only firestore:rules
```

---

## 12. Key Design Decisions

- **Multi-tenant by schoolId** — flat collections, every doc filtered by `schoolId`. No sub-collections.
- **`isReady` flag** — prevents dashboard rendering before auth resolves (no flash of unauthenticated UI).
- **Server-side portal** — `/api/portal/[token]` uses Firebase Admin so Firestore rules stay locked without breaking parent access.
- **Secondary Firebase app for professor invite** — prevents admin from being signed out when creating a new user account.
- **Dual Firebase Admin credential format** — `firebase-admin.ts` supports both `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON string) and individual vars (Netlify style with `\n` fix).
- **Plain text + HTML emails** — both sent via Resend to avoid spam filters. `List-Unsubscribe` and `Reply-To` headers added.
- **Landing page** — `page.tsx` uses inline styles (not Tailwind classes) for precise control. No AnimatedBackground. Background is `#050505`.

---

## 13. Pages Quick Reference

| URL | File | Who Can Access |
|---|---|---|
| `/` | `app/page.tsx` | Public |
| `/login` | `app/login/page.tsx` | Public |
| `/setup` | `app/setup/page.tsx` | Public (first-time registration) |
| `/verificar-email` | `app/verificar-email/page.tsx` | Unverified Firebase Auth user |
| `/assinar` | `app/assinar/page.tsx` | Authenticated, expired subscription |
| `/portal/[token]` | `app/portal/[token]/page.tsx` | Public (token-gated) |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | isReady + active/trial |
| `/alunos` | `app/(dashboard)/alunos/page.tsx` | isReady |
| `/pagamentos` | `app/(dashboard)/pagamentos/page.tsx` | isReady |
| `/presenca` | `app/(dashboard)/presenca/page.tsx` | isReady |
| `/agenda` | `app/(dashboard)/agenda/page.tsx` | isReady |
| `/gastos` | `app/(dashboard)/gastos/page.tsx` | isReady |
| `/relatorio` | `app/(dashboard)/relatorio/page.tsx` | isReady |
| `/configuracoes` | `app/(dashboard)/configuracoes/page.tsx` | isReady + role: admin |
