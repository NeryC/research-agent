import { convertToModelMessages, type UIMessage } from 'ai';
import { researchAgent } from '@/lib/agent/research-agent';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limit = rateLimit(ip, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return new Response('Rate limit exceeded. Try again in an hour.', { status: 429 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = await researchAgent.stream({
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
