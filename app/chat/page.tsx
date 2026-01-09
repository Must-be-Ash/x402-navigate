'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useIsSignedIn, useX402, useCurrentUser } from '@coinbase/cdp-hooks';
import { ChatNavDock, ChatMobileNavDock } from '@/components/nav-dock';
import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, User } from 'lucide-react';

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
    <>
      <div className="min-h-screen bg-slate-50">
        <ChatNavDock />

        {/* Main Chat Container */}
        <main className="mx-auto max-w-5xl px-6 py-8">


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
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 opacity-20 blur-2xl" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-900 shadow-lg">
                      <img
                        src="/logo-white.svg"
                        alt="x402"
                        width={48}
                        height={48}
                      />
                    </div>
                  </div>
                  <div className="space-y-3 max-w-xl">
                    <h2 className="text-3xl font-[family-name:var(--font-jersey-25)] text-slate-900">
                      Ask me anything about x402
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      I'm powered by RAG over the complete x402 documentation. I can help you understand the protocol, find code examples, and guide you through implementation.
                    </p>
                  </div>
                  <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      "How do I start monetizing my API with x402? What are the steps involved?",
                      "How does a server verify payment without trusting the client?",
                      "What's the role of the facilitator in x402? Do I need to use a facilitator or can I do it myself? How do I host my own facilitator?",
                      "Why do I keep getting 402 even after attaching PAYMENT-SIGNATURE? Give me the possible reasons and solutions."
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
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900">
                        <img
                          src="/logo-white.svg"
                          alt="x402"
                          width={16}
                          height={16}
                        />
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900">
                      <img
                        src="/logo-white.svg"
                        alt="x402"
                        width={16}
                        height={16}
                      />
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
                  $0.002 USDC per message
                </p>
              </div>
            </form>
          </div>
        </main>

        {/* Spacer for mobile nav dock */}
        <div className="h-20 sm:h-0" />
      </div>
      <ChatMobileNavDock />
    </>
  );
}
