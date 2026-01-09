import { streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getRelevantContext } from '@/lib/rag-search';
import { withX402 } from 'x402-next';
import { facilitator } from '@coinbase/x402';
import { NextRequest, NextResponse } from 'next/server';

const PRICE_PER_PROMPT = '$0.002'; // $0.002 per chat message
const PAYMENT_ADDRESS = (process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS || '0xAbF01df9428EaD5418473A7c91244826A3Af23b3') as `0x${string}`;

/**
 * Chat API with x402 payment ($0.002 per prompt)
 * Uses RAG to answer questions about x402 from the docs
 */
async function chatHandler(request: NextRequest) {
  try {
    // Log payment information (payment is verified before this handler runs)
    // Note: Transaction hash will be in the X-PAYMENT-RESPONSE header after settlement
    const paymentHeader = request.headers.get('X-PAYMENT');
    if (paymentHeader) {
      try {
        const decodedPayment = JSON.parse(Buffer.from(paymentHeader, 'base64').toString('utf-8'));
        console.log('[Chat API] ✓ Payment verified from payer:', decodedPayment.from);
        console.log('[Chat API] Payment details:', {
          to: PAYMENT_ADDRESS,
          network: decodedPayment.network,
          amount: decodedPayment.amount,
          signature: decodedPayment.signature?.slice(0, 20) + '...',
        });
        console.log('[Chat API] Note: Transaction hash will be available in X-PAYMENT-RESPONSE header after settlement');
      } catch (parseError) {
        console.log('[Chat API] Payment header present but could not parse details');
      }
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get the latest user message for RAG search
    const lastMessage = messages[messages.length - 1];

    // Extract text from message parts (v3 API uses parts array)
    let userQuery = '';
    if (lastMessage && lastMessage.role === 'user') {
      if (typeof lastMessage.content === 'string') {
        userQuery = lastMessage.content;
      } else if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
        userQuery = lastMessage.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('');
      }
    }

    console.log('[Chat API] User query:', userQuery);

    // Perform RAG search to get relevant content
    console.log('[Chat API] Searching for relevant context...');
    const relevantContext = await getRelevantContext(userQuery, {
      topK: 10, // Increased from 5 to capture more diverse results (quickstarts, guides, examples)
      minSimilarity: 0.35, // Lowered from 0.45 - "make money"/"charge for" queries have similarity ~0.37-0.38
    });

    console.log('[Chat API] Retrieved context length:', relevantContext.length);

    // Stream response from GPT with RAG context
    const result = streamText({
      model: openai('gpt-4o-mini-2024-07-18'), // Upgraded from gpt-4o-mini - better hallucination prevention
      system: `You are an x402 expert assistant. You help developers understand and implement the x402 payment protocol.

The x402 protocol enables programmatic payments over HTTP using the 402 Payment Required status code. It allows services to charge for API access using cryptocurrency payments (primarily USDC on Base network).

IMPORTANT INSTRUCTIONS:
- Answer questions based ONLY on the provided context from the official x402 documentation
- If the context doesn't contain enough information to answer fully, say so and suggest checking the full documentation
- Be concise but helpful - aim for 2-4 paragraphs unless more detail is explicitly requested
- Never make up information - stick to what's in the documentation

WHEN RESPONDING WITH DOCUMENTATION AND EXAMPLES:
- **CRITICAL**: ONLY include links that are explicitly provided in the context with "Full example:" or "Read more:" prefixes
- **NEVER** create, guess, or hallucinate link URLs - if a link isn't in the context, don't mention it
- Format all links as markdown: [Link text](URL)
- For guides/docs: "For more details, see [Building Miniapps with x402](/content/guide-miniapps)"
- For examples: "Check out the complete [Fetch API Client Example](/content/ts-client-fetch)"
- Prioritize quickstart guides for "getting started" or "how do I" questions
- If you mention a specific resource, ensure the link is actually in the context

RESPONSE FORMAT:
1. Direct answer to the question (1-2 paragraphs)
2. Key information or code snippets from the context
3. Links to relevant documentation (ONLY if provided in context)
4. Links to related examples (ONLY if provided in context)

CONTEXT FROM X402 DOCUMENTATION:

${relevantContext}`,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
    });

    // Return UI message stream response for DefaultChatTransport
    const uiResponse = result.toUIMessageStreamResponse();

    console.log('[Chat API] Response generated, payment settlement will complete after streaming');

    // Convert Response to NextResponse for x402 compatibility
    const response = new NextResponse(uiResponse.body, {
      status: uiResponse.status,
      headers: uiResponse.headers,
    });

    // Note: withX402 will add X-PAYMENT-RESPONSE header with transaction hash after this returns
    return response;
  } catch (error) {
    console.error('[Chat API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Apply x402 payment requirement to POST with CDP facilitator (required for Base mainnet)
export const POST = withX402(
  chatHandler,
  PAYMENT_ADDRESS,
  {
    price: PRICE_PER_PROMPT,
    network: 'base', // Base mainnet
  },
  facilitator as any // CDP facilitator for Base mainnet
);

// Info endpoint
export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'x402 Chat API',
      price: PRICE_PER_PROMPT,
      description: 'Chat with an AI assistant that knows all about x402. Powered by RAG + GPT-4o-mini over the complete x402 documentation.',
      usage: 'Send POST requests with a messages array. Each message costs $0.002 USDC on Base.',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
