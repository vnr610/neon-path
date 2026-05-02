# Supabase Migration Setup Guide

Your app is now configured to use Supabase for persistent storage. Follow these steps to complete the migration:

## Step 1: Push Migrations to Supabase

The migration file `supabase/migrations/20260502070000_content_tables.sql` creates all necessary tables. You have two options:

### Option A: Using Supabase CLI (Recommended)
```bash
npm install -g supabase
supabase link --project-id ucghqoburfkakzfubets
supabase db push
```

### Option B: Using Supabase Dashboard (Manual)
1. Go to https://supabase.co/dashboard
2. Select your project `ucghqoburfkakzfubets`
3. Click **SQL Editor**
4. Create a new query and copy the entire contents of `supabase/migrations/20260502070000_content_tables.sql`
5. Click **Run**

## Step 2: Verify Tables Created

After migrations run, check your Supabase dashboard:
- Navigate to **Table Editor**
- You should see: `blog_posts`, `skills`, `projects`, `timeline_entries`, `certifications`
- All tables have public read access and admin-only write access via Row Level Security

## Step 3: Test the App

```bash
npm run dev
```

- Go to http://localhost:5173/admin
- Try creating a blog post, skill, project, timeline entry, or certification
- Data should now save to Supabase instead of localStorage
- Public pages (blog, skills, projects, timeline, certifications) will load live data from the database

## What Changed

### Before (localStorage)
- Data stored in browser storage only
- Lost on browser clear or new device
- No sharing between users

### After (Supabase)
- Data stored in PostgreSQL database
- Persistent across sessions
- Can be accessed from any device
- Row-level security ensures only admins can edit
- Public can read all content

## Tables Created

Each table has:
- `id` (UUID): unique identifier
- `created_at` (timestamp): when created
- `updated_at` (timestamp): last modified
- Table-specific fields (title, slug, content, etc.)
- RLS policies: public reads, admin writes only

## Next Steps (Optional)

1. **Add Authentication**: Set up Supabase Auth to require login for admin panel
2. **Add Users**: Invite yourself as an admin user
3. **Row Security**: Currently uses `public.has_role()` function—configure your admin role via `supabase.auth.users`
4. **Backups**: Enable automated daily backups in Supabase dashboard

## Troubleshooting

**"No overload matches this call" errors?**
- Make sure migrations ran successfully
- Check Supabase dashboard → Table Editor to confirm tables exist

**"401 Unauthorized" errors?**
- RLS policies require anon key access
- Public reads work, writes require admin authentication (set up later)

**Data not appearing?**
- Check browser console for error messages
- Verify Supabase credentials in `.env` file
- Ensure migrations have RLS enabled

## API Reference

All functions in `src/lib/content.ts` are now async:

```typescript
// Load all items
const posts = await loadBlogPosts()
const skills = await loadSkills()
const projects = await loadProjects()
const entries = await loadTimelineEntries()
const certs = await loadCertifications()

// Add item
await addBlogPost({ title, slug, excerpt, content, tags })

// Update item
await updateBlogPost(id, { title, slug, excerpt, content, tags })

// Delete item
await deleteBlogPost(id)
```

Admin pages have been updated to handle async operations automatically.
