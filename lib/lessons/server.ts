/**
 * Server Path Lessons
 *
 * Lesson data for the Server learning path
 */

import type { Lesson, CourseData } from './types';

export const serverCourse: CourseData = {
  role: 'server',
  title: 'Server Path',
  description: 'Learn to protect your API endpoints and accept x402 payments',
  totalDuration: '~40 min',
  lessons: [
    {
      id: 1,
      title: 'Understanding the x402 Flow (Server Perspective)',
      description: 'Learn how servers enforce payment and verify proof',
      duration: '10 min',
    },
    {
      id: 2,
      title: 'Protecting Your First Endpoint',
      description: 'Add x402 payment requirement to a Next.js API route',
      duration: '15 min',
    },
    {
      id: 3,
      title: 'Verifying and Settling Payments',
      description: 'Understand payment verification and settlement',
      duration: '12 min',
    },
    {
      id: 4,
      title: 'Production-Ready Setup',
      description: 'Deploy a production x402 API with best practices',
      duration: '20 min',
    },
  ],
};

export const serverLessons: Lesson[] = [
  {
    id: 1,
    role: 'server',
    title: 'Understanding the x402 Flow (Server Perspective)',
    description: 'Learn how servers enforce payment and verify proof',
    duration: '10 min',
    objectives: [
      'Understand the server\'s role in x402',
      'Learn what payment details to include in 402 responses',
      'Understand payment verification',
      'Recognize security considerations',
    ],
    sections: [
      {
        type: 'text',
        content: `# The Server's Job

As a server implementing x402, your job is to:

1. **Require payment** for protected endpoints
2. **Verify payment proof** when provided
3. **Only serve data** after successful verification

This ensures you get paid for every API call.`,
      },
      {
        type: 'text',
        content: `# The x402 Flow from Server Perspective

1. Client requests your API
2. You check for payment header
3. **No payment?** → Respond with 402 and payment details
4. **Has payment?** → Verify signature and settlement
5. **Valid payment?** → Serve the data
6. **Invalid payment?** → Respond with 402 again`,
      },
      {
        type: 'code',
        language: 'json',
        content: `{
  "to": "0xYourWalletAddress",
  "amount": "0.001",
  "network": "base",
  "facilitator": "https://facilitator.coinbase.com"
}`,
      },
      {
        type: 'callout',
        variant: 'warning',
        content: `**Security Note**: Always verify payments on-chain or via a trusted facilitator. Never trust client-provided payment claims alone.`,
      },
    ],
    interactive: {
      type: 'quiz',
      config: {
        question: 'When should you return a 402 response?',
        options: [
          {
            label: 'Always, for every request',
            correct: false,
            explanation: 'No - only when payment is required and not provided.',
          },
          {
            label: 'When the request has no payment header, or payment verification fails',
            correct: true,
            explanation: 'Correct! Return 402 when payment is missing or invalid.',
          },
          {
            label: 'Never, just check the payment and serve data',
            correct: false,
            explanation: 'No - clients need the 402 response to know they must pay.',
          },
          {
            label: 'Only on the first request',
            correct: false,
            explanation: 'No - return 402 whenever payment is required and not valid.',
          },
        ],
      },
    },
  },
  {
    id: 2,
    role: 'server',
    title: 'Protecting Your First Endpoint',
    description: 'Add x402 payment requirement to a Next.js API route',
    duration: '15 min',
    objectives: [
      'Install and configure x402-next',
      'Protect an API route with withX402()',
      'Test the protected endpoint',
      'Understand what happens behind the scenes',
    ],
    sections: [
      {
        type: 'text',
        content: `# The Easy Way

The \`withX402()\` middleware handles everything for you. Just wrap your API handler and it will:

- Intercept incoming requests
- Check for payment headers
- Return 402 if no payment
- Verify payment if provided
- Call your handler only after successful payment`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// app/api/data/route.ts
import { withX402 } from 'x402-next';
import { facilitator } from '@coinbase/x402';

async function handler(request: Request) {
  // This only runs if payment succeeded!
  return Response.json({ message: 'You paid for this data!' });
}

export const GET = withX402(
  handler,
  '0xYourWalletAddress',
  {
    price: '$0.001',
    network: 'base',
  },
  facilitator
);`,
      },
      {
        type: 'text',
        content: `# Testing Your Endpoint

You can test the endpoint with cURL or the x402 CLI:`,
      },
      {
        type: 'code',
        language: 'bash',
        content: `# This will return 402
curl https://localhost:3000/api/data

# This will work (using x402 client)
npx @x402/cli call https://localhost:3000/api/data`,
      },
    ],
    interactive: {
      type: 'playground',
      config: {
        starterCode: `// TODO: Create an endpoint at /api/joke that returns a random joke for $0.001

import { withX402 } from 'x402-next';
import { facilitator } from '@coinbase/x402';

async function handler(request: Request) {
  const jokes = [
    "Why did the x402 cross the road? To get paid!",
    "What's a blockchain's favorite HTTP status? 402!",
    "Why do APIs love x402? Because they get paid to work!"
  ];

  // TODO: Return a random joke
}

export const GET = withX402(
  handler,
  // TODO: Add your wallet address and price
);`,
        expectedOutput: 'Working /api/joke endpoint that requires payment',
      },
    },
  },
  {
    id: 3,
    role: 'server',
    title: 'Verifying and Settling Payments',
    description: 'Understand payment verification and settlement',
    duration: '12 min',
    objectives: [
      'Understand two-step payment (verification + settlement)',
      'Learn how withX402() handles verification',
      'Access payment details in your handler',
      'Log transactions for accounting',
    ],
    sections: [
      {
        type: 'text',
        content: `# Two-Step Payment

x402 payments happen in two steps:

**Step 1: Verification** (off-chain, instant)
- Check that the signature is valid
- Ensure payment details match requirements

**Step 2: Settlement** (on-chain, takes a few seconds)
- Submit transaction to blockchain
- Wait for confirmation
- Return proof to client`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `export const GET = withX402(
  async (request: Request) => {
    // Access payment info from headers
    const paymentHeader = request.headers.get('X-PAYMENT');
    if (paymentHeader) {
      const payment = JSON.parse(atob(paymentHeader));
      console.log('Received payment from:', payment.from);
      console.log('Amount:', payment.amount);
    }

    return Response.json({ data: 'your data' });
  },
  '0xYourWalletAddress',
  { price: '$0.001', network: 'base' },
  facilitator
);`,
      },
      {
        type: 'callout',
        variant: 'info',
        content: `The response will include an \`X-PAYMENT-RESPONSE\` header with the transaction hash after settlement completes.`,
      },
    ],
    interactive: {
      type: 'playground',
      config: {
        starterCode: `// TODO: Add logging to your /api/joke endpoint

// Log who paid, how much, and the transaction hash
`,
        expectedOutput: 'Payment details logged to console',
        hint: {
          explanation: `To complete this exercise, you need to:

1. Use \`withX402()\` to wrap your handler function - this is required for the test to pass
2. Access the payment information from the \`X-PAYMENT\` header in your request handler
3. Parse the base64-encoded payment header using \`JSON.parse(atob(paymentHeader))\`
4. Log the payment details: who paid (\`payment.from\`), how much (\`payment.amount\`), and optionally the transaction hash

The payment header contains all the payment information that was sent by the client. You can access it using \`request.headers.get('X-PAYMENT')\` and then decode it to get the payment object.`,
          solutionCode: `import { withX402 } from 'x402-next';
import { facilitator } from '@coinbase/x402';

const jokes = [
  "Why did the x402 cross the road? To get paid!",
  "What's a blockchain's favorite HTTP status? 402!",
  "Why do APIs love x402? Because they get paid to work!"
];

async function handler(request: Request) {
  // Access payment info from headers
  const paymentHeader = request.headers.get('X-PAYMENT');
  if (paymentHeader) {
    const payment = JSON.parse(atob(paymentHeader));
    console.log('Received payment from:', payment.from);
    console.log('Amount:', payment.amount);
    // Transaction hash is available after settlement in X-PAYMENT-RESPONSE header
  }

  // Return a random joke
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  return Response.json({ joke: randomJoke });
}

export const GET = withX402(
  handler,
  '0xYourWalletAddress',
  { price: '$0.001', network: 'base' },
  facilitator
);`,
        },
      },
    },
  },
  {
    id: 4,
    role: 'server',
    title: 'Production-Ready Setup',
    description: 'Deploy a production x402 API with best practices',
    duration: '20 min',
    objectives: [
      'Use environment variables for configuration',
      'Implement error handling',
      'Add rate limiting',
      'Monitor wallet balance',
      'Log transactions for accounting',
    ],
    sections: [
      {
        type: 'text',
        content: `# Production Checklist

Before deploying to production:

- Use environment variables for wallet addresses
- Set up error handling for payment failures
- Add rate limiting to prevent abuse
- Monitor wallet balance (withdraw funds regularly)
- Log all transactions for accounting
- Set appropriate timeouts
- Add health check endpoint (free, no payment)`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export const GET = withX402(
  async (request: Request) => {
    const paymentHeader = request.headers.get('X-PAYMENT');
    const payer = JSON.parse(atob(paymentHeader!)).from;

    // Rate limit by payer address
    const { success } = await ratelimit.limit(payer);
    if (!success) {
      return Response.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Serve data
    return Response.json({ data: '...' });
  },
  process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS!,
  { price: '$0.001', network: 'base' },
  facilitator
);`,
      },
    ],
    interactive: {
      type: 'exercise',
      config: {
        title: 'Build a paid API that returns AI-generated content',
        description: 'Deploy a production-ready x402 API with all best practices',
        starterCode: `// TODO: Complete this production API
// Requirements:
// - x402 payment protection
// - Rate limiting
// - Error handling
// - Transaction logging
// - AI content generation

export const POST = withX402(
  async (request: Request) => {
    // TODO: Implement
  },
  // TODO: Configuration
);`,
        tests: [
          {
            name: 'Requires payment',
            description: 'Returns 402 without payment',
            test: 'expect(response.status).toBe(402)',
          },
          {
            name: 'Rate limits payers',
            description: 'Rejects excessive requests',
            test: 'expect(response.status).toBe(429)',
          },
          {
            name: 'Returns AI content',
            description: 'Generates and returns content after payment',
            test: 'expect(response.data).toBeDefined()',
          },
        ],
      },
    },
  },
];
