import { tool } from 'ai';
import { z } from 'zod';
import SpotifyWebApi from 'spotify-web-api-node';

type GetAccessToken = () => Promise<string | undefined> | string | undefined;

/**
 * Factory that creates the modifyPlaylist tool bound to a getAccessToken provider.
 * Allows adding and/or removing tracks by ID to/from a target playlist.
 */
export function modifyPlaylist(getAccessToken: GetAccessToken) {
  return tool({
    description:
      'Add and/or remove tracks from a Spotify playlist using track IDs. This tool supports BATCH operations - you can add/remove multiple tracks in a single call by providing arrays of track IDs. Always batch multiple operations together for efficiency. Provide the playlistId and arrays of track IDs to add/remove.',
    inputSchema: z
      .object({
        playlistId: z
          .string()
          .min(1)
          .describe('The Spotify playlist ID to modify.'),
        addTrackIds: z
          .array(z.string().min(1))
          .describe('Array of track IDs to add to the playlist. Can include multiple tracks for batch adding.')
          .default([])
          .optional(),
        removeTrackIds: z
          .array(z.string().min(1))
          .describe('Array of track IDs to remove from the playlist. Can include multiple tracks for batch removal.')
          .default([])
          .optional(),
      })
      .refine(
        (data) => (data.addTrackIds && data.addTrackIds.length > 0) || (data.removeTrackIds && data.removeTrackIds.length > 0),
        {
          message: 'Provide at least one track ID to add or remove.',
          path: ['addTrackIds'],
        },
      ),
    execute: async ({ playlistId, addTrackIds = [], removeTrackIds = [] }) => {
      const token = await Promise.resolve(
        typeof getAccessToken === 'function' ? getAccessToken() : undefined,
      );

      if (!token) {
        throw new Error('Missing Spotify access token. Please authenticate.');
      }

      const spotifyApi = new SpotifyWebApi();
      spotifyApi.setAccessToken(token);

      const toUri = (idOrUri: string) =>
        idOrUri.startsWith('spotify:track:') || idOrUri.startsWith('https://open.spotify.com/track/')
          ? idOrUri
          : `spotify:track:${idOrUri}`;

      const result: {
        playlistId: string;
        added?: number;
        removed?: number;
      } = { playlistId };

      // Remove first to avoid conflicts like duplicates or ordering concerns
      if (removeTrackIds.length > 0) {
        const removeUris = removeTrackIds.map(toUri).map((uri) => ({ uri }));
        await spotifyApi.removeTracksFromPlaylist(playlistId, removeUris);
        result.removed = removeTrackIds.length;
      }

      if (addTrackIds.length > 0) {
        const addUris = addTrackIds.map(toUri);
        await spotifyApi.addTracksToPlaylist(playlistId, addUris);
        result.added = addTrackIds.length;
      }

      return result;
    },
  });
}


