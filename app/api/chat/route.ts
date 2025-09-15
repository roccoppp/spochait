
import { convertToModelMessages,  type UIMessage } from 'ai';
import { processQuery } from '@/lib/agent/Agent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages, sessionId }: { messages: UIMessage[]; sessionId?: string } = await req.json();

  console.log('🎵 [CHAT ROUTE] Received request:', {
    messageCount: messages.length,
    sessionId,
    lastMessage: messages[messages.length - 1] ? 'Message received' : 'No messages'
  });

  // Use centralized agent config (model, system, tools)
  const session = await getServerSession(authOptions);
  const getAccessToken = () => {
    const s = session as unknown as { accessToken?: string } | null;
    return s?.accessToken;
  };
  
  // Convert messages and handle session refresh
  const modelMessages = convertToModelMessages(messages);
  
  console.log('🎵 [CHAT ROUTE] Converted to model messages:', {
    modelMessageCount: modelMessages.length,
    hasAccessToken: !!(session as unknown as { accessToken?: string } | null)?.accessToken
  });
  
  // If this is a fresh session with sessionId, we can ensure clean state
  // The model will only see the current conversation messages
  const result = await processQuery(modelMessages, getAccessToken, sessionId);

  console.log('🎵 [CHAT ROUTE] Starting LLM stream...');
  
  // Return in UIMessage stream format for useChat
  return result.toUIMessageStreamResponse();
}


