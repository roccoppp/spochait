import { tool } from 'ai';
import { z } from 'zod';
import SpotifyWebApi from 'spotify-web-api-node';

type GetAccessToken = () => Promise<string | undefined> | string | undefined;

/**
 * Factory that creates the listPlaylists tool bound to a getAccessToken provider.
 * Returns an AI SDK tool that lists the current user's playlists with id and name.
 */
export function listPlaylists(getAccessToken: GetAccessToken) {
  return tool({
    description: 'List the current user\'s Spotify playlists (id and name).',
    inputSchema: z
      .object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .describe('Max number of playlists to return (1-50).')
          .default(20)
          .optional(),
        offset: z
          .number()
          .int()
          .min(0)
          .describe('Index of the first playlist to return.')
          .default(0)
          .optional(),
      })
      .describe('Optional pagination parameters.'),
    execute: async ({ limit = 20, offset = 0 }) => {
      const token = await Promise.resolve(
        typeof getAccessToken === 'function' ? getAccessToken() : undefined,
      );

      if (!token) {
        throw new Error('Missing Spotify access token. Please authenticate.');
      }

      const spotifyApi = new SpotifyWebApi();
      spotifyApi.setAccessToken(token);

      const response = await spotifyApi.getUserPlaylists({ limit, offset });
      const items = response.body?.items ?? [];

      return items.map((p: any) => ({ id: p?.id, name: p?.name }));
    },
  });
}


