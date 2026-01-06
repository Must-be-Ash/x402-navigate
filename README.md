# x402 Discovery Site

A modern, intuitive web interface for discovering and navigating the x402 payment protocol documentation, examples, and guides. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### 🎯 Personalized Discovery
- **Typeform-style onboarding** that learns about your tech stack and goals
- **Smart filtering** based on language, framework, role, and experience level
- **Persistent preferences** saved to local storage for returning visitors

### 🔍 Powerful Search & Navigation
- **Real-time search** across all documentation and examples
- **Multi-faceted filtering** by:
  - **Role**: Accept payments (server), Make payments (client), Run facilitator
  - **Language**: TypeScript, Go, Python, Java
  - **Framework**: Express, Hono, Next.js, Gin, Flask, and more
  - **Complexity**: Beginner, Intermediate, Advanced
  - **Features**: MCP, AI Agents, Browser Wallets, Bazaar Discovery, etc.

### 📚 Organized Content
- **Content categorization** by type:
  - 🚀 Quickstart guides
  - 💻 Code examples
  - 📖 Guides & tutorials
  - 💡 Core concepts
  - 📄 API references
  - 📝 Specifications

### 🎨 Beautiful UI
- **Clean, modern interface** built with shadcn/ui components
- **Responsive design** that works on all screen sizes
- **Syntax highlighting** for code examples
- **Markdown rendering** for documentation

## How It Works

### Architecture

The site uses a **hybrid server/client architecture**:

1. **Build-time content indexing**: The `content-parser.ts` reads and indexes all content from the parent x402 repository at build time
2. **Server-side data loading**: The main page is a server component that loads taxonomy and content data
3. **Client-side interactivity**: Onboarding, filtering, and search are handled client-side for a smooth UX
4. **Dynamic routes**: Content detail pages are generated statically for all content items

### Content Taxonomy

The site uses a comprehensive taxonomy defined in `content-taxonomy.json` that maps all x402 content with:
- Metadata (language, framework, complexity, features)
- Onboarding questions and answer mappings
- Content type definitions
- Tag categories for filtering

### Onboarding Flow

New visitors are guided through a multi-step onboarding that asks:
1. **What do you want to do?** (Accept payments, Make payments, Run facilitator, Learn)
2. **What language?** (TypeScript, Go, Python, Java)
3. **What framework/stack?** (Context-dependent based on language choice)
4. **Experience level?** (Beginner, Intermediate, Advanced)

Answers are automatically converted to filters and saved for future visits.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- The x402 repository (this site should be inside the x402 repo directory)

### Installation

```bash
cd x402-discovery-site
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
x402-discovery-site/
├── app/
│   ├── layout.tsx           # Root layout with AppProvider
│   ├── page.tsx             # Server component that loads data
│   ├── home-client.tsx      # Client component for interactivity
│   └── content/
│       └── [id]/
│           └── page.tsx     # Dynamic content detail pages
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── onboarding-flow.tsx  # Typeform-style onboarding
│   ├── filter-bar.tsx       # Filter controls
│   ├── content-card.tsx     # Content item preview card
│   ├── code-viewer.tsx      # Code file viewer with tabs
│   ├── markdown-viewer.tsx  # Markdown renderer
│   └── browse-content.tsx   # Main content browsing UI
├── lib/
│   ├── types.ts             # TypeScript type definitions
│   ├── content-parser.ts    # Server-side content indexing
│   ├── content-filter.ts    # Client-safe filtering logic
│   ├── app-context.tsx      # React context for app state
│   └── utils.ts             # Utility functions
└── content-taxonomy.json    # Content taxonomy and metadata
```

## Key Technologies

- **Next.js 15** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **React Markdown** - Markdown rendering
- **Highlight.js** - Syntax highlighting
- **Lucide React** - Icons

## Customization

### Adding New Content

1. Update `content-taxonomy.json` with new content items
2. Ensure the content exists in the parent x402 repo at the specified path
3. Rebuild the site to index the new content

### Modifying Onboarding

Edit the `onboarding.questions` section in `content-taxonomy.json`:
- Add new questions
- Modify options
- Update answer-to-filter mappings

### Changing Filters

Update the filter logic in:
- `content-filter.ts` - Filtering logic
- `filter-bar.tsx` - UI controls
- `app-context.tsx` - State management

## Design Philosophy

### Discovery-First
The site prioritizes helping users find what they need quickly, rather than mirroring the repository structure. Content is reorganized and tagged for optimal discoverability.

### Progressive Disclosure
Simple examples and quickstarts are highlighted first, with advanced content accessible but not overwhelming to beginners.

### Task-Oriented
Instead of technical jargon (e.g., "Server"), we use plain language that describes what users want to accomplish (e.g., "Accept payments for my API").

### Smart Defaults
The onboarding flow sets intelligent initial filters based on user answers, so they immediately see relevant content.

## Contributing

This site is part of the x402 project. To contribute:

1. Fork the x402 repository
2. Make your changes to the `x402-discovery-site/` directory
3. Test locally with `npm run dev`
4. Submit a pull request

## License

This project is part of x402 and follows the same Apache 2.0 license.

## Learn More

- [x402 Main Repository](https://github.com/coinbase/x402)
- [x402 Documentation](https://x402.org)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
# x402-navigate
