# Todo Cleargent

A clean, distraction-free todo list application with AI-powered task assistance. Built with Convex backend, Next.js 15 App Router, Tailwind CSS, shadcn/ui components, and Better Auth authentication.

## ✨ Features

- **Core Task Management**: Create, update, complete, and organize tasks
- **AI Task Assistant**: Get intelligent suggestions and insights powered by AI agents
- **Smart Organization**: Labels, priorities, due dates, and custom ordering
- **Activity Tracking**: Complete history of task changes
- **Clean Interface**: Minimal, distraction-free design with Inter font
- **Secure Authentication**: Better Auth with Convex adapter
- **Real-time Sync**: Instant updates across all devices

## 🏗️ Architecture

This project follows the **Cleargent Four-Layer Pattern**:

1. **Database Layer** (`convex/db/`): Pure CRUD operations with `ctx.db`
2. **Endpoint Layer** (`convex/endpoints/`): Business logic and API endpoints
3. **Workflow Layer** (`convex/workflows/`): Durable external integrations (if needed)
4. **Helper Layer** (`convex/helpers/`): Pure utility functions

## 🧩 Convex Components

This project uses the following Convex components:

- **Better Auth** (`@convex-dev/better-auth`): Authentication and session management
- **Rate Limiter** (`@convex-dev/rate-limiter`): API rate limiting to prevent abuse
- **Agent** (`@convex-dev/agent`): AI agent orchestration for task assistance

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Convex account (sign up at https://convex.dev)
- OpenAI API key (for AI features) or Anthropic API key

## 🚀 Installation

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Convex

```bash
# Initialize Convex (creates deployment)
npx convex dev --once

# This will:
# - Create a new Convex deployment
# - Generate convex/_generated/ files
# - Output your CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local and fill in:
# - CONVEX_DEPLOYMENT (from step 2)
# - NEXT_PUBLIC_CONVEX_URL (from step 2)
# - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)
# - OPENAI_API_KEY (from https://platform.openai.com/api-keys)
```

### 4. Start Development Servers

```bash
# Start both Convex and Next.js
pnpm dev

# Or start individually:
pnpm convex:dev  # Convex backend
pnpm web:dev     # Next.js frontend
```

Visit http://localhost:3000 to see your app!

## 🗂️ Project Structure

```
todo-cleargent/
├── convex/
│   ├── schema.ts              # Database schema
│   ├── convex.config.ts       # Component configuration
│   ├── auth.ts                # Better Auth setup
│   ├── http.ts                # HTTP routes
│   ├── db/                    # Database layer (CRUD)
│   ├── endpoints/             # API endpoints (business logic)
│   ├── workflows/             # Durable workflows (if needed)
│   └── helpers/               # Utility functions
├── apps/
│   └── web/                   # Next.js 15 App Router
│       ├── app/               # App routes
│       ├── components/        # React components
│       └── lib/               # Client utilities
└── packages/                  # Shared packages (optional)
```

## 🔐 Authentication Setup

Better Auth is configured with:
- Email/password authentication
- 30-day JWT expiration
- Convex adapter for database storage

No additional configuration needed - authentication routes are automatically available at `/auth/*`.

## 🤖 AI Agent Setup

The Agent component provides AI-powered task assistance:

1. **Configured in**: `convex/agent.ts`
2. **Model**: OpenAI GPT-4 or Claude (configurable)
3. **Features**: Task suggestions, prioritization, natural language processing

Set your `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env.local` to enable AI features.

## 🛡️ Rate Limiting

Rate limiting is automatically configured for:
- Task creation: 20 requests/minute
- Task updates: 50 requests/minute
- AI queries: 10 requests/minute

Configure in `convex/rateLimiter.ts` as needed.

## 📊 Database Schema

Key tables:
- **tasks**: Main task data with status, priority, due dates
- **labels**: Color-coded labels for organization
- **taskLabels**: Many-to-many task-label relationships
- **threads**: AI conversation threads
- **messages**: AI conversation messages
- **userPreferences**: User settings and preferences
- **taskActivity**: Audit log of task changes
- **taskComments**: User notes and AI suggestions

All tables are user-scoped with `userId` for data isolation.

## 🎨 Design System

- **Theme**: Neutral tone with balanced density
- **Primary Color**: Indigo (#6366f1)
- **Secondary Color**: Sky (#0ea5e9)
- **Accent Color**: Orange (#f97316)
- **Font**: Inter with 'Plus Jakarta Sans' for headings
- **UI Framework**: shadcn/ui with Radix UI primitives

## 🧪 Testing

```bash
pnpm test
```

## 🚢 Deployment

### Deploy Convex Backend

```bash
npx convex deploy
```

### Deploy Next.js Frontend

Deploy to Vercel, Netlify, or your preferred platform. Make sure to set all environment variables from `.env.local.example`.

## 📚 Next Steps

1. **Customize the schema**: Add custom fields to tasks in `convex/schema.ts`
2. **Build the frontend**: Create React components in `apps/web/`
3. **Implement endpoints**: Add business logic in `convex/endpoints/`
4. **Configure AI prompts**: Customize AI behavior in agent configuration
5. **Add integrations**: Use workflows for external services (calendar, email, etc.)

## 🤝 Contributing

This is a generated project template. Customize it to fit your needs!

## 📄 License

MIT

## 🔗 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Convex Components](https://docs.convex.dev/components)
