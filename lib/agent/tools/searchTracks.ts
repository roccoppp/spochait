import { tool } from 'ai';
import { z } from 'zod';
import SpotifyWebApi from 'spotify-web-api-node';

type GetAccessToken = () => Promise<string | undefined> | string | undefined;

/**
 * Factory that creates the searchTracks tool bound to a getAccessToken provider.
 * Enables searching for tracks to retrieve IDs and disambiguating metadata.
 */
export function searchTracks(getAccessToken: GetAccessToken) {
  return tool({
    description:
      'Search for Spotify tracks by one or multiple queries and return trackids plus key metadata (artists, album, duration). Access the track IDs with this tool. has fuzzy search capabilities',
    inputSchema: z
      .object({
        query: z
          .string()
          .min(1)
          .describe(
            'Single search query, e.g. "Blinding Lights" or "track:Yellow artist:Coldplay".'
          )
          .optional(),
        queries: z
          .array(z.string().min(1))
          .min(1)
          .describe('Multiple search queries to run in parallel.')
          .optional(),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .describe('Max number of tracks to return (1-50).')
          .default(5)
          .optional(),
        offset: z
          .number()
          .int()
          .min(0)
          .describe('Index of the first track to return.')
          .default(0)
          .optional(),
        market: z
          .string()
          .regex(/^[A-Za-z]{2}$/)
          .describe('Optional ISO 3166-1 alpha-2 country code (e.g., US).')
          .optional(),
      })
      .refine((data) => Boolean(data.query) || (Array.isArray(data.queries) && data.queries.length > 0), {
        message: 'Provide either a single query or one or more queries.',
        path: ['query'],
      })
      .describe('Track search parameters.'),
    execute: async ({ query, queries, limit = 5, offset = 0, market }) => {
      const token = await Promise.resolve(
        typeof getAccessToken === 'function' ? getAccessToken() : undefined,
      );

      if (!token) {
        throw new Error('Missing Spotify access token. Please authenticate.');
      }

      const spotifyApi = new SpotifyWebApi();
      spotifyApi.setAccessToken(token);

      const mapTrack = (t: SpotifyApi.TrackObjectFull) => ({
        id: t.id,
        uri: t.uri,
        name: t.name,
        artists: t.artists.map((a) => ({ id: a.id, name: a.name })),
        album: {
          id: t.album.id,
          name: t.album.name,
          images: t.album.images,
        },
        durationMs: t.duration_ms,
        explicit: t.explicit,
        popularity: t.popularity,
        previewUrl: t.preview_url ?? null,
        releaseDate: t.album.release_date,
      });

      // Multiple queries: run searches in parallel and group results by query
      if (queries && queries.length > 0) {
        const responses = await Promise.all(
          queries.map((q) => spotifyApi.searchTracks(q, { limit, offset, market })),
        );

        const resultsByQuery = responses.map((resp, idx) => {
          const items = (resp.body.tracks?.items ?? []) as SpotifyApi.TrackObjectFull[];
          return {
            query: queries[idx]!,
            results: items.map(mapTrack),
          };
        });

        return { resultsByQuery };
      }

      // Single query behavior (backwards compatible): return flat array of tracks
      const response = await spotifyApi.searchTracks(query as string, { limit, offset, market });
      const items = (response.body.tracks?.items ?? []) as SpotifyApi.TrackObjectFull[];
      return items.map(mapTrack);
    },
  });
}


