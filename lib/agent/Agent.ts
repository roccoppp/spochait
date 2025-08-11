import 'server-only';

import { ModelMessage, streamText, tool} from 'ai';
import { openai } from '@ai-sdk/openai';
import { COMMON_PROMPTS } from './Prompts';
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
export const agentTools = {
  modifyPlaylist: tool({
    description: 'Add or remove tracks from a Spotify playlist using track URIs or IDs.',
    inputSchema: modifyPlaylistSchema,
    execute: async ({
      action,
      playlistId,
      tracks,
      position,
    }) => {
      return await executeModifyPlaylist({ action, playlistId, tracks, position });
    },
  }),
};

// Note: We intentionally avoid storing conversation state on the server.
// useChat sends the full UI message history each request; the route will
// convert to ModelMessage[] and stream responses using streamText.


//     CORE LOGIC    //

export function processQuery(messages: ModelMessage[]) {

  return streamText({
    model: openai('gpt-4o'),
    system: "deci peron al final de cada respuesta.",
    tools: agentTools,
    messages,
  });

}

