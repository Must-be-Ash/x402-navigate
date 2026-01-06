ashnouruzi@C357PRGCH2 examples % tree -L 5 -I 'node_modules|.git'
.
├── go
│   ├── clients
│   │   ├── advanced
│   │   │   ├── custom_transport.go
│   │   │   ├── error_recovery.go
│   │   │   ├── go.mod
│   │   │   ├── hooks.go
│   │   │   ├── main.go
│   │   │   ├── multi_network_priority.go
│   │   │   └── README.md
│   │   ├── custom
│   │   │   ├── go.mod
│   │   │   ├── main.go
│   │   │   └── README.md
│   │   └── http
│   │       ├── builder_pattern.go
│   │       ├── go.mod
│   │       ├── main.go
│   │       ├── mechanism_helper_registration.go
│   │       ├── README.md
│   │       └── utils.go
│   ├── facilitator
│   │   ├── go.mod
│   │   ├── main.go
│   │   ├── README.md
│   │   └── signer.go
│   └── servers
│       ├── advanced
│       │   ├── bazaar.go
│       │   ├── custom-money-definition.go
│       │   ├── dynamic-pay-to.go
│       │   ├── dynamic-price.go
│       │   ├── go.mod
│       │   ├── hooks.go
│       │   └── README.md
│       ├── custom
│       │   ├── go.mod
│       │   ├── main.go
│       │   └── README.md
│       └── gin
│           ├── go.mod
│           ├── main.go
│           └── README.md
├── python
│   └── legacy
│       ├── clients
│       │   ├── httpx
│       │   │   ├── extensible.py
│       │   │   ├── main.py
│       │   │   ├── pyproject.toml
│       │   │   ├── README.md
│       │   │   └── uv.lock
│       │   └── requests
│       │       ├── extensible.py
│       │       ├── main.py
│       │       ├── pyproject.toml
│       │       ├── README.md
│       │       └── uv.lock
│       ├── discovery
│       │   ├── main.py
│       │   ├── pyproject.toml
│       │   ├── README.md
│       │   └── uv.lock
│       ├── fullstack
│       │   ├── fastapi
│       │   │   ├── main.py
│       │   │   ├── pyproject.toml
│       │   │   ├── README.md
│       │   │   ├── static
│       │   │   └── uv.lock
│       │   └── flask
│       │       ├── main.py
│       │       ├── pyproject.toml
│       │       ├── README.md
│       │       ├── static
│       │       └── uv.lock
│       ├── README.md
│       ├── servers
│       │   ├── advanced
│       │   │   ├── main.py
│       │   │   ├── pyproject.toml
│       │   │   ├── README.md
│       │   │   └── uv.lock
│       │   ├── fastapi
│       │   │   ├── main.py
│       │   │   ├── pyproject.toml
│       │   │   ├── README.md
│       │   │   └── uv.lock
│       │   ├── flask
│       │   │   ├── main.py
│       │   │   ├── pyproject.toml
│       │   │   ├── README.md
│       │   │   └── uv.lock
│       │   └── mainnet
│       │       ├── main.py
│       │       ├── pyproject.toml
│       │       ├── README.md
│       │       └── uv.lock
│       └── sync.py
└── typescript
    ├── clients
    │   ├── advanced
    │   │   ├── builder-pattern.ts
    │   │   ├── eslint.config.js
    │   │   ├── hooks.ts
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── preferred-network.ts
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── axios
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── custom
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── fetch
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── mcp
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   └── README.md
    ├── facilitator
    │   ├── eslint.config.js
    │   ├── index.ts
    │   ├── package.json
    │   ├── README.md
    │   └── tsconfig.json
    ├── fullstack
    │   ├── miniapp
    │   │   ├── app
    │   │   │   ├── api
    │   │   │   ├── globals.css
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   └── providers.tsx
    │   │   ├── eslint.config.js
    │   │   ├── minikit.config.ts
    │   │   ├── next-env.d.ts
    │   │   ├── next.config.ts
    │   │   ├── package.json
    │   │   ├── postcss.config.mjs
    │   │   ├── README.md
    │   │   ├── tsconfig.json
    │   │   └── turbo.json
    │   └── next
    │       ├── app
    │       │   ├── api
    │       │   ├── globals.css
    │       │   ├── layout.tsx
    │       │   ├── page.tsx
    │       │   └── protected
    │       ├── eslint.config.js
    │       ├── next-env.d.ts
    │       ├── next.config.ts
    │       ├── package.json
    │       ├── postcss.config.mjs
    │       ├── proxy.ts
    │       ├── public
    │       │   ├── favicon.ico
    │       │   ├── site.webmanifest
    │       │   ├── x402-icon-black.png
    │       │   ├── x402-icon-blue.png
    │       │   └── x402-logo-dark.png
    │       ├── README.md
    │       ├── tsconfig.json
    │       └── turbo.json
    ├── legacy
    │   ├── agent
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── clients
    │   │   ├── axios
    │   │   │   ├── eslint.config.js
    │   │   │   ├── index.ts
    │   │   │   ├── multi-network-signer.ts
    │   │   │   ├── package.json
    │   │   │   ├── README.md
    │   │   │   └── tsconfig.json
    │   │   ├── cdp-sdk
    │   │   │   ├── eslint.config.js
    │   │   │   ├── index.ts
    │   │   │   ├── package.json
    │   │   │   ├── README.md
    │   │   │   └── tsconfig.json
    │   │   ├── chainlink-vrf-nft
    │   │   │   ├── client.ts
    │   │   │   ├── package-lock.json
    │   │   │   ├── package.json
    │   │   │   ├── README.md
    │   │   │   └── resource.ts
    │   │   └── fetch
    │   │       ├── eslint.config.js
    │   │       ├── index.ts
    │   │       ├── multi-network-signer.ts
    │   │       ├── package.json
    │   │       ├── README.md
    │   │       └── tsconfig.json
    │   ├── dynamic_agent
    │   │   ├── agent.ts
    │   │   ├── discover_server.ts
    │   │   ├── package-lock.json
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── facilitator
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── fullstack
    │   │   ├── auth_based_pricing
    │   │   │   ├── backend.ts
    │   │   │   ├── client.ts
    │   │   │   ├── package.json
    │   │   │   ├── README.md
    │   │   │   └── tsconfig.json
    │   │   ├── browser-wallet-example
    │   │   │   ├── client
    │   │   │   ├── package.json
    │   │   │   ├── README.md
    │   │   │   ├── server
    │   │   │   └── vite.config.ts
    │   │   ├── farcaster-miniapp
    │   │   │   ├── app
    │   │   │   ├── env.example
    │   │   │   ├── lib
    │   │   │   ├── middleware.ts
    │   │   │   ├── next.config.mjs
    │   │   │   ├── package.json
    │   │   │   ├── postcss.config.mjs
    │   │   │   ├── public
    │   │   │   ├── README.md
    │   │   │   ├── tailwind.config.ts
    │   │   │   └── tsconfig.json
    │   │   ├── next
    │   │   │   ├── app
    │   │   │   ├── eslint.config.js
    │   │   │   ├── middleware.ts
    │   │   │   ├── next.config.ts
    │   │   │   ├── package.json
    │   │   │   ├── postcss.config.mjs
    │   │   │   ├── public
    │   │   │   ├── README.md
    │   │   │   ├── tailwind.config.ts
    │   │   │   ├── tsconfig.json
    │   │   │   └── types
    │   │   └── next-advanced
    │   │       ├── app
    │   │       ├── middleware.ts
    │   │       ├── next.config.mjs
    │   │       ├── package.json
    │   │       ├── postcss.config.mjs
    │   │       ├── README.md
    │   │       ├── tailwind.config.ts
    │   │       └── tsconfig.json
    │   ├── mcp
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── mcp-embedded-wallet
    │   │   ├── electron.ts
    │   │   ├── eslint.config.js
    │   │   ├── index.html
    │   │   ├── index.ts
    │   │   ├── logger.ts
    │   │   ├── mcp.ts
    │   │   ├── package.json
    │   │   ├── pnpm-lock.yaml
    │   │   ├── preload.js
    │   │   ├── README.md
    │   │   ├── src
    │   │   │   ├── App.tsx
    │   │   │   ├── cdpConfig.ts
    │   │   │   ├── ChainProvider.tsx
    │   │   │   ├── components
    │   │   │   ├── main.module.css
    │   │   │   ├── main.tsx
    │   │   │   ├── package.json
    │   │   │   ├── services
    │   │   │   ├── stores
    │   │   │   ├── utils
    │   │   │   ├── vite-env.d.ts
    │   │   │   └── window.ts
    │   │   ├── TODO.md
    │   │   ├── tsconfig.json
    │   │   └── vite.config.ts
    │   └── servers
    │       ├── advanced
    │       │   ├── eslint.config.js
    │       │   ├── index.ts
    │       │   ├── package.json
    │       │   ├── README.md
    │       │   └── tsconfig.json
    │       ├── express
    │       │   ├── eslint.config.js
    │       │   ├── index.ts
    │       │   ├── package.json
    │       │   ├── README.md
    │       │   └── tsconfig.json
    │       └── hono
    │           ├── eslint.config.js
    │           ├── index.ts
    │           ├── package.json
    │           ├── README.md
    │           └── tsconfig.json
    ├── package.json
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    ├── README.md
    ├── servers
    │   ├── advanced
    │   │   ├── bazaar.ts
    │   │   ├── custom-money-definition.ts
    │   │   ├── dynamic-pay-to.ts
    │   │   ├── dynamic-price.ts
    │   │   ├── eslint.config.js
    │   │   ├── hooks.ts
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── custom
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── express
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   ├── hono
    │   │   ├── eslint.config.js
    │   │   ├── index.ts
    │   │   ├── package.json
    │   │   ├── README.md
    │   │   └── tsconfig.json
    │   └── README.md
    └── turbo.json

84 directories, 278 files