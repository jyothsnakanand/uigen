# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language, and the application generates React code using Claude AI, displaying it in a real-time browser preview. All file operations occur in a virtual file system (no disk writes).

## Development Commands

### Initial Setup
```bash
npm run setup
```
Installs dependencies, generates Prisma client, and runs database migrations.

### Development Server
```bash
npm run dev
```
Starts Next.js dev server with Turbopack at http://localhost:3000. The `NODE_OPTIONS='--require ./node-compat.cjs'` flag is required to fix Node.js 25+ Web Storage SSR compatibility.

### Testing
```bash
npm test                    # Run all tests with Vitest
vitest path/to/test.test.tsx  # Run specific test file
```

Tests use Vitest with jsdom environment. Test files are located in `__tests__` directories alongside source files.

### Building
```bash
npm run build              # Production build
npm start                  # Start production server
```

### Database
```bash
npx prisma generate        # Regenerate Prisma client (output: src/generated/prisma)
npx prisma migrate dev     # Create and apply migrations
npm run db:reset          # Reset database (force)
```

## Architecture

### Core Technologies
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **Prisma** with SQLite database
- **Vercel AI SDK** for streaming AI responses
- **Anthropic Claude** (Haiku 4.5) for component generation
- **Vitest** for testing

### Virtual File System (`src/lib/file-system.ts`)

The `VirtualFileSystem` class is the heart of the application:
- All file operations are in-memory; no files written to disk
- Implements CRUD operations: `createFile()`, `readFile()`, `updateFile()`, `deleteFile()`, `rename()`
- Serialization/deserialization for database persistence
- Tool command implementations: `viewFile()`, `createFileWithParents()`, `replaceInFile()`, `insertInFile()`
- Accessed via `FileSystemContext` React context (`src/lib/contexts/file-system-context.tsx`)

### AI Integration

**Chat API Route** (`src/app/api/chat/route.ts`):
- Streams responses using Vercel AI SDK's `streamText()`
- Provides two AI tools:
  - `str_replace_editor`: Create, view, and edit files (commands: create, view, str_replace, insert)
  - `file_manager`: Rename and delete files
- Persists conversation messages and file system state to database after each interaction
- Uses prompt caching (Anthropic cache control) for system prompt

**Provider System** (`src/lib/provider.ts`):
- Primary: Anthropic Claude (Haiku 4.5) when `ANTHROPIC_API_KEY` is set
- Fallback: `MockLanguageModel` generates static demo components when no API key
- Mock provider simulates multi-step agentic behavior for testing without API costs

**Generation Prompt** (`src/lib/prompts/generation.tsx`):
- Instructs AI to create React components with Tailwind CSS
- Enforces `/App.jsx` as required entry point
- Requires `@/` import alias for local files

### JSX Transformation & Preview (`src/lib/transform/jsx-transformer.ts`)

Browser preview system:
1. **Transform**: Babel standalone transpiles JSX/TSX to ES modules
2. **Import Map**: Creates blob URLs for each module; maps `@/` alias to root
3. **Preview HTML**: Injects transformed code with import map, Tailwind CDN, and error boundary
4. **CSS Handling**: Collects and inlines CSS files
5. **Error Display**: Syntax errors shown with formatted UI instead of breaking preview

Preview component: `src/components/preview/PreviewFrame.tsx`

### Database Schema

**Location:** `prisma/schema.prisma`

The database schema is defined in the `prisma/schema.prisma` file. Reference it anytime you need to understand the structure of data stored in the database.

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  projects  Project[]
}

model Project {
  id        String   @id @default(cuid())
  name      String
  userId    String?  (nullable for anonymous users)
  messages  String   @default("[]")  (JSON serialized)
  data      String   @default("{}")  (VirtualFileSystem serialized)
  user      User?    @relation(...)
}
```

Anonymous users can create projects (tracked client-side). Registered users persist projects to database.

### Authentication (`src/lib/auth.ts`, `src/middleware.ts`)

- JWT-based sessions using `jose` library
- Middleware protects `/[projectId]` routes (authenticated users only)
- Anonymous users redirected to home page
- Password hashing with bcrypt

### Import Alias

The `@/` alias maps to `/src`:
```typescript
import { VirtualFileSystem } from "@/lib/file-system";
```

Configured in `tsconfig.json` paths. During preview, `@/` maps to the virtual file system root (`/`).

### Context Providers

**FileSystemContext** (`src/lib/contexts/file-system-context.tsx`):
- Manages VirtualFileSystem instance
- Tracks selected file for editor
- Handles tool calls from AI (creates/updates files in real-time)

**ChatContext** (`src/lib/contexts/chat-context.tsx`):
- Manages conversation state
- Handles streaming AI responses
- Synchronizes file system changes with UI updates

### Key Patterns

1. **No Disk Writes**: Virtual file system operates entirely in memory. Only database persistence occurs.
2. **Live Preview**: Changes from AI tool calls immediately update preview via context + React state.
3. **Agentic Workflow**: AI makes multiple tool calls (file creation, editing) in sequence until task complete.
4. **Graceful Degradation**: Mock provider enables development/demo without API key.
5. **Error Resilience**: Syntax errors in generated code don't crash app; shown in preview frame.

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/chat/route.ts    # Streaming AI chat endpoint
│   ├── [projectId]/page.tsx # Project detail page (auth required)
│   └── page.tsx             # Home page
├── components/
│   ├── auth/                # Sign in/up forms, auth dialog
│   ├── chat/                # Chat interface, message list, markdown renderer
│   ├── editor/              # Code editor (Monaco), file tree
│   ├── preview/             # Preview frame (iframe-based)
│   └── ui/                  # Radix UI + shadcn components
├── lib/
│   ├── contexts/            # React contexts (FileSystem, Chat)
│   ├── tools/               # AI tools (str-replace, file-manager)
│   ├── transform/           # JSX transformer, import map builder
│   ├── prompts/             # System prompts for AI
│   ├── auth.ts              # JWT session management
│   ├── file-system.ts       # VirtualFileSystem class
│   ├── provider.ts          # AI provider (Anthropic + Mock)
│   └── prisma.ts            # Prisma client singleton
├── actions/                 # Server actions (create project, get projects)
└── hooks/                   # Custom React hooks

prisma/
└── schema.prisma            # Database schema (SQLite)
```

## Important Notes

- **Prisma Client Location**: Generated to `src/generated/prisma` (not default `node_modules/.prisma`)
- **Required Node Flag**: All npm scripts use `NODE_OPTIONS='--require ./node-compat.cjs'` for Node.js 25 compatibility
- **Entry Point**: Generated projects must have `/App.jsx` with default export
- **Styling**: Use Tailwind CSS classes, not inline styles or CSS-in-JS
- **Third-Party Libraries**: Loaded from esm.sh CDN in preview (e.g., `https://esm.sh/react@19`)
- **Code Comments**: Use comments sparingly. Only comment complex code that isn't self-evident
