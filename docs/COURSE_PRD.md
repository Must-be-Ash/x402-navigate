# x402 Learn Platform - Product Requirements Document

## Objective
Create an interactive, role-based learning platform that teaches developers how to implement x402 payment-gated APIs. Users choose their role (Client, Server, or Facilitator) and complete 3-5 bite-sized lessons with live code playgrounds to go from zero to working implementation.

## Goals
- **Speed**: Get users from "What is x402?" to working implementation in 30-60 minutes
- **Clarity**: Each lesson teaches ONE concept with clear explanations + code
- **Interactivity**: Live code playgrounds and exercises for hands-on learning
- **Focus**: Skip basics (wallet setup, TypeScript 101) - assume HTTP/async/crypto knowledge
- **Leverage**: Use existing indexed content (examples, guides) as lesson material

---

## Target Audience

**Prerequisites (assumed)**:
- ✅ HTTP/REST APIs (request/response, status codes, headers)
- ✅ Async programming (Promises, async/await)
- ✅ Basic crypto concepts (wallets, addresses, USDC, blockchain transactions)

**NOT teaching**:
- ❌ Wallet setup (link to CDP docs instead)
- ❌ TypeScript basics
- ❌ General web development

---

## Course Structure

### Landing Page: `/learn`
**Purpose**: Role selection and course overview

**Content**:
- **Hero Section**
  - Headline: "Learn x402 - Choose Your Path"
  - Subtext: "Interactive tutorials to build payment-gated APIs in 30 minutes"

- **What is x402?** (2-3 sentences)
  - "x402 brings programmatic payments to HTTP. Services can charge for API access using cryptocurrency (USDC on Base). It's like Stripe for APIs, but fully on-chain."

- **Choose Your Role** (3 cards)
  1. **Client** - "I want to pay for APIs"
     - Icon: Wallet/Credit Card
     - Description: "Learn to call payment-gated APIs and handle 402 responses"
     - Duration: "4 lessons • ~30 min"
     - Button: "Start Client Path →"

  2. **Server** - "I want to accept payments"
     - Icon: Server/Shield
     - Description: "Learn to protect your API endpoints and accept x402 payments"
     - Duration: "4 lessons • ~40 min"
     - Button: "Start Server Path →"

  3. **Facilitator** - "I want to enable payments"
     - Icon: Network/Hub
     - Description: "Learn to build or host facilitators that power x402 transactions"
     - Duration: "3 lessons • ~25 min"
     - Button: "Start Facilitator Path →"

**UI Elements**:
- Progress indicator: "Not started" for each path (tracks via localStorage)
- "Why x402?" expandable section (link to main docs)
- "Need help?" → link to Discord/Support

---

## Client Path (4 Lessons)

### Lesson 1: Understanding the x402 Flow (Client Perspective)
**Goal**: Understand the request → 402 → payment → retry cycle

**Content**:
1. **The Problem** (1 paragraph)
   - "Traditional APIs: free or API keys. API keys are hard to monetize per-request."

2. **The x402 Solution** (diagram + explanation)
   - Request → Server responds 402 with payment details
   - Client signs payment → Sends to facilitator
   - Facilitator settles on-chain → Returns proof
   - Client retries request with payment proof → Success!

3. **Key Concepts**:
   - `402 Payment Required` status code
   - Payment headers: `X-PAYMENT`, `X-PAYMENT-RESPONSE`
   - Facilitator role

4. **Interactive Element**:
   - Animated flow diagram (step through each stage with "Next" button)
   - Quiz: "What happens when you get a 402 response?" (multiple choice)

**Completion Criteria**: Pass the quiz

---

### Lesson 2: Your First x402 Request
**Goal**: Make a successful payment-gated API call using `@x402/fetch`

**Content**:
1. **The Easy Way** (1 paragraph)
   - "`@x402/fetch` handles the entire flow automatically. Just wrap `fetch()` and go."

2. **Setup** (code block)
   ```typescript
   import { createX402Fetch } from '@x402/fetch';
   import { usePrivateKey } from '@coinbase/x402';

   const fetch402 = createX402Fetch({
     signer: usePrivateKey(process.env.PRIVATE_KEY!),
   });
   ```

3. **Make the Request** (code block)
   ```typescript
   const response = await fetch402('https://api.example.com/data', {
     method: 'GET',
   });

   const data = await response.json();
   console.log('Paid and received:', data);
   ```

4. **What Happened?** (explanation)
   - "Behind the scenes: `@x402/fetch` detected the 402, signed the payment, sent it to the facilitator, waited for settlement, and retried the request with proof. You just used `fetch()`!"

5. **Interactive Element**:
   - **Code Playground**: Pre-configured environment with `@x402/fetch` and a test endpoint
   - **Exercise**: "Call our test API at `https://x402-test.example.com/hello` and log the response"
   - **Expected Output**: `{ message: "Hello! You paid $0.001 for this message." }`
   - Show transaction link on Base explorer after success

**Completion Criteria**: Successfully call the test API and see the response

---

### Lesson 3: Handling Payment Challenges
**Goal**: Understand and handle errors (insufficient funds, payment failures, timeouts)

**Content**:
1. **Common Errors** (table)
   | Error | Cause | Solution |
   |-------|-------|----------|
   | `InsufficientFundsError` | Not enough USDC | Fund wallet with USDC on Base |
   | `PaymentRejectedError` | Facilitator rejected payment | Check payment details in error |
   | `TimeoutError` | Settlement took too long | Retry or increase timeout |

2. **Error Handling Pattern** (code block)
   ```typescript
   try {
     const response = await fetch402('https://api.example.com/data');
     const data = await response.json();
   } catch (error) {
     if (error instanceof InsufficientFundsError) {
       console.error('Please add USDC to your wallet:', error.walletAddress);
     } else if (error instanceof PaymentRejectedError) {
       console.error('Payment rejected:', error.reason);
     } else {
       console.error('Unexpected error:', error);
     }
   }
   ```

3. **Checking Balance Before Paying** (code block)
   ```typescript
   import { getBalance } from '@x402/fetch';

   const balance = await getBalance(walletAddress);
   const price = parseFloat(payment.amount); // from 402 response

   if (balance < price) {
     console.log('Insufficient funds. Please add USDC.');
   }
   ```

4. **Interactive Element**:
   - **Code Playground**: Test endpoint that randomly returns errors
   - **Exercise**: "Wrap the API call in try/catch and handle all three error types"
   - Show different error scenarios (can trigger manually with buttons)

**Completion Criteria**: Handle all three error types correctly in the playground

---

### Lesson 4: Real-World Client Implementation
**Goal**: Build a complete client app with best practices

**Content**:
1. **Production Checklist** (checkboxes)
   - [ ] Use environment variables for private keys (never commit!)
   - [ ] Add retry logic with exponential backoff
   - [ ] Log payment transactions for debugging
   - [ ] Monitor wallet balance and alert when low
   - [ ] Cache responses when appropriate (respecting cache headers)

2. **Complete Example** (code walkthrough)
   ```typescript
   // client.ts - Production-ready x402 client

   import { createX402Fetch } from '@x402/fetch';
   import { usePrivateKey } from '@coinbase/x402';

   // 1. Setup with environment variable
   const fetch402 = createX402Fetch({
     signer: usePrivateKey(process.env.X402_PRIVATE_KEY!),
     options: {
       maxRetries: 3,
       timeout: 30000, // 30 seconds
       onPayment: (tx) => {
         console.log(`Payment sent: ${tx.hash}`);
       },
     },
   });

   // 2. Wrapper with error handling
   async function callPaidAPI<T>(url: string): Promise<T> {
     try {
       const response = await fetch402(url);

       if (!response.ok) {
         throw new Error(`API error: ${response.status}`);
       }

       return await response.json();
     } catch (error) {
       // Handle errors (see Lesson 3)
       throw error;
     }
   }

   // 3. Use it
   const data = await callPaidAPI('https://api.example.com/data');
   ```

3. **Next Steps** (links)
   - [Advanced: Custom facilitators →](#)
   - [Advanced: Payment batching →](#)
   - [Full Client API Reference →](#)

4. **Interactive Element**:
   - **Final Project**: "Build a CLI tool that calls a paid weather API"
   - Starter code provided with TODOs
   - Success: CLI fetches weather and logs payment transaction

**Completion Criteria**: Complete the final project (CLI tool works)

---

## Server Path (4 Lessons)

### Lesson 1: Understanding the x402 Flow (Server Perspective)
**Goal**: Understand how servers enforce payment and verify proof

**Content**:
1. **The Server's Job** (1 paragraph)
   - "Your API needs to: (1) require payment, (2) verify payment proof, (3) only serve data after verification."

2. **The x402 Flow** (diagram + explanation)
   - Client requests → Server checks for payment header
   - No payment? → Respond `402 Payment Required` with payment details
   - Has payment? → Verify signature and settlement → Serve data

3. **Payment Details** (what to include in 402 response)
   ```json
   {
     "to": "0xYourWalletAddress",
     "amount": "0.001",
     "network": "base",
     "facilitator": "https://facilitator.example.com"
   }
   ```

4. **Security Note** (callout box)
   - "⚠️ Always verify payments on-chain or via trusted facilitator. Never trust client-provided payment claims alone."

5. **Interactive Element**:
   - Animated flow diagram (step through server's decision tree)
   - Quiz: "When should you return 402 vs 200?" (multiple choice)

**Completion Criteria**: Pass the quiz

---

### Lesson 2: Protecting Your First Endpoint
**Goal**: Add x402 payment requirement to a Next.js API route

**Content**:
1. **The Easy Way** (1 paragraph)
   - "`withX402()` middleware handles everything. Just wrap your handler."

2. **Setup** (code block - Next.js App Router)
   ```typescript
   // app/api/data/route.ts

   import { withX402 } from 'x402-next';
   import { facilitator } from '@coinbase/x402';

   async function handler(request: Request) {
     // Your API logic here - this only runs if payment succeeded!
     return Response.json({ message: 'You paid for this data!' });
   }

   // Wrap with x402 middleware
   export const GET = withX402(
     handler,
     '0xYourWalletAddress', // Where to receive payments
     {
       price: '$0.001',     // Price per request
       network: 'base',     // Network (Base mainnet)
     },
     facilitator            // CDP facilitator
   );
   ```

3. **What Happened?** (explanation)
   - "`withX402()` intercepts requests. If no payment, returns 402. If payment included, verifies it before calling your handler. You just write normal API code!"

4. **Testing Your Endpoint**:
   ```bash
   # This will return 402
   curl https://localhost:3000/api/data

   # This will work (using x402 client)
   npx @x402/cli call https://localhost:3000/api/data
   ```

5. **Interactive Element**:
   - **Code Playground**: Live Next.js environment
   - **Exercise**: "Create an endpoint at `/api/joke` that returns a random joke for $0.001"
   - Can test with built-in x402 client simulator
   - Shows payment flow logs in sidebar

**Completion Criteria**: Create the `/api/joke` endpoint and successfully call it

---

### Lesson 3: Verifying and Settling Payments
**Goal**: Understand payment verification and settlement

**Content**:
1. **Two-Step Payment** (diagram)
   - **Step 1: Verification** - Check signature is valid (fast, off-chain)
   - **Step 2: Settlement** - Submit to blockchain and confirm (slow, on-chain)

2. **How `withX402()` Handles This**:
   ```
   Request arrives with payment
   ↓
   1. Verify signature (instant)
   ✓ Valid? Continue. ✗ Invalid? Return 402.
   ↓
   2. Send to facilitator for settlement
   ↓
   3. Facilitator submits on-chain
   ↓
   4. Wait for confirmation (or accept async)
   ↓
   5. Return response with X-PAYMENT-RESPONSE header
   ```

3. **Payment Response Headers** (explanation)
   ```typescript
   // The response includes settlement details
   X-PAYMENT-RESPONSE: <base64 encoded>

   // Decoded:
   {
     "success": true,
     "transaction": "0xabc123...",
     "network": "base",
     "payer": "0xdef456..."
   }
   ```

4. **Logging Payments** (code example)
   ```typescript
   export const GET = withX402(
     async (request: Request) => {
       // Access payment info from headers
       const paymentHeader = request.headers.get('X-PAYMENT');
       if (paymentHeader) {
         const payment = JSON.parse(atob(paymentHeader));
         console.log('Received payment from:', payment.from);
       }

       return Response.json({ data: 'your data' });
     },
     '0xYourWalletAddress',
     { price: '$0.001', network: 'base' },
     facilitator
   );
   ```

5. **Interactive Element**:
   - **Live Demo**: Make a paid request to test endpoint
   - See real-time logs: signature verification → facilitator call → on-chain settlement
   - View transaction on Base explorer
   - **Exercise**: "Add logging to your `/api/joke` endpoint from Lesson 2"

**Completion Criteria**: Successfully log payment details in the playground

---

### Lesson 4: Production-Ready Setup
**Goal**: Deploy a production x402 API with best practices

**Content**:
1. **Production Checklist** (checkboxes)
   - [ ] Use environment variables for wallet addresses
   - [ ] Set up error handling for payment failures
   - [ ] Add rate limiting (prevent abuse)
   - [ ] Monitor wallet balance (withdraw funds regularly)
   - [ ] Log all transactions for accounting
   - [ ] Set appropriate timeouts
   - [ ] Add health check endpoint (free, no payment)

2. **Environment Setup** (`.env.local`)
   ```bash
   # Receiving wallet address
   NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS=0xYourAddress

   # Facilitator (optional, defaults to CDP)
   X402_FACILITATOR_URL=https://facilitator.coinbase.com
   ```

3. **Error Handling** (code example)
   ```typescript
   export const POST = withX402(
     async (request: Request) => {
       try {
         // Your API logic
         return Response.json({ success: true });
       } catch (error) {
         console.error('API error:', error);
         return Response.json(
           { error: 'Internal server error' },
           { status: 500 }
         );
       }
     },
     process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS!,
     { price: '$0.01', network: 'base' },
     facilitator
   );
   ```

4. **Rate Limiting** (code example with `@upstash/ratelimit`)
   ```typescript
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '10 s'),
   });

   export const GET = withX402(
     async (request: Request) => {
       const paymentHeader = request.headers.get('X-PAYMENT');
       const payer = JSON.parse(atob(paymentHeader!)).from;

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
   );
   ```

5. **Monitoring Payments** (snippet)
   ```typescript
   // Track payments in your database
   await db.payments.create({
     payer: payment.from,
     amount: payment.amount,
     transaction: settlementTx,
     timestamp: new Date(),
   });
   ```

6. **Next Steps** (links)
   - [Advanced: Custom pricing logic →](#)
   - [Advanced: Subscription models →](#)
   - [Full Server API Reference →](#)

7. **Interactive Element**:
   - **Final Project**: "Build a paid API that returns AI-generated content"
   - Starter Next.js app provided
   - TODOs: Add x402, rate limiting, logging
   - Success: Deploy to Vercel and call from client

**Completion Criteria**: Complete the final project (API deployed and working)

---

## Facilitator Path (3 Lessons)

### Lesson 1: What is a Facilitator?
**Goal**: Understand the facilitator's role in x402

**Content**:
1. **The Problem** (1 paragraph)
   - "Clients and servers are on different chains/wallets. Someone needs to settle payments on-chain. That's the facilitator."

2. **Facilitator Responsibilities** (numbered list)
   1. **Accept payment requests** from clients
   2. **Verify signatures** (ensure payment is valid)
   3. **Submit transactions** to blockchain (settle on-chain)
   4. **Return proof** to client (transaction hash)
   5. **Handle failures** (insufficient funds, network issues)

3. **How It Works** (diagram)
   ```
   Client → Signs payment locally (off-chain)
   ↓
   Facilitator → Receives signed payment
   ↓
   Facilitator → Submits to blockchain (on-chain)
   ↓
   Blockchain → Confirms transaction
   ↓
   Facilitator → Returns proof to client
   ↓
   Client → Includes proof in retry request
   ```

4. **Two Options** (comparison table)
   | Use Existing Facilitator | Build Your Own |
   |--------------------------|----------------|
   | ✅ Coinbase CDP (recommended) | ⚙️ Custom logic/fees |
   | ✅ No setup required | 🔧 Full control |
   | ✅ Production-ready | 🚀 Optimized for your use case |
   | 🌐 Public/shared | 🔒 Private/dedicated |

5. **When to Build Your Own**:
   - [ ] You need custom fee structures
   - [ ] You want to support non-standard chains
   - [ ] You need compliance/regulatory features
   - [ ] You're building a high-volume service

6. **Interactive Element**:
   - Animated flow diagram (step through facilitator's process)
   - Quiz: "What does the facilitator return to the client?" (multiple choice)

**Completion Criteria**: Pass the quiz

---

### Lesson 2: Using an Existing Facilitator (CDP)
**Goal**: Configure clients and servers to use Coinbase CDP facilitator

**Content**:
1. **Why Use CDP?** (callout box)
   - "✅ Production-ready, maintained by Coinbase"
   - "✅ Supports Base mainnet (USDC)"
   - "✅ Free to use (you only pay gas fees)"
   - "✅ No setup required"

2. **Client Setup** (code block)
   ```typescript
   import { createX402Fetch } from '@x402/fetch';
   import { usePrivateKey, facilitator } from '@coinbase/x402';

   const fetch402 = createX402Fetch({
     signer: usePrivateKey(process.env.PRIVATE_KEY!),
     facilitator, // ← Uses CDP facilitator
   });
   ```

3. **Server Setup** (code block)
   ```typescript
   import { withX402 } from 'x402-next';
   import { facilitator } from '@coinbase/x402';

   export const GET = withX402(
     handler,
     '0xYourWallet',
     { price: '$0.001', network: 'base' },
     facilitator // ← Uses CDP facilitator
   );
   ```

4. **That's It!** (explanation)
   - "CDP handles all the complexity: signature verification, on-chain settlement, retries, monitoring. You just import `facilitator` and pass it in."

5. **Monitoring Transactions**:
   ```typescript
   // CDP returns transaction details in headers
   const response = await fetch402('https://api.example.com');
   const paymentResponse = response.headers.get('X-PAYMENT-RESPONSE');

   if (paymentResponse) {
     const decoded = JSON.parse(atob(paymentResponse));
     console.log('Transaction hash:', decoded.transaction);
     console.log('View on Base:', `https://basescan.org/tx/${decoded.transaction}`);
   }
   ```

6. **Interactive Element**:
   - **Live Demo**: Make a payment through CDP facilitator
   - See real-time logs: client request → CDP verifies → submits to Base → returns proof
   - View transaction on Basescan
   - **Exercise**: "Build a simple paid API using CDP facilitator (client + server)"

**Completion Criteria**: Successfully build and test a paid API with CDP

---

### Lesson 3: Building Your Own Facilitator
**Goal**: Understand how to implement a custom facilitator

**Content**:
1. **Facilitator Interface** (TypeScript definition)
   ```typescript
   interface Facilitator {
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
   }

   interface PaymentAcceptance {
     accepted: boolean;
     paymentId: string;
     reason?: string; // If rejected
   }

   interface SettlementProof {
     success: boolean;
     transaction: string; // Transaction hash
     network: string;
     payer: string;
   }
   ```

2. **Implementation Outline** (high-level steps)
   ```typescript
   class CustomFacilitator implements Facilitator {
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
   }
   ```

3. **Key Considerations** (checklist)
   - [ ] **Security**: Verify all signatures, never trust client input
   - [ ] **Gas fees**: Who pays? (facilitator, payer, receiver?)
   - [ ] **Retries**: Handle failed transactions, network issues
   - [ ] **Monitoring**: Log all payments for debugging
   - [ ] **Rate limiting**: Prevent spam/abuse
   - [ ] **Database**: Store payment records for auditing

4. **Using Your Facilitator** (code block)
   ```typescript
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
   );
   ```

5. **Next Steps** (links)
   - [Example: Complete facilitator implementation →](#) (link to example in indexed content)
   - [Advanced: Multi-chain facilitators →](#)
   - [Full Facilitator API Reference →](#)

6. **Interactive Element**:
   - **Code Walkthrough**: Step through a complete facilitator implementation
   - Show key methods with inline explanations
   - **Exercise**: "Implement the `verifySignature()` method" (code playground with tests)

**Completion Criteria**: Complete the `verifySignature()` exercise

---

## Technical Implementation Checklist

### Phase 1: Setup & Infrastructure
- [x] **Create `/learn` route structure**
  - [x] `/app/learn/page.tsx` - Landing page with role selection
  - [x] `/app/learn/client/page.tsx` - Client path hub
  - [x] `/app/learn/server/page.tsx` - Server path hub
  - [x] `/app/learn/facilitator/page.tsx` - Facilitator path hub
  - [x] `/app/learn/[role]/lesson-[id]/page.tsx` - Dynamic lesson pages

- [x] **Create progress tracking system**
  - [x] `/lib/progress-tracker.ts` - localStorage-based progress tracking
  - [x] Track completion per lesson: `{ client: [1, 2], server: [], facilitator: [] }`
  - [x] Helper functions: `markLessonComplete()`, `getLessonProgress()`, `resetProgress()`
  - [x] React hook: `useProgress()` for components

- [x] **Set up lesson data structure**
  - [x] `/lib/lessons/` directory for lesson content
  - [x] `/lib/lessons/client.ts` - Client lesson data
  - [x] `/lib/lessons/server.ts` - Server lesson data
  - [x] `/lib/lessons/facilitator.ts` - Facilitator lesson data
  - [x] `/lib/lessons/types.ts` - TypeScript types for lessons
  ```typescript
  interface Lesson {
    id: string;
    role: 'client' | 'server' | 'facilitator';
    title: string;
    duration: string; // "10 min"
    objectives: string[];
    content: string; // MDX content
    interactive?: InteractiveElement;
    quiz?: Quiz;
    exercise?: Exercise;
  }
  ```

- [x] **Add navigation to main site**
  - [x] Update header/nav to include "Learn" link
  - [x] Add icon (GraduationCap from lucide-react)
  - [x] Position between "Discovery" and "Chat"

### Phase 2: Landing Page (`/learn`)
- [x] **Hero Section**
  - [x] Headline + subtext
  - [x] Gradient background (match existing brand)
  - [ ] Animated "payment flow" visualization (optional - future)

- [x] **"What is x402?" Section**
  - [x] 2-3 sentence explanation
  - [x] Expandable "Learn more" (link to docs)
  - [ ] Maybe: 30-second video explainer (future)

- [x] **Role Selection Cards**
  - [x] 3 cards: Client, Server, Facilitator
  - [x] Each card shows:
    - [x] Icon (Wallet, Server, Network)
    - [x] Role name + description
    - [x] Duration ("4 lessons • ~30 min")
    - [x] Progress indicator (e.g., "2/4 complete")
    - [x] "Start" or "Continue" button
  - [x] Cards are interactive/hoverable
  - [x] Click → navigate to `/learn/client` (etc.)

- [x] **Footer**
  - [x] "Need help?" → Discord link
  - [x] "Read the docs" → Main docs link

### Phase 3: Role Hub Pages
Create hub pages for each role: `/learn/client`, `/learn/server`, `/learn/facilitator`

- [x] **Client Hub** (`/app/learn/client/page.tsx`)
  - [x] Header: "Client Path - Pay for APIs"
  - [x] Progress: "2/4 lessons complete"
  - [x] Lesson list (4 cards)
  - [x] Each card shows:
    - [x] Lesson number + title
    - [x] Duration ("10 min")
    - [x] Status icon (complete ✓, locked 🔒, available ▶️)
    - [x] "Start Lesson" button
  - [x] Locked lessons until previous is complete
  - [x] "Back to Learn" link

- [x] **Server Hub** (`/app/learn/server/page.tsx`)
  - [x] Same structure as Client Hub
  - [x] 4 lessons

- [x] **Facilitator Hub** (`/app/learn/facilitator/page.tsx`)
  - [x] Same structure as Client/Server
  - [x] 3 lessons

### Phase 4: Lesson Pages (Dynamic Route)
Create dynamic route: `/app/learn/[role]/lesson-[id]/page.tsx`

- [x] **Lesson Page Structure**
  - [x] Breadcrumb: Learn > Client > Lesson 1
  - [x] Lesson title + duration
  - [x] Progress indicator: "Lesson 1 of 4"
  - [ ] Content area (needs lesson content rendering)
  - [ ] Interactive elements (needs Quiz/Playground/Exercise components)
  - [x] "Mark as Complete" button (bottom)
  - [x] Navigation: "← Previous Lesson" | "Next Lesson →"

- [x] **Content Rendering** (Phase 5 - COMPLETE)
  - [ ] Use MDX for rich content (future enhancement)
  - [ ] Syntax highlighting for code (future - currently using simple pre/code)
  - [x] Custom components:
    - [x] `<Callout>` - Info/warning/success boxes
    - [x] `<CodeBlock>` - Enhanced code snippets with copy button
    - [ ] `<Diagram>` - SVG flow diagrams (future)
    - [x] `<Quiz>` - Multiple choice quizzes
    - [x] `<Playground>` - Interactive code playgrounds
    - [x] `<Exercise>` - Code exercises with tests

### Phase 5: Interactive Elements

#### Component 1: Quiz
- [x] **Quiz Component** (`/components/learn/Quiz.tsx`)
  - [x] Multiple choice questions
  - [x] Radio buttons for answers
  - [x] "Submit Answer" button
  - [x] Correct/incorrect feedback
  - [x] "Try Again" on wrong answer
  - [x] "Continue" on correct answer
  - [x] Marks lesson as complete when passed
  - [ ] Example:
  ```typescript
  <Quiz
    question="What happens when you get a 402 response?"
    options={[
      { label: "Retry immediately", correct: false },
      { label: "Sign payment and retry", correct: true },
      { label: "Give up", correct: false },
    ]}
    onComplete={() => markLessonComplete('client', 1)}
  />
  ```

#### Component 2: Code Playground
- [x] **Playground Component** (`/components/learn/Playground.tsx`)
  - [x] Code editor (textarea, can upgrade to Monaco later)
  - [x] "Run Code" button
  - [x] Output panel (console logs, errors, success messages)
  - [ ] Pre-configured with x402 environment (backend needed):
    - [ ] Test API endpoint (e.g., `https://x402-test.discovery.site/api/hello`)
    - [ ] Mock wallet (pre-funded with test USDC)
    - [ ] `@x402/fetch` already imported
  - [ ] Show transaction details on success (hash, link to explorer)
  - [x] Handle errors gracefully
  - [ ] Example:
  ```typescript
  <Playground
    starterCode={`
      import { createX402Fetch } from '@x402/fetch';

      const fetch402 = createX402Fetch({ ... });

      // TODO: Call the test API
      const response = await fetch402('...');
    `}
    expectedOutput="Hello! You paid $0.001 for this message."
    onSuccess={() => markLessonComplete('client', 2)}
  />
  ```

- [ ] **Backend for Playground**
  - [ ] Test API endpoint: `/api/learn/test-endpoint`
  - [ ] Returns simple JSON response
  - [ ] Costs $0.001 (real x402 payment)
  - [ ] Logs payment for debugging
  - [ ] Maybe: Return fun messages based on lesson

#### Component 3: Exercise
- [x] **Exercise Component** (`/components/learn/Exercise.tsx`)
  - [x] Similar to Playground but with TODOs/tests
  - [x] Show checklist of requirements
  - [x] "Run Tests" button
  - [x] Pass/fail for each test
  - [x] Mark complete when all tests pass
  - [ ] Example:
  ```typescript
  <Exercise
    title="Build a CLI tool that calls a paid weather API"
    starterCode={cliStarterCode}
    tests={[
      { name: "Calls weather API", test: testWeatherAPI },
      { name: "Logs payment transaction", test: testLogging },
    ]}
    onComplete={() => markLessonComplete('client', 4)}
  />
  ```

### Phase 6: Content Creation
Leverage indexed content from RAG system:

- [x] **Client Lesson 1: Understanding the x402 Flow**
  - [x] Write content (overview, flow explanation, quiz)
  - [ ] Create animated flow diagram (SVG or canvas) - future enhancement
  - [x] Create quiz (4 questions with explanations)

- [x] **Client Lesson 2: Your First x402 Request**
  - [x] Write lesson content with code examples
  - [x] Create Playground component instance
  - [x] Create test endpoint (`/api/learn/test-hello`)

- [x] **Client Lesson 3: Handling Payment Challenges**
  - [x] Write explanation of common errors
  - [x] Create Playground with simulated errors
  - [x] Create test endpoint (`/api/learn/test-errors`)

- [x] **Client Lesson 4: Real-World Client Implementation**
  - [x] Write best practices checklist
  - [x] Create final Exercise (CLI tool)
  - [x] Provide starter code with TODOs

- [x] **Server Lesson 1: Understanding the x402 Flow**
  - [x] Write content (server perspective)
  - [x] Create quiz

- [x] **Server Lesson 2: Protecting Your First Endpoint**
  - [x] Write lesson content with code examples
  - [x] Create Playground instance
  - [x] Exercise: Build `/api/joke` endpoint

- [x] **Server Lesson 3: Verifying and Settling Payments**
  - [x] Write explanation of two-step payment
  - [x] Create Playground instance
  - [x] Exercise: Add logging to endpoint

- [x] **Server Lesson 4: Production-Ready Setup**
  - [x] Write best practices checklist
  - [x] Create final Exercise (AI content API)
  - [x] Provide starter code with TODOs

- [x] **Facilitator Lesson 1: What is a Facilitator?**
  - [x] Write content (facilitator role)
  - [x] Create comparison table (CDP vs custom)
  - [x] Create quiz

- [x] **Facilitator Lesson 2: Using CDP Facilitator**
  - [x] Write setup instructions (client + server)
  - [x] Create Playground instance
  - [x] Exercise: Build simple paid API with CDP

- [x] **Facilitator Lesson 3: Building Your Own**
  - [x] Write high-level implementation guide
  - [x] Show interface definition
  - [x] Exercise: Implement `verifySignature()` method

### Phase 7: Design & Polish
- [ ] **Design System**
  - [ ] Match existing brand colors (blue gradient, etc.)
  - [ ] Consistent spacing/typography
  - [ ] Dark mode support
  - [ ] Responsive (mobile, tablet, desktop)

- [ ] **Animations**
  - [ ] Page transitions (smooth fade-in)
  - [ ] Progress bar animations
  - [ ] Interactive diagram animations
  - [ ] Celebration on lesson completion (confetti?)

- [ ] **Accessibility**
  - [ ] Keyboard navigation (tab through lessons)
  - [ ] Screen reader labels
  - [ ] High contrast mode
  - [ ] Focus indicators

- [ ] **Performance**
  - [ ] Code splitting (lazy load lessons)
  - [ ] Optimize images/diagrams
  - [ ] Preload next lesson
  - [ ] Fast page transitions

### Phase 8: Testing & QA
- [ ] **Functionality Testing**
  - [ ] Test all lesson navigation
  - [ ] Test progress tracking (localStorage)
  - [ ] Test quizzes (correct/incorrect flows)
  - [ ] Test playgrounds (run code, see output)
  - [ ] Test exercises (pass/fail tests)
  - [ ] Test completion flow (mark as complete)

- [ ] **Content Testing**
  - [ ] Review all lesson content for accuracy
  - [ ] Test all code examples (ensure they work)
  - [ ] Verify links to docs/examples
  - [ ] Check for typos/grammar

- [ ] **Cross-browser Testing**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

- [ ] **Mobile Testing**
  - [ ] Responsive layouts
  - [ ] Touch interactions
  - [ ] Code playgrounds on mobile (maybe read-only?)

### Phase 9: Launch
- [ ] **Documentation**
  - [ ] Update main README (mention /learn)
  - [ ] Add "Learn x402" section to homepage
  - [ ] Update nav/sitemap

- [ ] **Analytics**
  - [ ] Track lesson starts
  - [ ] Track lesson completions
  - [ ] Track time spent per lesson
  - [ ] Track completion rates (which lessons drop off?)

- [ ] **Marketing**
  - [ ] Announce on Discord
  - [ ] Tweet about launch
  - [ ] Add to docs landing page

- [ ] **Feedback Loop**
  - [ ] Add "Was this helpful?" buttons
  - [ ] Add "Report issue" links
  - [ ] Monitor Discord for feedback
  - [ ] Iterate based on user feedback

---

## Content Sources (Leverage Indexed Content)

Use RAG system to extract content from existing examples:

### Client Lessons
- **Query**: "TypeScript client example"
- **Sources**:
  - `examples/typescript/clients/fetch/README.md`
  - `examples/typescript/clients/axios/README.md`
  - `examples/typescript/clients/advanced/README.md`

### Server Lessons
- **Query**: "Next.js server example"
- **Sources**:
  - `examples/typescript/servers/nextjs/README.md`
  - `examples/typescript/servers/express/README.md`
  - `examples/typescript/servers/hono/README.md`

### Facilitator Lessons
- **Query**: "facilitator implementation"
- **Sources**:
  - `examples/typescript/facilitators/` (if exists)
  - CDP facilitator docs

### Error Handling
- **Query**: "error handling examples"
- **Sources**: Any examples showing try/catch, InsufficientFundsError, etc.

### Production Patterns
- **Query**: "production best practices"
- **Sources**: Advanced examples, guides on deployment/monitoring

---

## Success Metrics

### Engagement
- [ ] **Lesson start rate**: % of visitors who start a lesson
  - Target: >40%
- [ ] **Lesson completion rate**: % who complete at least 1 lesson
  - Target: >60%
- [ ] **Path completion rate**: % who complete all lessons in a path
  - Target: >30%

### Learning Outcomes
- [ ] **Time to completion**: Average time to finish a path
  - Target: 30-60 min (as designed)
- [ ] **Quiz pass rate**: % who pass quizzes on first try
  - Target: >70% (if lower, questions are too hard)
- [ ] **Exercise completion rate**: % who complete final exercises
  - Target: >50%

### Quality
- [ ] **User satisfaction**: "Was this helpful?" rating
  - Target: >80% positive
- [ ] **Feedback volume**: # of reports/suggestions
  - Monitor for common issues
- [ ] **Return rate**: % who come back to learn more
  - Target: >20%

---

## Future Enhancements (Post-MVP)

- [ ] **Video lessons**: Record screencast versions of each lesson
- [ ] **Certificates**: Issue completion certificates (NFT?)
- [ ] **Advanced courses**: Deep dives on specific topics
- [ ] **Community features**: Share progress, ask questions
- [ ] **Multi-language support**: Translate content to Spanish, Chinese, etc.
- [ ] **Code in multiple languages**: Add Go, Python examples
- [ ] **Live coding sessions**: Scheduled workshops with experts
- [ ] **Leaderboard**: Gamify completion (fastest learners, etc.)

---

## Open Questions

- [ ] Should lessons lock until previous is complete, or allow skipping?
  - Recommendation: Allow skipping (let users choose their pace)

- [ ] Should we add a "Start from scratch" option to reset progress?
  - Recommendation: Yes, add to settings/profile

- [ ] Should playground run code client-side (sandboxed) or server-side?
  - Recommendation: Server-side for security (use isolated containers)

- [ ] Should we track anonymous analytics or require sign-in?
  - Recommendation: Anonymous with localStorage (respect privacy)

- [ ] Should we add social features (share progress, compare with friends)?
  - Recommendation: Post-MVP (keep it simple for now)

---

## Priority Order (Implementation Sequence)

### Week 1: Foundation
1. Phase 1: Setup & Infrastructure
2. Phase 2: Landing Page

### Week 2: Core Content
3. Phase 3: Role Hub Pages
4. Phase 4: Lesson Pages (structure only, no content yet)
5. Phase 5: Interactive Elements (Quiz + basic Playground)

### Week 3: Content Creation
6. Phase 6: Write all lesson content (leverage indexed examples)
7. Create test endpoints for playgrounds

### Week 4: Polish & Launch
8. Phase 7: Design & Polish
9. Phase 8: Testing & QA
10. Phase 9: Launch

---

## File Structure

```
/app
  /learn
    page.tsx                    # Landing page (role selection)
    layout.tsx                  # Shared layout for /learn
    /client
      page.tsx                  # Client hub
      /lesson-1
        page.tsx                # Lesson 1
      /lesson-2
        page.tsx                # Lesson 2
      ...
    /server
      page.tsx                  # Server hub
      /lesson-1
        page.tsx
      ...
    /facilitator
      page.tsx                  # Facilitator hub
      /lesson-1
        page.tsx
      ...
  /api
    /learn
      /test-hello
        route.ts                # Test endpoint for playgrounds
      /test-joke
        route.ts
      /playground
        route.ts                # Execute playground code

/components
  /learn
    Quiz.tsx                    # Quiz component
    Playground.tsx              # Code playground
    Exercise.tsx                # Exercise with tests
    LessonCard.tsx              # Lesson card (hub pages)
    ProgressBar.tsx             # Progress indicator
    Callout.tsx                 # Info/warning boxes
    Diagram.tsx                 # Flow diagrams

/lib
  /lessons
    types.ts                    # Lesson types
    client.ts                   # Client lesson data
    server.ts                   # Server lesson data
    facilitator.ts              # Facilitator lesson data
  progress-tracker.ts           # Progress tracking (localStorage)

/content
  /learn
    /client
      lesson-1.mdx              # Lesson content (MDX)
      lesson-2.mdx
      ...
    /server
      lesson-1.mdx
      ...
    /facilitator
      lesson-1.mdx
      ...
```

---

## Notes

- **Leverage RAG**: Use existing indexed content for code examples - don't rewrite!
- **Keep it simple**: MVP focuses on core learning experience, no fancy features yet
- **Mobile-first**: Many developers learn on tablets/phones
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Lessons should load in <1s
- **Analytics**: Track everything (starts, completions, time, drop-offs) to improve

---

## End of PRD

This document serves as the complete blueprint for the x402 Learn platform. Refer to this checklist throughout implementation to ensure we build everything as planned.
