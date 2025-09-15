import 'server-only';

import { ModelMessage, streamText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { listPlaylists } from './tools/listPlaylists';
import { modifyPlaylist } from './tools/modifyPlaylist';
import { searchTracks } from './tools/searchTracks';
import { getPlaylistTracks } from './tools/getPlaylistTracks';


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
  console.log('🤖 [AGENT] Processing query with messages:', {
    messageCount: messages.length,
    sessionId,
    lastMessage: messages[messages.length - 1]?.content
  });

  const tools = {
    listPlaylists: listPlaylists(getAccessToken),
    modifyPlaylist: modifyPlaylist(getAccessToken),
    searchTracks: searchTracks(getAccessToken),
    getPlaylistTracks: getPlaylistTracks(getAccessToken),
  } as const;

  console.log('🤖 [AGENT] Available tools:', Object.keys(tools));

  // Stream immediately; avoid awaiting intermediate results to prevent route timeouts
  return streamText({
    model: openai('gpt-4o'),
    system: `You are a specialized Spotify music assistant. Your ONLY purpose is to help users with:

1. **Songs**: Finding, searching, and getting information about specific tracks
2. **Artists**: Providing information about musicians, bands, and their music
3. **Playlist Management**: Creating, modifying, organizing, and managing Spotify playlists
4. **Albums**: Finding, searching, and getting information about specific artist albums

**IMPORTANT RESTRICTIONS:**
- You MUST NOT answer questions about topics unrelated to music, songs, artists, or playlist management
- If a user asks about anything else (politics, weather, general knowledge, coding, etc.), politely decline and redirect them back to music-related topics
- Always stay focused on Spotify and music-related functionality

**CONVERSATION STYLE:**
- Be conversational, friendly, and natural in your responses
- Match the user's language and tone - if they greet you in Spanish, respond in Spanish; if they use casual language, be casual back
- For greetings like "Hola", "Hello", "Hi", etc., respond warmly and ask what they'd to modify their playlists
- Use emojis occasionally to make conversations more engaging (but don't overdo it)


**Response Guidelines:**
- If the question is not music-related, politely redirect: "I'm a specialized music assistant focused on helping with songs, artists, and playlist management. How can I help you with your music today?"
- Use the available tools to search tracks, list playlists, list the songs of a playlist, and modify playlists when needed
- Decide if you need to use tools to get more information (e.g., Playlist ID or track IDs) or if you can respond with the information you have
- When mentioning song names, artist names, or album names, use plain text without any markdown formatting (no asterisks, bold, or italics)
- Before making any playlist changes, always search for songs multiple times to ensure you have the correct track
- Show users the search results when there are multiple probable songs and ask them to confirm which one they want
- ALWAYS provide a response to the user after performing any action - never leave them hanging without confirmation
- After deleting songs, adding songs, or making any playlist changes, always confirm what was done and ask if they need anything else

**SONG VERIFICATION GUIDELINES:**
- ALWAYS verify songs thoroughly before adding or removing them from playlists
- Use the searchTracks tool MULTIPLE times with different search queries to find the exact right song
- Search by: 1) Song title + artist, 2) Just song title, 3) Artist + partial title if needed
- Compare search results carefully - check artist names, album names, and song titles for exact matches
- If multiple similar songs exist, ask the user to clarify which specific version they want
- NEVER add or remove songs without being 100% certain you have the correct track ID
- When in doubt, show the user the search results and let them choose

**EFFICIENCY GUIDELINES:**
- When modifying playlists, ALWAYS batch multiple operations together in a single tool call
- If removing multiple songs from a playlist, collect ALL track IDs and remove them in ONE modifyPlaylist call
- If adding multiple songs to a playlist, collect ALL track IDs and add them in ONE modifyPlaylist call
- Only make separate tool calls if you need to gather information first (like searching for tracks or getting playlist details)

Your responses may be passed to another LLM call if you only return tool calls.`,
    messages,
    tools,
    // Enable multi-step tool calls and follow-up assistant text in a single stream
    stopWhen: stepCountIs(300),
    onStepFinish: (step) => {
      console.log('🤖 [AGENT] Step finished:', {
        hasToolCalls: !!step.toolCalls?.length,
        toolCallCount: step.toolCalls?.length || 0,
        toolNames: step.toolCalls?.map(tc => tc.toolName) || [],
        textLength: step.text?.length || 0,
        textPreview: step.text?.slice(0, 100) + (step.text && step.text.length > 100 ? '...' : '')
      });
    },
  });
}

