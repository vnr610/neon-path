# VNR610 · Realm Codex

Personal portfolio and blog for **VNR610** — a developer and security researcher from Nepal mastering Full Stack development and Cybersecurity.

**Live site:** [manojmagar.info.np](https://www.manojmagar.info.np)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| State | TanStack React Query |
| Forms | React Hook Form + Zod |
| AI | Groq (Llama 3.3) via Supabase Edge Functions |
| Email | Resend |
| Comments | Giscus (GitHub Discussions) |
| Charts | Recharts |
| Animations | Anime.js |
| Testing | Vitest |

---

## Public Pages

| Route | Description |
|---|---|
| `/` | Home — hero, featured projects, top skill, recent timeline, latest writeups |
| `/about` | About — bio, avatar, social links, CV download |
| `/skills` | Skills dashboard — progress bars across Full Stack and Cybersecurity realms |
| `/projects` | Project gallery with tech stack filter and pagination |
| `/writeups` | Blog post listing with search, tag filter, and pagination |
| `/writeups/:slug` | Blog post — reading progress, ToC, share buttons, Giscus comments |
| `/timeline` | Chronological milestone timeline |
| `/certifications` | Credential cards with badges and verification links |
| `/contact` | Contact form (saves to DB + email notification via Resend) |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/sitemap.xml` | Static sitemap for SEO |

---

## Admin Panel (`/admin/*`)

All admin routes are protected by Supabase Auth + role-based access control.

| Route | Description |
|---|---|
| `/admin` | Dashboard — content counts, quick links |
| `/admin/home` | Site settings — bio, avatar, social links, resume URL, platform handles |
| `/admin/writeups` | Blog CRUD — markdown editor, AI generation/enhancement, thumbnail upload |
| `/admin/skills` | Skills CRUD — name, category, level, progress |
| `/admin/projects` | Projects CRUD — cover image, home spotlight pinning |
| `/admin/timeline` | Timeline entries CRUD |
| `/admin/certifications` | Certifications CRUD — badge upload |
| `/admin/messages` | Contact form inbox — read/unread, delete |
| `/admin/newsletter` | Newsletter — subscriber list, AI-powered broadcast composer |
| `/admin/analytics` | Page view analytics — area chart, top pages table |

---

## Project Structure

```
src/
├── components/
│   ├── auth/           # RequireAdmin, RequireRole guards
│   ├── layout/         # Navbar, Footer, SiteLayout, AdminLayout
│   ├── saber/          # Custom components (StatsHUD, CommandPalette, SEO, etc.)
│   └── ui/             # shadcn/ui primitives
├── hooks/              # useAuth, useAiBlogAssist, usePageTracking, etc.
├── integrations/
│   └── supabase/       # Client + TypeScript types
├── lib/
│   ├── content.ts      # All Supabase CRUD functions
│   ├── externalAchievements.ts  # GitHub, LeetCode, HTB, HackerOne APIs
│   └── skillsEngine.ts # Skill calculation logic
└── pages/
    ├── admin/          # Admin panel pages
    └── *.tsx           # Public pages

supabase/
├── functions/          # Edge Functions (Deno)
│   ├── ai-blog-assist/         # Groq AI for blog writing
│   ├── contact-notify/         # Contact form → Resend email
│   ├── external-achievements/  # External platform stats
│   ├── newsletter-broadcast/   # Send newsletter via Resend
│   └── newsletter-subscribe/   # Subscribe + welcome email
└── migrations/         # PostgreSQL migrations
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `blog_posts` | Writeups with markdown/HTML content, tags, thumbnail |
| `skills` | Skills with category, level, progress (0–100) |
| `projects` | Projects with cover, stack, home spotlight |
| `timeline_entries` | Milestones with date, realm, description |
| `certifications` | Credentials with badge, issuer, verification URL |
| `site_home` | Singleton — bio, avatar, social links, resume URL, platform handles |
| `contact_messages` | Incoming contact form submissions |
| `newsletter_subscribers` | Email subscriber list |
| `page_views` | Anonymous page view analytics |
| `blog_post_views` | Per-post view counters |
| `skill_progress_history` | Skill progress snapshots over time |
| `user_roles` | Admin role assignments |

All tables use Row Level Security (RLS). Public data is readable by anyone; writes require admin role.

---

## Edge Functions

| Function | Trigger | Description |
|---|---|---|
| `ai-blog-assist` | Admin UI | Groq Llama 3.3 — generate, enhance, summarize, suggest tags/slug, write newsletter |
| `contact-notify` | Contact form | Save message to DB + send email notification via Resend |
| `newsletter-subscribe` | Subscribe form | Save subscriber + send welcome email via Resend |
| `newsletter-broadcast` | Admin newsletter | Send broadcast to all subscribers via Resend |
| `external-achievements` | Skills page | Fetch GitHub, LeetCode, HTB, HackerOne stats |

---

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=

# Giscus comments
VITE_GISCUS_CATEGORY_ID=
VITE_GISCUS_CATEGORY=General
```

Supabase Edge Function secrets (set via `npx supabase secrets set`):

```
RESEND_API_KEY
NOTIFY_EMAIL
SITE_URL
GROQ_API_KEY
GMAIL_USER
GMAIL_CLIENT_ID
GMAIL_CLIENT_SECRET
GMAIL_REFRESH_TOKEN
HTB_APP_TOKEN
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Apply database migrations:
```bash
npx supabase db push --project-ref <your-project-ref>
```

Deploy edge functions:
```bash
npx supabase functions deploy <function-name> --project-ref <your-project-ref>
```

---

## Features

- **AI-powered blog editor** — generate posts, enhance writing, suggest tags and slugs
- **AI newsletter composer** — select a writeup, AI drafts the email, broadcast to subscribers
- **Live stats HUD** — radar chart + real-time GitHub, LeetCode, HTB, HackerOne metrics
- **Command palette** — `⌘K` search across pages, posts, projects, and skills
- **Reading progress bar** — thin indicator on blog posts
- **Table of contents** — auto-generated from headings, sticky sidebar
- **Blog comments** — Giscus (GitHub Discussions), zero moderation needed
- **SEO** — dynamic `<title>`, Open Graph, Twitter cards, JSON-LD, sitemap
- **Page analytics** — lightweight Supabase-based visitor tracking
- **Newsletter** — subscribe form, welcome email, AI-drafted broadcasts
- **Contact form** — saves to DB + email notification
- **CV download** — configurable resume URL, shown on About page and hero
- **Inline post editing** — admins can edit posts directly on the public page

---

## License

Personal portfolio — all rights reserved. Code structure may be referenced for learning purposes.
