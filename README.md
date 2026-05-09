# SHRUK — Light Redesign

A light, minimal, professional 3-page website with Supabase contact form integration.

## Setup

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The credentials are automatically read from the meta tags in `contact.html` and `index.html`.

### Running Locally

```bash
python -m http.server 5173
```

Then open `http://localhost:5173` in your browser.

## Supabase Setup

The `contacts` table has already been created with the following schema:

```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**RLS Policy:** Anonymous inserts are enabled. No authentication required for the contact form.

## Features

- **Light theme** with gradient accents (#C084FC → #60A5FA)
- **Responsive design** for mobile, tablet, and desktop
- **Contact form** posts directly to Supabase (client-side)
- **Fallback**: If Supabase keys are missing, form defaults to `mailto:` link
- **CDN import** of Supabase JS library (no build step required)

## Pages

- **index.html** — Home page with hero, services, vision/mission, CTA
- **projects.html** — Project showcase (Café Management System + Coming Soon)
- **contact.html** — Contact form with Supabase integration
