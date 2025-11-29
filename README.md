# CopilotKit <> Mastra Starter

This is a starter template for building AI agents using [Mastra](https://mastra.ai) and [CopilotKit](https://copilotkit.ai). It provides a modern Next.js application with integrated AI capabilities, multi-tenant organization management, and a themeable UI.

## Prerequisites

- Node.js 18+ 
- Any of the following package managers:
  - pnpm

> **Note:** This repository ignores lock files (package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb) to avoid conflicts between different package managers. Each developer should generate their own lock file using their preferred package manager. After that, make sure to delete it from the .gitignore.

## Features

### Organization Management
- **Multi-tenant Architecture**: Support for multiple organizations per user
- **Role-Based Access Control**: Admin and user roles with granular permissions
- **Email Invitations**: Invite users via email with configurable expiration
- **Member Management**: Add, update, and remove organization members
- **Invitation Tracking**: Monitor pending, accepted, and expired invitations

### Theming System
- **Three Built-in Themes**:
  - **Terminal**: Dark theme with green accents (default)
  - **Glass**: Modern glassmorphism with purple/blue accents
  - **Material**: Clean Material Design light theme
- **Easy Theme Switching**: Simple CSS import to change themes
- **Tailwind Integration**: Theme colors available as utility classes
- **Fully Customizable**: Create your own themes with CSS variables

### AI Capabilities
- **Mastra Agent Integration**: Build and deploy AI agents
- **CopilotKit UI**: Beautiful conversational interfaces
- **Cloudflare D1 Storage**: Persistent agent memory and data

## Getting Started

1. Install dependencies using your preferred package manager:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
# Required: OpenAI or OpenRouter API key for AI agents
OPENAI_API_KEY=your-key-here

# Required: Resend API key for email invitations
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@yourdomain.com

# Optional: Customize invitation expiration
INVITE_EXPIRATION_DAYS=7
APP_URL=http://localhost:3000
```

3. Set up the database:
```bash
# Create D1 database
pnpm wrangler d1 create mastra-db

# Update wrangler.jsonc with the database ID from output
# Run migrations
pnpm wrangler d1 migrations apply mastra-db --local
```

4. Start the development server:
```bash
pnpm dev
```

This will start the Next.js dev server with hot reload and full D1 access at http://localhost:3000.

## Available Scripts
The following scripts can be run using your preferred package manager:
- `dev` - Fast development with full D1 access (recommended)
- `dev:debug` - Development mode with debug logging enabled
- `dev:cf` - Production-like testing with Cloudflare Workers
- `mastra:dev` - Start Mastra CLI playground for agent testing
- `build` - Builds the application for production
- `preview` - Preview production build locally
- `deploy` - Deploy to Cloudflare
- `lint` - Runs ESLint for code linting

See [CLAUDE.md](./CLAUDE.md) for detailed development workflow guidance.

## Documentation

### Project Documentation
- [CLAUDE.md](./CLAUDE.md) - Complete project overview and development guide
- [Organization Management](./docs/organizations.md) - Multi-tenant system guide
- [Theming Guide](./docs/theming.md) - Theme customization and switching

### External Documentation
- [Mastra Documentation](https://mastra.ai/en/docs) - Learn more about Mastra and its features
- [CopilotKit Documentation](https://docs.copilotkit.ai) - Explore CopilotKit's capabilities
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.