import type { NextAuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const scopes = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
].join(' ');

async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: String(token.refreshToken ?? ''),
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) {
      throw refreshed;
    }

    return {
      ...token,
      accessToken: refreshed.access_token as string,
      // expires_in is seconds
      expiresAt: Date.now() + Number(refreshed.expires_in) * 1000,
      refreshToken: (refreshed.refresh_token as string | undefined) ?? token.refreshToken,
      error: undefined,
    } as Record<string, unknown>;
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    } as Record<string, unknown>;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent(scopes)}`,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account && account.access_token) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          // expires_in is seconds
          expiresAt: Date.now() + Number(account.expires_in ?? 3600) * 1000,
        } as Record<string, unknown>;
      }

      // Return previous token if the access token has not expired yet
      if (typeof token.expiresAt === 'number' && Date.now() < token.expiresAt) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token as Record<string, unknown>);
    },
    async session({ session, token }) {
      type MutableSession = typeof session & {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
      };
      const mutable = session as MutableSession;
      if (typeof token.accessToken === 'string') mutable.accessToken = token.accessToken;
      if (typeof token.refreshToken === 'string') mutable.refreshToken = token.refreshToken;
      if (typeof token.expiresAt === 'number') mutable.expiresAt = token.expiresAt;
      return session;
    },
  },
};


