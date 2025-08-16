"use client";
import { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import LandingPage from "./components/LandingPage";

export default function SpotichatPage() {
  const { data: session, status: authStatus } = useSession();
  const [input, setInput] = useState("");
  const sessionIdRef = useRef<string>("");
  
  // Generate a new session ID on each page load
  useEffect(() => {
    sessionIdRef.current = crypto.randomUUID();
  }, []);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { 
          messages, 
          sessionId: sessionIdRef.current 
        }
      })
    }),
  });

  // Clear messages on component mount to ensure fresh session
  useEffect(() => {
    setMessages([]);
  }, [setMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    await sendMessage({ text: trimmed });
    
  };

  // Show loading while checking authentication
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="surface-card">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid var(--brand-500)', borderTopColor: 'transparent' }}></div>
            <span style={{ color: 'var(--content)' }}>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (authStatus === "unauthenticated") {
    return <LandingPage />;
  }

  // Show chat page if authenticated
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-lg" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', opacity: '0.8' }}>
        <div className="container-app">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: 'var(--accent)', boxShadow: `0 0 0 2px var(--accent)`, opacity: '0.2' }} />
              <span className="heading-lg" style={{ color: 'var(--content)' }}>Spotichat</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:block" style={{ color: 'var(--content-muted)' }}>
                {session?.user?.email}
              </span>
              <button 
                className="btn btn-secondary"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 section-padding">
        <div className="container-app">
          <div className="grid gap-6 md:gap-8">
            
            {/* Header */}
            <div className="motion-safe-animate-fade-in">
              <h1 className="heading-lg mb-2" style={{ color: 'var(--content)' }}>Chat about your music</h1>
              <p className="body-text">Ask anything about tracks, playlists, and artists.</p>
            </div>

            {/* Chat Panel */}
            <div className="motion-safe-animate-scale-in">
              <section className="surface min-h-[70vh] flex flex-col card-padding">
                
                {/* Messages */}
                <div className="flex-1 space-y-6 overflow-y-auto pr-2 mb-6">
                  {messages.length === 0 ? (
                    <div className="h-full grid place-items-center text-center">
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--surface-hover)' }}>
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--content-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p style={{ color: 'var(--content-muted)' }}>Say hi to start chatting about your music.</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((m, index) => (
                      <div 
                        key={m.id} 
                        className={`flex gap-4 motion-safe-animate-fade-in`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                          style={m.role === "user" 
                            ? { backgroundColor: 'var(--accent)', color: 'white' } 
                            : { backgroundColor: 'var(--surface-hover)', color: 'var(--content-muted)' }
                          }
                        >
                          {m.role === "user" ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--content-muted)' }}>
                            {m.role === "user" ? "You" : "Assistant"}
                          </div>
                          <div className="leading-relaxed" style={{ color: 'var(--content)' }}>
                            {m.parts?.map((part, idx) => (
                              part.type === "text" ? <span key={idx}>{part.text}</span> : null
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSubmit} className="flex items-end gap-3">
                  <div className="flex-1">
                    <input
                      className="input"
                      placeholder="Message Spotichat..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={status === "streaming"}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={status === "streaming" || !input.trim()}
                  >
                    {status === "streaming" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Sending</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span className="hidden sm:inline">Send</span>
                      </div>
                    )}
                  </button>
                </form>
                
              </section>
            </div>
            
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="py-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container-app">
          <p className="text-sm text-center" style={{ color: 'var(--content-muted)' }}>
            Built with Next.js and AI SDK
          </p>
        </div>
      </footer>
    </div>
  );
}
