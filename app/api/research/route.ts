import { convertToModelMessages, type UIMessage } from 'ai';
import { researchAgent } from '@/lib/agent/research-agent';
import { rateLimit, pruneExpired } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Occasionally prune expired rate-limit buckets to prevent memory growth.
  if (Math.random() < 0.1) pruneExpired();

  const limit = rateLimit(ip, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Try again in an hour.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('messages' in body) ||
    !Array.isArray((body as Record<string, unknown>).messages)
  ) {
    return Response.json(
      { error: 'Request body must include a "messages" array.' },
      { status: 400 },
    );
  }

  const { messages } = body as { messages: UIMessage[] };

  const result = await researchAgent.stream({
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
