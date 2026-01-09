import { NextResponse } from 'next/server';

/**
 * Test endpoint for Learn playground exercises
 * Returns a simple greeting message
 *
 * NOTE: In production, this would be protected with withX402()
 * For learning purposes, we're keeping it open so playgrounds can test without payments
 */
export async function GET() {
  return NextResponse.json({
    message: 'Hello! You successfully called the test API.',
    timestamp: new Date().toISOString(),
    success: true,
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'Hello from POST! Your test submission was received.',
    timestamp: new Date().toISOString(),
    success: true,
  });
}
