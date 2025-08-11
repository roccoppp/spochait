import { z } from 'zod';
import SpotifyWebApi from 'spotify-web-api-node';

// Initialize Spotify client (token will be set dynamically)
const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Tool schema
export const modifyPlaylistSchema = z.object({
  action: z.enum(['add', 'remove']).describe('Whether to add or remove songs'),
  playlistId: z.string().describe('The Spotify playlist ID'),
  tracks: z.array(z.string()).max(100).describe('Array of track URIs or IDs'),
  position: z.number().optional().describe('Position to insert tracks (for add action)'),
});

export type ModifyPlaylistParams = z.infer<typeof modifyPlaylistSchema>;

// Tool execution function
export async function executeModifyPlaylist(
  params: ModifyPlaylistParams,
  accessToken?: string,
) {
  const { action, playlistId, tracks, position } = params;
  
  try {
    // Check if access token is configured
    if (!accessToken) {
      return {
        success: false,
        message: 'Spotify access token not available. Please authenticate with Spotify.',
      };
    }

    // Set the access token for this request
    spotify.setAccessToken(accessToken);

    // Normalize track URIs
    const trackUris = tracks.map((track: string) => {
      if (track.startsWith('spotify:track:')) {
        return track;
      }
      const trackId = track.split('/').pop()?.split('?')[0] || track;
      return `spotify:track:${trackId}`;
    });

    if (action === 'add') {
      // Add tracks to playlist
      const options = position !== undefined ? { position } : {};
      const result = await spotify.addTracksToPlaylist(playlistId, trackUris, options);
      
      return {
        success: true,
        message: `Successfully added ${tracks.length} track(s) to playlist${position !== undefined ? ` at position ${position}` : ''}`,
        snapshotId: result.body.snapshot_id,
      };
    } else {
      // Remove tracks from playlist
      const tracksToRemove = trackUris.map((uri: string) => ({ uri }));
      const result = await spotify.removeTracksFromPlaylist(playlistId, tracksToRemove);
      
      return {
        success: true,
        message: `Successfully removed ${tracks.length} track(s) from playlist`,
        snapshotId: result.body.snapshot_id,
      };
    }
  } catch (error: unknown) {
    let errorMessage = 'Unknown error occurred';

    const maybeError = error as { statusCode?: number; message?: string } | undefined;

    if (typeof maybeError?.statusCode === 'number') {
      switch (maybeError.statusCode) {
        case 401:
          errorMessage = 'Unauthorized - Invalid or expired access token';
          break;
        case 403:
          errorMessage = 'Forbidden - Insufficient permissions to modify this playlist';
          break;
        case 404:
          errorMessage = 'Playlist not found or tracks not found';
          break;
        case 400:
          errorMessage = 'Bad request - Invalid playlist ID or track URIs';
          break;
        default:
          errorMessage = maybeError?.message || 'Spotify API error';
      }
    } else {
      errorMessage = maybeError?.message || 'Network or connection error';
    }

    return {
      success: false,
      message: `Failed to ${action} tracks: ${errorMessage}`,
    };
  }
}