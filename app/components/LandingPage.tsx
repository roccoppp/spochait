"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center section-padding">
        <div className="container-app">
          <div className="grid gap-8 md:gap-12 text-center max-w-2xl mx-auto">
            
            {/* Logo Section */}
            <div className="motion-safe-animate-fade-in">
              <div className="relative inline-block">
                <div className="surface-card w-32 h-32 md:w-40 md:h-40 mx-auto flex items-center justify-center mb-6">
                  <Image
                    src="/favicon.ico"
                    alt="Spotichat Logo"
                    width={80}
                    height={80}
                    className="w-20 h-20"
                  />
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className="motion-safe-animate-fade-in space-y-4">
              <h1 className="heading-xl" style={{ color: 'var(--content)' }}>
                Spotichat
              </h1>
              
              <p className="body-text text-xl md:text-2xl text-center">
                 Chat about songs and artists and modify your Spotify playlists with AI.
              </p>
            </div>

            {/* CTA Section */}
            <div className="motion-safe-animate-scale-in">
              <button
                onClick={() => signIn("spotify")}
                className="btn btn-primary text-lg group"
                style={{ padding: '1rem 2rem' }}
              >
                Connect to Spotify
              </button>
              
              <p className="text-sm mt-4" style={{ color: 'var(--content-muted)' }}>
                OAuth authentication • No data stored
              </p>
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
