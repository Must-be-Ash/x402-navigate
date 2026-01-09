import { NextResponse } from 'next/server';

/**
 * Test endpoint for Learn playground - error handling exercises
 * Randomly returns different error types to help students practice error handling
 *
 * NOTE: In production, this would be protected with withX402()
 * For learning purposes, we're keeping it open
 */
export async function GET() {
  // Randomly choose an error type (or success)
  const random = Math.random();

  if (random < 0.25) {
    // Simulate success
    return NextResponse.json({
      message: 'Success! Request completed.',
      success: true,
    });
  } else if (random < 0.5) {
    // Simulate insufficient funds error
    return NextResponse.json(
      {
        error: 'InsufficientFundsError',
        message: 'Wallet does not have enough USDC',
        walletAddress: '0x1234567890abcdef',
      },
      { status: 400 }
    );
  } else if (random < 0.75) {
    // Simulate payment rejected error
    return NextResponse.json(
      {
        error: 'PaymentRejectedError',
        message: 'Payment was rejected by the facilitator',
        reason: 'Invalid signature',
      },
      { status: 402 }
    );
  } else {
    // Simulate timeout error
    return NextResponse.json(
      {
        error: 'TimeoutError',
        message: 'Payment settlement timed out',
      },
      { status: 408 }
    );
  }
}
