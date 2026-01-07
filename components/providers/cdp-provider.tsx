'use client';

import { CDPReactProvider } from '@coinbase/cdp-react';

// CDP Configuration for embedded wallets
const CONFIG = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID || '',
  appName: 'x402 Discovery',
  appLogoUrl: '/logo.png',
  ethereum: {
    createOnLogin: "smart" as const,  // Create Smart Account (ERC-4337) for x402 payments
  },
};

interface CDPProviderProps {
  children: React.ReactNode;
}

export function CDPProvider({ children }: CDPProviderProps) {
  if (!CONFIG.projectId) {
    console.warn('CDP Project ID is missing. Add NEXT_PUBLIC_CDP_PROJECT_ID to .env');
  }

  return (
    <CDPReactProvider config={CONFIG}>
      {children}
    </CDPReactProvider>
  );
}
