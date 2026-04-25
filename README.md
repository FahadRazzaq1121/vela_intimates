# Vela Intimates — Complete eCommerce Platform

A production-ready, luxury eCommerce platform for lingerie & intimate wear, built with Next.js 16, Supabase, and Tailwind CSS.

---

## Quick Start

```bash
# 1. Copy environment variables
cp .env.example .env.local

# 2. Fill in your Supabase and Resend credentials (see Setup below)

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — store is live.
Open [http://localhost:3000/admin](http://localhost:3000/admin) — admin panel.

---

## Setup Guide

### Step 1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** in Supabase dashboard
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** — this creates all tables, policies, storage buckets, and seeds sample data

### Step 2 — Configure Environment Variables

Edit `.env.local` with your values:

```env
# From Supabase > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# From resend.com (free tier works)
RESEND_API_KEY=re_your_key

# Your admin and from emails
ADMIN_EMAIL=admin@velaintimates.com
FROM_EMAIL=orders@velaintimates.com

# Your site URL (localhost for dev)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3 — Create Admin Account

1. In Supabase dashboard → **Authentication** → **Users** → **Add User**
2. Create a user with your admin email and a secure password
3. Copy the user's UUID from the Users table
4. In **SQL Editor**, run:

```sql
INSERT INTO admins (id, email, full_name)
VALUES ('your-user-uuid-here', 'admin@velaintimates.com', 'Admin Name');
```

Now log in at `/admin/login` with those credentials.

### Step 4 — Set Up Email (Optional but Recommended)

1. Go to [resend.com](https://resend.com) and create a free account
2. Get your API key and add it to `.env.local`
3. Add and verify your sending domain in Resend
4. Update `FROM_EMAIL` in `.env.local` to use your verified domain

Without a Resend key, emails are skipped silently — orders still work.

---

## Features

### Customer Store
- ✅ Homepage with hero slider, categories, featured products, testimonials
- ✅ Shop page with category, price, and size filters + sorting
- ✅ Product detail page with image gallery, size/color picker, reviews
- ✅ Persistent cart (localStorage) with animated sidebar
- ✅ Guest checkout (no account required)
- ✅ Cash on Delivery + Manual payment options
- ✅ Coupon code support
- ✅ Order confirmation page
- ✅ Wishlist (localStorage)

### Admin Panel (`/admin`)
- ✅ Secure login with Supabase Auth
- ✅ Dashboard with revenue, orders, and growth stats
- ✅ Orders table with search and status filter
- ✅ Order detail view with status updater (sends email on change)
- ✅ Products CRUD with image upload to Supabase Storage
- ✅ Category management
- ✅ Customers view with order history

### Email Notifications (via Resend)
- ✅ Order confirmation → customer
- ✅ New order alert → admin
- ✅ Status update emails on every status change → customer

---

## Project Structure

```
vela-intimates/
├── src/
│   ├── app/
│   │   ├── (store)/        # Customer-facing pages
│   │   │   ├── page.tsx    # Homepage
│   │   │   ├── shop/       # Product listing
│   │   │   ├── products/   # Product detail
│   │   │   ├── cart/       # Cart page
│   │   │   ├── checkout/   # Checkout
│   │   │   └── order-confirmed/
│   │   ├── admin/          # Admin panel
│   │   └── api/            # API routes
│   ├── components/
│   │   ├── store/          # Store components
│   │   ├── admin/          # Admin components
│   │   └── ui/             # Shared UI components
│   ├── contexts/           # CartContext
│   ├── lib/
│   │   ├── supabase/       # Supabase clients
│   │   ├── email/          # Email templates & sender
│   │   └── utils.ts        # Helpers
│   └── types/              # TypeScript types
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## Adding Stripe (Future)

The checkout is structured for easy Stripe integration:

1. Add `stripe` package: `npm install stripe @stripe/stripe-js`
2. Add a new payment method option `'stripe'` to the checkout form
3. Create `/api/orders/payment-intent` route using Stripe SDK
4. Add the Stripe Elements UI in CheckoutForm for card payment
5. Handle webhook in `/api/webhooks/stripe` to mark orders as paid

---

## Deployment on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables from `.env.local` to your Vercel project settings.

**Vercel Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Node.js Version:** 22.x

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Email | Resend |
| Animations | Framer Motion |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Sample Data

The migration seeds:
- 6 categories (Bras, Panties, Sets, Loungewear, Sleepwear, Bodysuits)
- 8 products with images, sizes, and colors
- 5 approved reviews
- 3 coupon codes: `WELCOME10` (10% off), `VELA20` (20% off $100+), `SAVE15` ($15 off $75+)
