# Y1 Stack

The ultimate SaaS toolkit that connects all your favorite tools. Pre-configured, production-ready, and built for modern teams.

**Built on top of [T3 Stack](https://create.t3.gg/)** with additional integrations:
- ✨ **Polar** for payment processing
- 📚 **Fumadocs** for beautiful documentation
- 🎨 Enhanced UI/UX with modern design

## Tech Stack

### Core (T3 Stack)
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Authentication:** Better Auth
- **Database:** PostgreSQL with Drizzle ORM
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **API:** tRPC

### Additional Integrations
- **Payments:** Polar - Modern payment processing
- **Documentation:** Fumadocs - Beautiful docs out of the box
- **Hosting:** Supabase (Database) + Vercel (App)

## Prerequisites

Before you begin, make sure you have:

- Node.js 20+ installed
- npm 11+ or another package manager
- A PostgreSQL database (we recommend Supabase)
- A Polar account for payments (optional)

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd swipeat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file at the root of the project with the following variables:

```env
# Better Auth
# Generate a secret with: openssl rand -base64 32
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Supabase (optional - only if using Supabase features)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Polar (optional - only if using Polar for payments)
POLAR_ACCESS_TOKEN=polar_oat_your_token
POLAR_SUCCESS_URL=http://localhost:3000/success?checkout_id={CHECKOUT_ID}
POLAR_WEBHOOK_SECRET=polar_whs_your_webhook_secret
POLAR_SERVER="sandbox" # or "production"
```

### 4. Set up the database

#### Option A: Using Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Copy your connection string from Settings > Database
3. Update `DATABASE_URL` in your `.env` file
4. Run migrations:

```bash
npm run db:push
```

#### Option B: Using another PostgreSQL database

1. Set up your PostgreSQL database
2. Update `DATABASE_URL` in your `.env` file
3. Run migrations:

```bash
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

Your app should now be running at [http://localhost:3000](http://localhost:3000)

## Environment Variables Guide

### Required Variables

| Variable | Description | How to get it |
|----------|-------------|---------------|
| `BETTER_AUTH_SECRET` | Secret key for Better Auth | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL of your application | `http://localhost:3000` for local dev |
| `DATABASE_URL` | PostgreSQL connection string | From your database provider (Supabase, Neon, etc.) |

### Optional Variables

| Variable | Description | Required for |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase features |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase features |
| `POLAR_ACCESS_TOKEN` | Polar API access token | Payment processing |
| `POLAR_SUCCESS_URL` | Redirect URL after successful payment | Payment processing |
| `POLAR_WEBHOOK_SECRET` | Polar webhook secret | Payment webhooks |
| `POLAR_SERVER` | Polar environment (`sandbox` or `production`) | Payment processing |

## Available Scripts

### Development
- `npm run dev` - Start development server with Turbo
- `npm run ngrok` - Start ngrok tunnel for webhook testing

### Database
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Build & Production
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run preview` - Build and start production server

### Code Quality
- `npm run typecheck` - Run TypeScript type checking
- `npm run check` - Run Biome linter
- `npm run check:write` - Run Biome linter and fix issues

## Project Structure

```
swipeat/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── (auth)/       # Authentication pages (login, signup)
│   │   ├── (polar)/      # Polar payment routes
│   │   ├── hello/        # Test page for DB and auth
│   │   └── page.tsx      # Landing page
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...
│   ├── server/           # Server-side code
│   │   ├── better-auth/  # Better Auth configuration
│   │   ├── db/           # Database schema and client
│   │   └── api/          # tRPC routers
│   ├── lib/              # Utility functions
│   └── styles/           # Global styles
├── drizzle/              # Database migrations
└── public/               # Static assets
```

## Key Features

- **Authentication**: Email/password authentication with Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **API**: Type-safe API with tRPC
- **Payments**: Integrated Polar for subscriptions and one-time payments
- **UI Components**: Pre-built shadcn/ui components
- **Dark Mode**: Built-in theme switching
- **Documentation**: Beautiful docs powered by Fumadocs
- **Type Safety**: Full TypeScript support

## Documentation with Fumadocs

This project includes a built-in documentation system powered by [Fumadocs](https://fumadocs.vercel.app/), a modern documentation framework for Next.js.

### How it works

1. **Content Location**: Write your documentation as Markdown/MDX files in the `content/docs/` directory
2. **File-based Routing**: Each file automatically becomes a documentation page
3. **Access**: Visit `/docs` to see your documentation
4. **Features**:
   - Full-text search
   - Table of contents
   - Syntax highlighting
   - Dark mode support
   - Mobile responsive

### Creating Documentation Pages

Create a new `.md` or `.mdx` file in `content/docs/`:

```md
---
title: Your Page Title
description: A brief description
---

# Your Page Title

Your content here with full Markdown/MDX support.
```

### Example Documentation Structure

```
content/
└── docs/
    ├── index.md          # Home page (/docs)
    ├── getting-started.md # /docs/getting-started
    ├── api/
    │   ├── overview.md    # /docs/api/overview
    │   └── routes.md      # /docs/api/routes
    └── guides/
        └── deployment.md  # /docs/guides/deployment
```

### Customizing Documentation

- **Layout**: Modify `src/app/(docs)/docs/[[...slug]]/layout.tsx`
- **Page**: Customize `src/app/(docs)/docs/[[...slug]]/page.tsx`
- **Source Config**: Update `src/lib/source.ts` for advanced configuration

## Testing the Setup

### Basic Testing

Visit `/hello` to test:
- Database connection
- tRPC queries
- Better Auth session management
- Create and view posts (when authenticated)

### Testing Polar Webhooks with ngrok

To test Polar payment webhooks in development, you need to expose your local server to the internet using ngrok.

#### 1. Install ngrok

```bash
# On macOS
brew install ngrok

# On Windows
choco install ngrok

# Or download from https://ngrok.com/download
```

#### 2. Get a free ngrok domain

1. Sign up at [ngrok.com](https://ngrok.com)
2. Get your free static domain (e.g., `your-app.ngrok-free.app`)
3. Add your authtoken: `ngrok config add-authtoken YOUR_TOKEN`

#### 3. Update the ngrok script

Edit the `ngrok` script in `package.json` with your domain:

```json
"ngrok": "ngrok http 3000 --domain=your-app.ngrok-free.app"
```

#### 4. Start your development environment

Open two terminal windows:

**Terminal 1 - Start Next.js dev server:**
```bash
npm run dev
```

**Terminal 2 - Start ngrok tunnel:**
```bash
npm run ngrok
```

#### 5. Configure Polar webhooks

1. Go to your [Polar Dashboard](https://polar.sh/dashboard)
2. Navigate to Settings > Webhooks
3. Add a new webhook endpoint:
   - **URL**: `https://your-app.ngrok-free.app/api/webhooks/polar`
   - **Events**: Select the events you want to listen to (e.g., `checkout.created`, `order.created`)
4. Copy the webhook secret and add it to your `.env`:
   ```env
   POLAR_WEBHOOK_SECRET=polar_whs_your_webhook_secret
   ```

#### 6. Test the webhook

1. Create a test checkout in Polar (sandbox mode)
2. Complete the payment flow
3. Check your terminal logs to see the webhook events being received
4. Webhook endpoint is at: `src/app/api/webhooks/polar/route.ts`

#### Troubleshooting

- **ngrok not forwarding?** Make sure both terminals are running
- **Webhook not received?** Check the Polar dashboard webhook logs
- **Signature verification failed?** Verify your `POLAR_WEBHOOK_SECRET` is correct
- **ngrok session expired?** Free ngrok sessions expire after 2 hours - restart the tunnel

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add all required environment variables
4. Deploy!

### Environment Variables for Production

Don't forget to update these for production:
- `BETTER_AUTH_URL` - Your production domain
- `POLAR_SERVER` - Set to `production`
- `POLAR_SUCCESS_URL` - Update with your production domain

## Getting Help

### T3 Stack Resources
- [T3 Stack Documentation](https://create.t3.gg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [tRPC Documentation](https://trpc.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### Additional Resources
- [Polar Documentation](https://docs.polar.sh/)
- [Fumadocs Documentation](https://fumadocs.vercel.app/docs)

## License

MIT
