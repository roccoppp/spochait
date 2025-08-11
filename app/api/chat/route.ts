
import { convertToModelMessages,  type UIMessage } from 'ai';
import { processQuery } from '@/lib/agent/Agent';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Use centralized agent config (model, system, tools)
  const result = processQuery(convertToModelMessages(messages));

  // Return in UIMessage stream format for useChat
  return result.toUIMessageStreamResponse();
}


