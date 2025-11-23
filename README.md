# CopilotKit <> Mastra Starter

This is a starter template for building AI agents using [Mastra](https://mastra.ai) and [CopilotKit](https://copilotkit.ai). It provides a modern Next.js application with integrated AI capabilities and a beautiful UI.

## Prerequisites

- Node.js 18+ 
- Any of the following package managers:
  - pnpm

> **Note:** This repository ignores lock files (package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb) to avoid conflicts between different package managers. Each developer should generate their own lock file using their preferred package manager. After that, make sure to delete it from the .gitignore.

## Getting Started

1. Add your OpenAI API key
```bash
# you can use whatever model Mastra supports
echo "OPENAI_API_KEY=your-key-here" >> .env
```

2. Install dependencies using your preferred package manager:
```bash
pnpm install
```

3. Set up authentication (see Authentication section below for OAuth setup):
```bash
# Generate a secure random secret for Better Auth
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env
echo "BETTER_AUTH_URL=http://localhost:3000" >> .env
```

4. Apply database migrations:
```bash
pnpm wrangler d1 migrations apply mastra-db --local
```

5. Start the development server:
```bash
pnpm dev
```

This will start the Cloudflare Workers preview server with D1 database.

## Available Scripts
The following scripts can also be run using your preferred package manager:
- `dev` - Starts both UI and agent servers in development mode
- `dev:debug` - Starts development servers with debug logging enabled
- `build` - Builds the application for production
- `start` - Starts the production server
- `lint` - Runs ESLint for code linting

## Authentication

This starter includes a complete authentication system built with [Better Auth](https://better-auth.com) and stored in Cloudflare D1.

### Features
- ✅ Email/password signup and login
- ✅ OAuth (Google and GitHub)
- ✅ Account linking (auto-link same email)
- ✅ Email verification (non-blocking)
- ✅ Password reset
- ✅ Role-based access control (admin, moderator, user)
- ✅ Rate limiting (3 req/10sec)
- ✅ Session management (7-day expiry)
- ✅ Security audit logging

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Add to `.env`:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env`:
```bash
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

### Password Requirements
Passwords must meet the following criteria:
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Pages
- `/login` - Login page
- `/signup` - Signup page
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token
- `/profile` - User profile management (protected)

### Database
Authentication data is stored in Cloudflare D1 (SQLite). Apply migrations:
```bash
# Local development
pnpm wrangler d1 migrations apply mastra-db --local

# Production
pnpm wrangler d1 migrations apply mastra-db --remote
```

## Documentation

- [Mastra Documentation](https://mastra.ai/en/docs) - Learn more about Mastra and its features
- [CopilotKit Documentation](https://docs.copilotkit.ai) - Explore CopilotKit's capabilities
- [Better Auth Documentation](https://better-auth.com/docs) - Learn about authentication features
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.