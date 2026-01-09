/**
 * Client Path Lessons
 *
 * Lesson data for the Client learning path
 */

import type { Lesson, CourseData } from './types';

export const clientCourse: CourseData = {
  role: 'client',
  title: 'Client Path',
  description: 'Learn to call payment-gated APIs and handle 402 responses',
  totalDuration: '~30 min',
  lessons: [
    {
      id: 1,
      title: 'Understanding the x402 Flow (Client Perspective)',
      description: 'Learn the request → 402 → payment → retry cycle',
      duration: '10 min',
    },
    {
      id: 2,
      title: 'Your First x402 Request',
      description: 'Make a successful payment-gated API call using @x402/fetch',
      duration: '15 min',
    },
    {
      id: 3,
      title: 'Handling Payment Challenges',
      description: 'Understand and handle errors (insufficient funds, failures, timeouts)',
      duration: '12 min',
    },
    {
      id: 4,
      title: 'Real-World Client Implementation',
      description: 'Build a complete client app with best practices',
      duration: '20 min',
    },
  ],
};

export const clientLessons: Lesson[] = [
  {
    id: 1,
    role: 'client',
    title: 'Understanding the x402 Flow (Client Perspective)',
    description: 'Learn the request → 402 → payment → retry cycle',
    duration: '10 min',
    objectives: [
      'Understand the 402 Payment Required status code',
      'Learn the client-side payment flow',
      'Identify the role of facilitators',
      'Recognize payment headers',
    ],
    sections: [
      {
        type: 'text',
        content: `# The Problem

Traditional APIs are either free or use API keys for authentication. While API keys work well for access control, they're difficult to monetize on a per-request basis. You can't easily charge $0.001 for a single API call.`,
      },
      {
        type: 'text',
        content: `# The x402 Solution

x402 brings programmatic payments directly into the HTTP protocol. Here's how it works:

1. **Client makes a request** to a payment-gated API
2. **Server responds with 402** (Payment Required) and payment details
3. **Client signs the payment** using their wallet
4. **Client sends payment to facilitator** for on-chain settlement
5. **Facilitator settles** the transaction on the blockchain
6. **Facilitator returns proof** of payment
7. **Client retries request** with payment proof in headers
8. **Server verifies proof and returns data**`,
      },
      {
        type: 'callout',
        variant: 'info',
        content: `The beauty of x402 is that it's completely programmatic. No user interaction, no redirect flows, just HTTP requests and cryptocurrency payments working together.`,
      },
    ],
    interactive: {
      type: 'quiz',
      config: {
        question: 'What happens when a client receives a 402 response?',
        options: [
          {
            label: 'Retry the request immediately',
            correct: false,
            explanation: 'No - you need to make a payment first.',
          },
          {
            label: 'Sign a payment, send to facilitator, then retry with proof',
            correct: true,
            explanation: 'Correct! This is the x402 payment flow.',
          },
          {
            label: 'Give up and show an error',
            correct: false,
            explanation: 'No - 402 is a recoverable error with payment.',
          },
          {
            label: 'Ask the user for their credit card',
            correct: false,
            explanation: 'No - x402 uses cryptocurrency, not credit cards.',
          },
        ],
      },
    },
  },
  {
    id: 2,
    role: 'client',
    title: 'Your First x402 Request',
    description: 'Make a successful payment-gated API call using @x402/fetch',
    duration: '15 min',
    objectives: [
      'Install and configure @x402/fetch',
      'Make your first paid API call',
      'Understand what happens behind the scenes',
      'View payment transactions on Base explorer',
    ],
    sections: [
      {
        type: 'text',
        content: `# The Easy Way

The \`@x402/fetch\` library handles the entire payment flow automatically. You just use it like the regular \`fetch()\` function, and it takes care of detecting 402 responses, signing payments, submitting to the facilitator, and retrying with proof.`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `import { createX402Fetch } from '@x402/fetch';
import { usePrivateKey } from '@coinbase/x402';

const fetch402 = createX402Fetch({
  signer: usePrivateKey(process.env.PRIVATE_KEY!),
});

// Use it just like fetch()
const response = await fetch402('https://api.example.com/data');
const data = await response.json();
console.log('Paid and received:', data);`,
      },
    ],
    interactive: {
      type: 'playground',
      config: {
        starterCode: `import { createX402Fetch } from '@x402/fetch';

const fetch402 = createX402Fetch({
  // Pre-configured for you
});

// TODO: Call the test API and log the response
const response = await fetch402('___');
const data = await response.json();
console.log(data);`,
        expectedOutput: '{ message: "Hello! You paid $0.001 for this message." }',
        testEndpoint: '/api/learn/test-hello',
      },
    },
  },
  {
    id: 3,
    role: 'client',
    title: 'Handling Payment Challenges',
    description: 'Understand and handle errors (insufficient funds, failures, timeouts)',
    duration: '12 min',
    objectives: [
      'Identify common payment errors',
      'Implement proper error handling',
      'Check wallet balance before paying',
      'Handle payment failures gracefully',
    ],
    sections: [
      {
        type: 'text',
        content: `# Common Errors

When working with x402 payments, you'll encounter three main types of errors:

- **InsufficientFundsError**: Your wallet doesn't have enough USDC
- **PaymentRejectedError**: The facilitator rejected the payment
- **TimeoutError**: Settlement took too long`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `import { createX402Fetch, InsufficientFundsError, PaymentRejectedError, TimeoutError } from '@x402/fetch';

try {
  const response = await fetch402('https://api.example.com/data');
  const data = await response.json();
} catch (error) {
  if (error instanceof InsufficientFundsError) {
    console.error('Please add USDC to:', error.walletAddress);
  } else if (error instanceof PaymentRejectedError) {
    console.error('Payment rejected:', error.reason);
  } else if (error instanceof TimeoutError) {
    console.error('Payment timed out, please retry');
  } else {
    console.error('Unexpected error:', error);
  }
}`,
      },
    ],
    interactive: {
      type: 'playground',
      config: {
        starterCode: `// This endpoint randomly returns different errors
// TODO: Wrap the API call in try/catch and handle all error types

try {
  const response = await fetch402('/api/learn/test-errors');
  console.log('Success!', await response.json());
} catch (error) {
  // TODO: Handle InsufficientFundsError, PaymentRejectedError, TimeoutError
}`,
        expectedOutput: 'Proper error handling for all three error types',
      },
    },
  },
  {
    id: 4,
    role: 'client',
    title: 'Real-World Client Implementation',
    description: 'Build a complete client app with best practices',
    duration: '20 min',
    objectives: [
      'Implement production-ready error handling',
      'Add retry logic with exponential backoff',
      'Monitor wallet balance',
      'Log payment transactions',
    ],
    sections: [
      {
        type: 'text',
        content: `# Production Checklist

Before deploying your x402 client to production, make sure you:

- Use environment variables for private keys (never commit!)
- Add retry logic with exponential backoff
- Log payment transactions for debugging
- Monitor wallet balance and alert when low
- Cache responses when appropriate`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `import { createX402Fetch } from '@x402/fetch';
import { usePrivateKey } from '@coinbase/x402';

const fetch402 = createX402Fetch({
  signer: usePrivateKey(process.env.X402_PRIVATE_KEY!),
  options: {
    maxRetries: 3,
    timeout: 30000, // 30 seconds
    onPayment: (tx) => {
      console.log(\`Payment sent: \${tx.hash}\`);
    },
  },
});

async function callPaidAPI<T>(url: string): Promise<T> {
  try {
    const response = await fetch402(url);
    if (!response.ok) {
      throw new Error(\`API error: \${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    // Handle errors appropriately
    throw error;
  }
}`,
      },
    ],
    interactive: {
      type: 'exercise',
      config: {
        title: 'Build a CLI tool that calls a paid weather API',
        description: 'Complete the TODOs to create a working CLI tool',
        starterCode: `#!/usr/bin/env node
// TODO: Import dependencies

async function main() {
  // TODO: Set up x402 fetch

  // TODO: Call weather API

  // TODO: Display results

  // TODO: Log payment transaction
}

main();`,
        tests: [
          {
            name: 'Fetches weather data',
            description: 'CLI successfully calls the weather API',
            test: 'expect(output).toContain("temperature")',
          },
          {
            name: 'Logs payment transaction',
            description: 'Transaction hash is logged to console',
            test: 'expect(output).toMatch(/0x[a-fA-F0-9]{64}/)',
          },
        ],
      },
    },
  },
];
