import 'server-only';

import { ModelMessage, streamText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { listPlaylists } from './tools/listPlaylists';
import { modifyPlaylist } from './tools/modifyPlaylist';
import { searchTracks } from './tools/searchTracks';


/**
 * Server-side agent configuration in AI SDK style.
 * - Exposes the model provider to be used by routes
 * - Centralizes system prompt with music-only restrictions
 * - Registers tools with zod schemas and execute handlers
 * 
 * Note: Topic validation is handled via system prompt rather than pre-processing
 * to allow for more nuanced understanding of music-related context and edge cases.
 */


/** Returns the default system instructions for the chat agent. */




// Note: We intentionally avoid storing conversation state on the server.
// useChat sends the full UI message history each request; the route will
// convert to ModelMessage[] and stream responses using streamText.


//     CORE LOGIC    //

export async function processQuery(
  messages: ModelMessage[],
  getAccessToken: () => Promise<string | undefined> | string | undefined = () => undefined,
  sessionId?: string,
) {
  const tools = {
    listPlaylists: listPlaylists(getAccessToken),
    modifyPlaylist: modifyPlaylist(getAccessToken),
    searchTracks: searchTracks(getAccessToken),
  } as const;

  // Stream immediately; avoid awaiting intermediate results to prevent route timeouts
  return streamText({
    model: openai('gpt-4o'),
    system: `You are a specialized Spotify music assistant. Your ONLY purpose is to help users with:

1. **Songs**: Finding, searching, and getting information about specific tracks
2. **Artists**: Providing information about musicians, bands, and their music
3. **Playlist Management**: Creating, modifying, organizing, and managing Spotify playlists

**IMPORTANT RESTRICTIONS:**
- You MUST NOT answer questions about topics unrelated to music, songs, artists, or playlist management
- If a user asks about anything else (politics, weather, general knowledge, coding, etc.), politely decline and redirect them back to music-related topics
- Always stay focused on Spotify and music-related functionality

**Response Guidelines:**
- If the question is not music-related, respond with: "I'm a specialized music assistant focused on helping with songs, artists, and playlist management. How can I help you with your music today?"
- Use the available tools to search tracks, list playlists, and modify playlists when needed
- Decide if you need to use tools to get more information (e.g., Playlist ID or track IDs) or if you can respond with the information you have

Your responses may be passed to another LLM call if you only return tool calls.`,
    messages,
    tools,
    // Enable multi-step tool calls and follow-up assistant text in a single stream
    stopWhen: stepCountIs(5),
  });
}

