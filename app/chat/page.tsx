'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useIsSignedIn, useX402, useCurrentUser } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react';
import { WalletDropdown } from '@/components/WalletDropdown';
import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, Wallet, Loader2, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Helper to extract text content from UIMessage parts
function getMessageContent(message: any): string {
  if (!message.parts) return '';
  return message.parts
    .filter((part: any) => part.type === 'text' || part.type === 'reasoning')
    .map((part: any) => part.text)
    .join('');
}

export default function ChatPage() {
  const { isSignedIn } = useIsSignedIn();
  const { currentUser } = useCurrentUser();
  const { fetchWithPayment } = useX402();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Log wallet info when it changes
  useEffect(() => {
    if (isSignedIn && currentUser) {
      const smartAccount = currentUser.evmSmartAccounts?.[0];
      const eoa = currentUser.evmAccounts?.[0];

      if (smartAccount) {
        console.log('[Chat Page] Smart Account (pays for transactions):', smartAccount);
        console.log('[Chat Page] EOA (owner):', eoa);
      } else {
        console.log('[Chat Page] EOA:', eoa);
      }
      console.log('[Chat Page] User ID:', currentUser.userId);
    }
  }, [isSignedIn, currentUser]);

  // Wrap fetchWithPayment to log transaction details from response headers
  const fetchWithLogging = async (url: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetchWithPayment(url as any, init);

    // Log payment response header if present (contains transaction hash after settlement)
    const paymentResponse = response.headers.get('X-PAYMENT-RESPONSE');
    if (paymentResponse) {
      try {
        const decoded = JSON.parse(atob(paymentResponse));
        if (decoded.success && decoded.transaction) {
          console.log('[Chat Page] ✓ Payment settled on-chain!');
          console.log('[Chat Page] Transaction hash:', decoded.transaction);
          console.log('[Chat Page] Network:', decoded.network);
          console.log('[Chat Page] Payer:', decoded.payer);
        }
      } catch (e) {
        console.log('[Chat Page] Could not parse payment response header');
      }
    }

    return response;
  };

  // Use Vercel AI SDK's useChat hook with x402 payment via CDP's useX402 hook
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: fetchWithLogging as typeof fetch,
    }),
  });

  // Manual input handlers for v3 API
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'ready') return;

    sendMessage({ text: input });
    setInput('');
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Discovery</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">x402 Assistant</h1>
                  <p className="text-xs text-slate-500">AI-powered documentation expert</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                <Wallet className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-xs font-medium text-slate-700">$0.01/message</span>
              </div>
              <WalletDropdown />
              {!isSignedIn && <AuthButton />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Container */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Wallet Connection Banner */}
        {!isSignedIn && (
          <div className="mb-6 overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm">
            <div className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-base font-semibold text-slate-900">
                  Connect Your Wallet
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  Connect your wallet to start chatting with the x402 assistant. Each message costs $0.01 USDC on Base mainnet.
                </p>
                <div className="pt-2">
                  <AuthButton />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div
          className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          style={{ height: 'calc(100vh - 240px)', minHeight: '600px' }}
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center space-y-8 py-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 blur-2xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Bot className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="space-y-3 max-w-xl">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Ask me anything about x402
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600">
                    I'm powered by RAG over the complete x402 documentation. I can help you understand the protocol, find code examples, and guide you through implementation.
                  </p>
                </div>
                <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    "What is x402 and how does it work?",
                    "Show me a TypeScript client example",
                    "How do I accept payments with Next.js?",
                    "What is the Bazaar discovery layer?"
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="group text-left rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                    >
                      <span className="font-medium">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-5 py-4 shadow-sm ${message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                        : 'bg-slate-50 text-slate-900 border border-slate-100'
                      }`}>
                      <div className="prose prose-sm max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-p:first:mt-0 prose-p:last:mb-0">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="my-3 space-y-1.5 list-disc list-inside">{children}</ul>,
                            ol: ({ children }) => <ol className="my-3 space-y-1.5 list-decimal list-inside">{children}</ol>,
                            li: ({ children }) => <li className="ml-2">{children}</li>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className={`px-1.5 py-0.5 rounded font-mono text-xs ${message.role === 'user'
                                    ? 'bg-blue-700/50 text-blue-50'
                                    : 'bg-slate-200 text-slate-800'
                                  }`}>
                                  {children}
                                </code>
                              ) : (
                                <code className={`block p-3 rounded-lg font-mono text-xs overflow-x-auto ${message.role === 'user'
                                    ? 'bg-blue-700/30 text-blue-50'
                                    : 'bg-slate-200 text-slate-900'
                                  }`}>
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children }) => <pre className="my-3">{children}</pre>,
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`font-medium underline underline-offset-2 transition-colors ${message.role === 'user' ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-700'
                                  }`}
                              >
                                {children}
                              </a>
                            ),
                            h1: ({ children }) => <h1 className="text-lg font-semibold mt-4 mb-2 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-semibold mt-4 mb-2 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-2 first:mt-0">{children}</h3>,
                          }}
                        >
                          {getMessageContent(message)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}

              {(status === 'submitted' || status === 'streaming') && (
                <div className="flex gap-4 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">
                    <strong>Error:</strong> {error.message}
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-5"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={isSignedIn ? "Ask about x402..." : "Connect wallet to chat..."}
                disabled={!isSignedIn || status !== 'ready'}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={!isSignedIn || status !== 'ready' || !input.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
              >
                {status !== 'ready' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <p className="text-xs text-slate-500">
                Powered by RAG + GPT-4o-mini
              </p>
              <span className="text-xs text-slate-300">•</span>
              <p className="text-xs text-slate-500">
                $0.01 USDC per message on Base
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
