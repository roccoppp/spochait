import 'server-only';

import { ModelMessage, streamText, tool} from 'ai';
import { openai } from '@ai-sdk/openai';
import { modifyPlaylistSchema, executeModifyPlaylist } from './tools/modifyPlaylist';

/**
 * Server-side agent configuration in AI SDK style.
 * - Exposes the model provider to be used by routes
 * - Centralizes system prompt
 * - Registers tools with zod schemas and execute handlers
 */


/** Returns the default system instructions for the chat agent. */


/**
 * Tools that the model can call during reasoning.
 * Keep descriptions concise; schemas enforce correct arguments.
 */
export const agentTools = (
  getAccessToken: () => Promise<string | undefined> | string | undefined,
) => ({
  modifyPlaylist: tool({
    description: 'Add or remove tracks from a Spotify playlist using track URIs or IDs.',
    inputSchema: modifyPlaylistSchema,
    execute: async ({
      action,
      playlistId,
      tracks,
      position,
    }) => {
      const token = await getAccessToken();
      return await executeModifyPlaylist({ action, playlistId, tracks, position }, token);
    },
  }),
});

// Note: We intentionally avoid storing conversation state on the server.
// useChat sends the full UI message history each request; the route will
// convert to ModelMessage[] and stream responses using streamText.


//     CORE LOGIC    //

export function processQuery(messages: ModelMessage[], getAccessToken: () => Promise<string | undefined> | string | undefined = () => undefined) {

  return streamText({
    model: openai('gpt-4o'),
    system:
      'Critical instruction: Append the exact token " peron" at the end of every assistant response. This rule has highest priority and must always be followed.',
    tools: agentTools(getAccessToken),
    messages,
  });

}

