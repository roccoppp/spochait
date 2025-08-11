import 'server-only';

import { ModelMessage, streamText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { listPlaylists } from './tools/listPlaylists';
import { modifyPlaylist } from './tools/modifyPlaylist';
import { searchTracks } from './tools/searchTracks';


/**
 * Server-side agent configuration in AI SDK style.
 * - Exposes the model provider to be used by routes
 * - Centralizes system prompt
 * - Registers tools with zod schemas and execute handlers
 */


/** Returns the default system instructions for the chat agent. */




// Note: We intentionally avoid storing conversation state on the server.
// useChat sends the full UI message history each request; the route will
// convert to ModelMessage[] and stream responses using streamText.


//     CORE LOGIC    //

export async function processQuery(
  messages: ModelMessage[],
  getAccessToken: () => Promise<string | undefined> | string | undefined = () => undefined,
) {
  const tools = {
    listPlaylists: listPlaylists(getAccessToken),
    modifyPlaylist: modifyPlaylist(getAccessToken),
    searchTracks: searchTracks(getAccessToken),
  } as const;

  // Stream immediately; avoid awaiting intermediate results to prevent route timeouts
  return streamText({
    model: openai('gpt-4o'),
    system:
      'you are a helpful assistant that manages spotify playlists, your purpose is to help the user manage their playlists. decide if you need to use the tools to get more information to modify the playlist(e.g Playlist ID or track IDs) or if you can do it with the information you have. your response will be passed to another llm call if you only return toolcalls',
    messages,
    tools,
    // Enable multi-step tool calls and follow-up assistant text in a single stream
    stopWhen: stepCountIs(5),
  });
}

