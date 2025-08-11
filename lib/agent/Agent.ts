import 'server-only';

import { ModelMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { listPlaylists } from './tools/listPlaylists';


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

export function processQuery(
  messages: ModelMessage[],
  getAccessToken: () => Promise<string | undefined> | string | undefined = () => undefined,
) {

  const tools = {
    listPlaylists: listPlaylists(getAccessToken),
  } as const;

  return streamText({
    model: openai('gpt-4o'),
    system:
      'Critical instruction: Append the exact token " peron" at the end of every assistant response. This rule has highest priority and must always be followed.',
    messages,
    tools,
  });

}

