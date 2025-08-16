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
                    src="/spotify-logo.svg"
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
                Chat about your music with AI. Connect your Spotify account to unlock personalized music conversations.
              </p>
            </div>

            {/* CTA Section */}
            <div className="motion-safe-animate-scale-in">
              <button
                onClick={() => signIn("spotify")}
                className="btn btn-primary text-lg group"
                style={{ padding: '1rem 2rem' }}
              >
                <svg
                  className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.455c-.193 0-.384-.094-.5-.264-.188-.275-.113-.65.162-.838 1.706-1.169 2.776-3.144 2.776-5.353 0-2.209-1.07-4.184-2.776-5.353-.275-.188-.35-.563-.162-.838.188-.275.563-.35.838-.162C17.944 5.169 19.5 7.444 19.5 12s-1.556 6.831-3.062 8.617c-.106.15-.275.238-.438.238-.119 0-.244-.044-.338-.1zm-2.162-.994c-.156 0-.319-.069-.431-.206-.206-.256-.162-.631.094-.837.981-.794 1.537-1.981 1.537-3.418s-.556-2.624-1.537-3.418c-.256-.206-.3-.581-.094-.837.206-.256.581-.3.837-.094C15.744 8.294 16.5 10.069 16.5 12s-.756 3.706-2.194 4.849c-.113.094-.256.137-.406.137zm-2.4-1.218c-.125 0-.256-.044-.356-.137-.219-.206-.231-.556-.025-.775.5-.531.775-1.237.775-1.962s-.275-1.431-.775-1.962c-.206-.219-.194-.569.025-.775.219-.206.569-.194.775.025.719.769 1.125 1.781 1.125 2.712s-.406 1.943-1.125 2.712c-.106.112-.244.162-.419.162z"/>
                </svg>
                Connect to Spotify
              </button>
              
              <p className="text-sm mt-4" style={{ color: 'var(--content-muted)' }}>
                Secure OAuth authentication • No data stored
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
