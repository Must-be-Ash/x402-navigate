/**
 * Facilitator Path Lessons
 *
 * Lesson data for the Facilitator learning path
 */

import type { Lesson, CourseData } from './types';

export const facilitatorCourse: CourseData = {
  role: 'facilitator',
  title: 'Facilitator Path',
  description: 'Learn to build or host facilitators that power x402 transactions',
  totalDuration: '~25 min',
  lessons: [
    {
      id: 1,
      title: 'What is a Facilitator?',
      description: "Understand the facilitator's role in x402",
      duration: '8 min',
    },
    {
      id: 2,
      title: 'Using an Existing Facilitator (CDP)',
      description: 'Configure clients and servers to use Coinbase CDP facilitator',
      duration: '10 min',
    },
    {
      id: 3,
      title: 'Building Your Own Facilitator',
      description: 'Understand how to implement a custom facilitator',
      duration: '15 min',
    },
  ],
};

export const facilitatorLessons: Lesson[] = [
  {
    id: 1,
    role: 'facilitator',
    title: 'What is a Facilitator?',
    description: "Understand the facilitator's role in x402",
    duration: '8 min',
    objectives: [
      'Understand what facilitators do',
      'Learn the facilitator responsibilities',
      'Know when to use existing vs custom facilitators',
      'Recognize the settlement process',
    ],
    sections: [
      {
        type: 'text',
        content: `# The Problem

Clients and servers are on different chains/wallets. Someone needs to settle payments on-chain and provide proof. That's the facilitator.`,
      },
      {
        type: 'text',
        content: `# Facilitator Responsibilities

1. **Accept payment requests** from clients
2. **Verify signatures** (ensure payment is valid)
3. **Submit transactions** to blockchain (settle on-chain)
4. **Return proof** to client (transaction hash)
5. **Handle failures** (insufficient funds, network issues)`,
      },
      {
        type: 'callout',
        variant: 'info',
        content: `Think of facilitators as the payment processors of x402. Just like Stripe processes credit card payments, facilitators process cryptocurrency payments for x402.`,
      },
      {
        type: 'text',
        content: `# Two Options

**Use Existing Facilitator (Recommended)**
- Coinbase CDP facilitator
- No setup required
- Production-ready
- Free to use (you only pay gas fees)

**Build Your Own**
- Custom logic/fees
- Full control
- Optimized for your use case
- Private/dedicated infrastructure`,
      },
    ],
    interactive: {
      type: 'quiz',
      config: {
        question: 'What does the facilitator return to the client after settlement?',
        options: [
          {
            label: 'The private key',
            correct: false,
            explanation: 'No - facilitators never share private keys.',
          },
          {
            label: 'Transaction hash (proof of payment)',
            correct: true,
            explanation: 'Correct! The facilitator returns the on-chain transaction hash as proof.',
          },
          {
            label: 'The API response data',
            correct: false,
            explanation: 'No - that comes from the API server, not the facilitator.',
          },
          {
            label: 'Nothing',
            correct: false,
            explanation: 'No - facilitators must provide proof of settlement.',
          },
        ],
      },
    },
  },
  {
    id: 2,
    role: 'facilitator',
    title: 'Using an Existing Facilitator (CDP)',
    description: 'Configure clients and servers to use Coinbase CDP facilitator',
    duration: '10 min',
    objectives: [
      'Understand why CDP is recommended',
      'Configure clients to use CDP',
      'Configure servers to use CDP',
      'Monitor transactions through CDP',
    ],
    sections: [
      {
        type: 'callout',
        variant: 'success',
        content: `**Why Use CDP?**

- Production-ready, maintained by Coinbase
- Supports Base mainnet (USDC)
- Free to use (you only pay gas fees)
- No setup required`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// Client setup
import { createX402Fetch } from '@x402/fetch';
import { usePrivateKey, facilitator } from '@coinbase/x402';

const fetch402 = createX402Fetch({
  signer: usePrivateKey(process.env.PRIVATE_KEY!),
  facilitator, // ← Uses CDP facilitator
});`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// Server setup
import { withX402 } from 'x402-next';
import { facilitator } from '@coinbase/x402';

export const GET = withX402(
  handler,
  '0xYourWallet',
  { price: '$0.001', network: 'base' },
  facilitator // ← Uses CDP facilitator
);`,
      },
      {
        type: 'text',
        content: `# That's It!

CDP handles all the complexity: signature verification, on-chain settlement, retries, monitoring. You just import \`facilitator\` and pass it in.`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// Monitoring transactions
const response = await fetch402('https://api.example.com');
const paymentResponse = response.headers.get('X-PAYMENT-RESPONSE');

if (paymentResponse) {
  const decoded = JSON.parse(atob(paymentResponse));
  console.log('Transaction hash:', decoded.transaction);
  console.log('View on Base:', \`https://basescan.org/tx/\${decoded.transaction}\`);
}`,
      },
    ],
    interactive: {
      type: 'playground',
      config: {
        starterCode: `// TODO: Build a simple paid API using CDP facilitator
// Create both client and server code

// Client:
import { createX402Fetch } from '@x402/fetch';

// Server:
import { withX402 } from 'x402-next';

// Test it!
`,
        expectedOutput: 'Working client + server using CDP facilitator',
      },
    },
  },
  {
    id: 3,
    role: 'facilitator',
    title: 'Building Your Own Facilitator',
    description: 'Understand how to implement a custom facilitator',
    duration: '15 min',
    objectives: [
      'Understand the facilitator interface',
      'Learn the implementation steps',
      'Recognize key security considerations',
      'Know how to integrate custom facilitators',
    ],
    sections: [
      {
        type: 'text',
        content: `# Facilitator Interface

A facilitator must implement three core methods:

1. **acceptPayment()** - Verify and accept payment requests
2. **settlePayment()** - Submit transaction on-chain
3. **getPaymentStatus()** - Check payment status`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `interface Facilitator {
  // Accept payment request from client
  acceptPayment(payment: SignedPayment): Promise<PaymentAcceptance>;

  // Settle payment on-chain
  settlePayment(paymentId: string): Promise<SettlementProof>;

  // Check payment status
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

interface SignedPayment {
  from: string;      // Payer address
  to: string;        // Receiver address
  amount: string;    // Amount in USDC
  network: string;   // 'base'
  signature: string; // Signed by payer
}`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `class CustomFacilitator implements Facilitator {
  async acceptPayment(payment: SignedPayment): Promise<PaymentAcceptance> {
    // 1. Verify signature
    const isValid = await this.verifySignature(payment);
    if (!isValid) {
      return { accepted: false, reason: 'Invalid signature' };
    }

    // 2. Check payer has sufficient funds (optional)
    const balance = await this.getBalance(payment.from);
    if (balance < parseFloat(payment.amount)) {
      return { accepted: false, reason: 'Insufficient funds' };
    }

    // 3. Store payment request
    const paymentId = await this.storePayment(payment);

    return { accepted: true, paymentId };
  }

  async settlePayment(paymentId: string): Promise<SettlementProof> {
    // 1. Retrieve payment
    const payment = await this.getPayment(paymentId);

    // 2. Submit to blockchain
    const tx = await this.submitTransaction(payment);

    // 3. Wait for confirmation
    await this.waitForConfirmation(tx.hash);

    return {
      success: true,
      transaction: tx.hash,
      network: payment.network,
      payer: payment.from,
    };
  }
}`,
      },
      {
        type: 'text',
        content: `# Key Considerations

When building a custom facilitator:

- **Security**: Verify all signatures, never trust client input
- **Gas fees**: Decide who pays (facilitator, payer, receiver?)
- **Retries**: Handle failed transactions, network issues
- **Monitoring**: Log all payments for debugging
- **Rate limiting**: Prevent spam/abuse
- **Database**: Store payment records for auditing`,
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// Using your custom facilitator
import { CustomFacilitator } from './facilitator';

const myFacilitator = new CustomFacilitator({
  rpcUrl: process.env.BASE_RPC_URL,
  privateKey: process.env.FACILITATOR_PRIVATE_KEY,
});

// Use in client
const fetch402 = createX402Fetch({
  signer: usePrivateKey(process.env.PRIVATE_KEY!),
  facilitator: myFacilitator,
});

// Use in server
export const GET = withX402(
  handler,
  '0xYourWallet',
  { price: '$0.001', network: 'base' },
  myFacilitator
);`,
      },
    ],
    interactive: {
      type: 'exercise',
      config: {
        title: 'Implement the verifySignature() method',
        description: 'Complete the signature verification logic',
        starterCode: `import { verifyMessage } from 'ethers';

class CustomFacilitator {
  async verifySignature(payment: SignedPayment): Promise<boolean> {
    // TODO: Implement signature verification
    // 1. Reconstruct the message that was signed
    // 2. Recover the signer address from signature
    // 3. Verify it matches payment.from

    return false; // TODO: Return true if valid
  }
}`,
        tests: [
          {
            name: 'Verifies valid signatures',
            description: 'Returns true for correctly signed payments',
            test: 'expect(await verifySignature(validPayment)).toBe(true)',
          },
          {
            name: 'Rejects invalid signatures',
            description: 'Returns false for incorrectly signed payments',
            test: 'expect(await verifySignature(invalidPayment)).toBe(false)',
          },
        ],
      },
    },
  },
];
