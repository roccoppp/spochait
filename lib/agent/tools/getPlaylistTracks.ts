import { tool } from 'ai';
import { z } from 'zod';
import SpotifyWebApi from 'spotify-web-api-node';

type GetAccessToken = () => Promise<string | undefined> | string | undefined;

/**
 * Factory that creates the getPlaylistTracks tool bound to a getAccessToken provider.
 * Returns the tracks in a specific Spotify playlist with detailed track information.
 */
export function getPlaylistTracks(getAccessToken: GetAccessToken) {
  return tool({
    description: 'Get tracks from a specific Spotify playlist by playlist ID. Returns detailed track information including artists, album, duration, and other metadata. Use this tool to examine playlist contents after getting playlist IDs from listPlaylists. The limit parameter controls how many tracks to return (1-100, default 20). For large playlists, use the offset parameter to paginate through tracks - increase offset by the limit value to get the next batch (e.g., first call: limit=20 offset=0, second call: limit=20 offset=20).',
    inputSchema: z
      .object({
        playlistId: z
          .string()
          .min(1)
          .describe('The Spotify playlist ID to get tracks from.'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .describe('Max number of tracks to return (1-100).')
          .default(20)
          .optional(),
        offset: z
          .number()
          .int()
          .min(0)
          .describe('Index of the first track to return.')
          .default(0)
          .optional(),
      })
      .describe('Playlist tracks retrieval parameters.'),
    execute: async ({ playlistId, limit = 20, offset = 0 }) => {
      const token = await Promise.resolve(
        typeof getAccessToken === 'function' ? getAccessToken() : undefined,
      );

      if (!token) {
        throw new Error('Missing Spotify access token. Please authenticate.');
      }

      const spotifyApi = new SpotifyWebApi();
      spotifyApi.setAccessToken(token);

      const response = await spotifyApi.getPlaylistTracks(playlistId, { limit, offset });
      const items = (response.body?.items ?? []) as SpotifyApi.PlaylistTrackObject[];

      const mapTrack = (playlistTrack: SpotifyApi.PlaylistTrackObject) => {
        const track = playlistTrack.track as SpotifyApi.TrackObjectFull;
        return {
          id: track.id,
          uri: track.uri,
          name: track.name,
          artists: track.artists.map((a) => ({ id: a.id, name: a.name })),
          album: {
            id: track.album.id,
            name: track.album.name,
            images: track.album.images,
          },
          durationMs: track.duration_ms,
          explicit: track.explicit,
          popularity: track.popularity,
          previewUrl: track.preview_url ?? null,
          releaseDate: track.album.release_date,
          addedAt: playlistTrack.added_at,
          addedBy: playlistTrack.added_by?.id,
        };
      };

      return {
        playlistId,
        total: response.body?.total ?? 0,
        tracks: items.map(mapTrack),
      };
    },
  });
}
