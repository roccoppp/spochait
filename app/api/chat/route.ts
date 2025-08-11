
import { convertToModelMessages,  type UIMessage } from 'ai';
import { processQuery } from '@/lib/agent/Agent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Use centralized agent config (model, system, tools)
  const session = await getServerSession(authOptions);
  const getAccessToken = () => (session as any)?.accessToken as string | undefined;
  const result = processQuery(convertToModelMessages(messages), getAccessToken);

  // Return in UIMessage stream format for useChat
  return result.toUIMessageStreamResponse();
}


