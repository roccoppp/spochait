"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export default function SpotichatPage() {
  const { data: session, status: authStatus } = useSession();
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    await sendMessage({ text: trimmed });
    
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="w-full border-b border-white/5 bg-black/30 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--accent)]" />
            <span className="text-lg font-semibold">Spotichat</span>
          </div>
          <div className="flex items-center gap-3">
            {authStatus === "authenticated" ? (
              <>
                <span className="text-sm text-[var(--muted)]">{session?.user?.email}</span>
                <button className="btn" onClick={() => signOut()}>Sign out</button>
              </>
            ) : (
              <button
                className="btn btn-accent"
                onClick={() => signIn("spotify")}
              >
                Connect Spotify
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero / container */}
      <main className="mx-auto w-full max-w-5xl px-4 py-6 flex-1 grid grid-rows-[auto_1fr_auto] gap-4">
        {/* Title */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chat about your music</h1>
            <p className="text-sm text-[var(--muted)]">Ask anything about tracks, playlists, and artists.</p>
          </div>
        </div>

        {/* Chat panel */}
        <section className="surface rounded-xl p-4 border border-white/5 min-h-[60vh] flex flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="h-full grid place-items-center text-center text-[var(--muted)]">
                Say hi to start chatting.
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="flex gap-3">
                  <div
                    className={`mt-1 h-6 w-6 rounded-full ${
                      m.role === "user" ? "bg-[var(--accent)]" : "bg-[#3b3b3b]"
                    }`}
                  />
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      {m.role}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.parts?.map((part, idx) => (
                        part.type === "text" ? <span key={idx}>{part.text}</span> : null
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
            <input
              className="input"
              placeholder="Message Spotichat"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status === "streaming"}
            />
            <button className="btn btn-accent" disabled={status === "streaming" || !input.trim()}>
              {status === "streaming" ? "Sending…" : "Send"}
            </button>
          </form>
        </section>
      </main>
      <footer className="mx-auto w-full max-w-5xl px-4 py-6 text-xs text-[var(--muted)]">
        Built with Next.js and AI SDK
      </footer>
    </div>
  );
}
