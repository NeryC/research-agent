# Research Agent

An autonomous research assistant that searches the web, reads sources, and synthesizes cited answers — built on Next.js 16, AI SDK v6, Vercel AI Gateway, and Exa.

> **Live demo:** [research-agent-three-pi.vercel.app](https://research-agent-three-pi.vercel.app)  
> **GitHub:** [github.com/NeryC/research-agent](https://github.com/NeryC/research-agent)

<!--
![Agent reasoning steps](docs/screenshot-agent-steps.png)
![Final answer with sources](docs/screenshot-final-answer.png)
-->

---

## What does this project do?

The Research Agent is an AI agent that acts as a personal researcher. Unlike an ordinary chatbot that responds from its training knowledge, this agent:

1. **Searches the internet in real time** using Exa AI, finding relevant and up-to-date pages on the topic
2. **Reads the content of those pages** to obtain detailed and accurate information
3. **Reasons in multiple steps** — it can search, read several articles, search again with refined terms, and so on until it has enough information
4. **Synthesizes a structured answer** in Markdown format with sections, lists, and comparisons
5. **Cites all its sources** with the title and URL of every page it actually consulted (no fabricated references)

All of this happens in a **visible and transparent** way — the user sees every step the agent takes: what it searched for, what it read, and how it arrived at its final answer.

---

## Step-by-step tutorial

### Step 1: Open the application

Go to [research-agent-three-pi.vercel.app](https://research-agent-three-pi.vercel.app). You will see a chat interface with suggested example questions.

### Step 2: Type a research question

Type any question that requires up-to-date information or a comparison of sources. For example:

```
What are the differences between Vercel AI Gateway and LiteLLM?
```

```
What is pgvector and how does it compare to Pinecone?
```

```
Explain the latest advances in multimodal AI models in 2024
```

> **Tip:** Questions that benefit most are those that require comparing alternatives, understanding recent technologies, or researching a topic with multiple sources. Simple definition questions work too, but the agent shines on complex research.

### Step 3: Watch the agent reason

Immediately after submitting the question, you will see an **action timeline** that updates in real time:

```
🔍 searchWeb("Vercel AI Gateway vs LiteLLM comparison")
   → 5 results found

📄 readPage("https://vercel.com/docs/ai-gateway")
   → Reading content...

🔍 searchWeb("LiteLLM features pricing 2024")
   → 5 results found

📄 readPage("https://docs.litellm.ai/docs/")
   → Reading content...

✅ finalAnswer
   → Generating answer...
```

Each card shows which tool the agent used and the result it obtained.

### Step 4: Read the answer with citations

When finished, the answer appears in Markdown with:
- Well-organized sections
- Comparison tables where applicable
- At the bottom, source cards with the title and URL of each page read

### Step 5: Ask follow-up questions

You can continue the conversation with follow-up questions:
```
Which one has better support for Claude?
```
```
How much does each option cost?
```
The conversation history is kept in memory for the duration of the session.

---

## Demo: complete internal flow

To understand what happens under the hood when you type a question, here is the complete flow traced step by step:

```
User types: "What are the best vector databases in 2024?"
        │
        ▼
┌─────────────────────────────┐
│  Browser (React + useChat)  │
│  POST /api/research         │
│  Body: { messages: [...] }  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Route Handler: /api/research/route.ts                      │
│                                                             │
│  1. Extract IP from "x-forwarded-for" header               │
│  2. Check rate limit: has this IP made < 5 req/hour?        │
│  3. Call: researchAgent.stream({ messages })                │
│  4. Return a UIMessageStream to the browser                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  ToolLoopAgent (AI SDK v6)                                  │
│                                                             │
│  Model: claude-sonnet-4.6 (via Vercel AI Gateway)           │
│  System prompt: "You are a research assistant..."           │
│  Available tools: searchWeb, readPage, finalAnswer          │
│  stopWhen: stepCountIs(8)  ← maximum 8 iterations          │
│                                                             │
│  Iteration 1: model decides to call searchWeb               │
│  → searchWeb({ query: "best vector databases 2024" })       │
│    → Exa /search → 5 results with highlights               │
│    → Result returned to model                               │
│                                                             │
│  Iteration 2: model decides to read one of the results      │
│  → readPage({ url: "https://..." })                         │
│    → Exa /contents → full text (up to 8000 chars)          │
│    → Result returned to model                               │
│                                                             │
│  Iteration 3: model has enough information                  │
│  → finalAnswer({ answer: "...", sources: [...] })           │
│    ← Tool without execute → loop ends here                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Stream back to browser                                     │
│  - Each tool call appears as a card in real time            │
│  - The final answer appears below with source cards         │
└─────────────────────────────────────────────────────────────┘
```

---

## Code architecture

### Folder structure

```
research-agent/
├── app/
│   ├── page.tsx                  # Main page (Server Component)
│   ├── research-client.tsx       # Chat UI (Client Component, useChat)
│   └── api/
│       └── research/
│           └── route.ts          # Route Handler — API entry point
├── lib/
│   ├── agent/
│   │   ├── model.ts              # Model constant
│   │   ├── tools.ts              # Definition of the 3 agent tools
│   │   └── research-agent.ts    # ToolLoopAgent instance
│   ├── exa.ts                    # HTTP client for the Exa API
│   └── rate-limit.ts             # In-memory rate limiter (IP-based)
└── tests/
    ├── exa.test.ts               # Tests for the Exa client
    ├── rate-limit.test.ts        # Tests for the rate limiter
    └── tools.test.ts             # Tests for the agent tools
```

### File by file: what each one does

#### `app/api/research/route.ts` — The HTTP entry point

```typescript
export async function POST(req: Request) {
  // 1. Extract IP for rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // 2. Check usage limit
  const limit = rateLimit(ip, { max: 5, windowMs: 60 * 60 * 1000 }); // 5/hour
  if (!limit.allowed) {
    return new Response('Rate limit exceeded. Try again in an hour.', { status: 429 });
  }

  // 3. Parse the body — messages is the conversation history in UIMessage format
  const { messages }: { messages: UIMessage[] } = await req.json();

  // 4. Start the agent with streaming
  const result = await researchAgent.stream({
    messages: await convertToModelMessages(messages), // Convert UI format → model format
  });

  // 5. Return the stream to the client
  return result.toUIMessageStreamResponse();
}
```

**Why `convertToModelMessages`?** AI SDK v6 separates UI messages (which include tool metadata for rendering on screen) from the format the model understands (plain text with roles). This function performs that conversion.

---

#### `lib/agent/research-agent.ts` — The heart of the agent

```typescript
export const researchAgent = new ToolLoopAgent({
  model: RESEARCH_MODEL,                    // claude-sonnet-4.6 via AI Gateway
  instructions: SYSTEM_PROMPT,             // "You are a research assistant..."
  tools: {
    searchWeb: searchWebTool,              // Searches the internet
    readPage: readPageTool,                // Reads a specific page
    finalAnswer: finalAnswerTool,          // Produces the final answer (terminal)
  },
  stopWhen: stepCountIs(8),               // Maximum 8 steps to prevent infinite loops
});
```

`ToolLoopAgent` is the recommended pattern in AI SDK v6. It encapsulates:
- Which **model** to use
- Which **system instructions** to follow
- Which **tools** are available
- When to **stop** the loop

The loop works as follows: the model receives the messages, decides to call a tool, that tool executes, the result goes back to the model, and so on until the model calls `finalAnswer` (which has no `execute`) or the 8-step limit is reached.

---

#### `lib/agent/tools.ts` — The 3 agent tools

**`searchWeb`** — Searches the internet:
```typescript
export const searchWebTool = tool({
  description: 'Search the web for relevant pages on a topic. Returns a list of results with titles, URLs, and highlights.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  execute: async ({ query }) => {
    const results = await searchExa(query, 5); // Maximum 5 results
    return results.map((r) => ({
      title: r.title,
      url: r.url,
      highlights: r.highlights ?? [], // Relevant snippets pre-extracted by Exa
    }));
  },
});
```

**`readPage`** — Reads the full content of a URL:
```typescript
export const readPageTool = tool({
  description: 'Read the full text content of a specific web page by its URL.',
  inputSchema: z.object({ url: z.string().url() }),
  execute: async ({ url }) => {
    const page = await readExaPage(url);
    return { title: page.title, url: page.url, content: page.content }; // up to 8000 chars
  },
});
```

**`finalAnswer`** — The terminal tool (no `execute`):
```typescript
export const finalAnswerTool = tool({
  description: 'Submit the final answer to the user with structured citations.',
  inputSchema: z.object({
    answer: z.string(),      // Answer in Markdown
    sources: z.array(z.object({
      url: z.string().url(),
      title: z.string(),
      snippet: z.string().optional(),
    })),
  }),
  // No execute — terminal signal: when the model calls this tool, the loop stops immediately
});
```

**Why no `execute`?** This is the key technique. The AI SDK tool loop stops automatically when it encounters a tool without `execute`. This is much cleaner than parsing free text to detect that the agent "finished reasoning" — the agent simply calls a function with a known schema and the loop stops.

---

#### `lib/exa.ts` — The web search client

Exa has 2 endpoints used by this project:

```typescript
// /search — finds relevant pages
export async function searchExa(query: string, numResults = 5): Promise<ExaResult[]> {
  const res = await fetch(`${EXA_BASE}/search`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      numResults,
      type: 'auto',
      contents: { highlights: true }, // Returns relevant snippets automatically
    }),
  });
  // ...
}

// /contents — extracts the full text of a URL
export async function readExaPage(url: string): Promise<ExaPage> {
  const res = await fetch(`${EXA_BASE}/contents`, {
    method: 'POST',
    body: JSON.stringify({
      urls: [url],
      text: { maxCharacters: 8000 }, // Limit to keep prompts bounded
    }),
  });
  // ...
}
```

**Why Exa instead of Google/Bing?** Exa returns the page text directly, without raw HTML. This eliminates the need for an HTML parser (Cheerio, Readability) and avoids problems with anti-bot measures or JavaScript-heavy pages.

---

#### `lib/rate-limit.ts` — Cost protection

```typescript
const buckets = new Map<string, Bucket>(); // In-memory, per instance

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    // First request from this IP, or the window has expired — reset the counter
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.max - 1 };
  }

  if (existing.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: opts.max - existing.count };
}
```

Limit: **5 queries per IP per hour**. Because it uses an in-memory `Map`, the limit resets on every Vercel cold start (it is not global across instances). For a portfolio demo this is sufficient; in production you would use Upstash Redis.

---

### How the SSE stream reaches the browser

AI SDK v6 uses its own stream format ("UI Message Stream") that:
1. Sends partial events for each step: tool call start, result, generated text, etc.
2. The client (`useChat` + `DefaultChatTransport`) consumes them and updates React state automatically
3. Tool cards appear in real time without any polling

```
Client                     Server (SSE stream)
  |                              |
  |------ POST /api/research --->|
  |                              | (model decides to search)
  |<-- data: tool_call_start ---|  → "Searching..." card appears
  |                              | (Exa returns results)
  |<-- data: tool_call_end -----|  → card shows results
  |                              | (model decides to read a page)
  |<-- data: tool_call_start ---|  → "Reading..." card appears
  |                              | (Exa returns content)
  |<-- data: tool_call_end -----|  → card shows summary
  |                              | (model calls finalAnswer)
  |<-- data: text_delta --------|  → answer appears character by character
  |<-- data: finish ------------|
```

---

## Tech stack

| Layer | Technology | Why? |
|-------|-----------|------|
| Framework | Next.js 16 App Router | Server Components + Route Handlers + Vercel deployment |
| AI SDK | Vercel AI SDK v6 | `ToolLoopAgent`, native streaming, `useChat` hook |
| Model | `claude-sonnet-4.6` | Best at multi-step reasoning and tool use |
| Gateway | Vercel AI Gateway | Single API key, automatic failover, observability |
| Search | Exa AI | Returns clean text directly (no raw HTML) |
| UI | Tailwind v4 + shadcn/ui | Accessible components and utility-first styling |
| Tests | Vitest + happy-dom | Fast unit tests, ESM-compatible |
| Deploy | Vercel (Hobby) | Automatic CI/CD from GitHub |

---

## Local setup

```bash
git clone https://github.com/NeryC/research-agent.git
cd research-agent
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```env
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key
EXA_API_KEY=your_exa_key
```

| Variable | Where to get it |
|----------|----------------|
| `AI_GATEWAY_API_KEY` | [vercel.com](https://vercel.com) → your team → AI Gateway → API Keys |
| `EXA_API_KEY` | [dashboard.exa.ai](https://dashboard.exa.ai) |

```bash
npm run dev    # → http://localhost:3000
npm test       # → 14 tests (exa, rate-limit, tools)
npm run lint
```

---

## Technical decisions explained

### Why `ToolLoopAgent` instead of `streamText` with tools?

`streamText` with tools requires the developer to manually manage the loop: detect whether the model wanted to call a tool, execute it, call the model again with the result, and decide when to stop. `ToolLoopAgent` encapsulates all of this:

```typescript
// Without ToolLoopAgent (more verbose, more fragile):
let messages = initialMessages;
for (let i = 0; i < 8; i++) {
  const result = await streamText({ model, messages, tools });
  if (result.finishReason === 'stop') break;
  messages = [...messages, ...result.responseMessages];
}

// With ToolLoopAgent (declarative):
const agent = new ToolLoopAgent({ model, tools, stopWhen: stepCountIs(8) });
const result = await agent.stream({ messages });
```

### Why Vercel AI Gateway instead of the Anthropic SDK directly?

With the direct SDK you need to manage API keys for each provider separately. With the Gateway:
- A single `AI_GATEWAY_API_KEY` for all models
- If Anthropic has an outage, the Gateway automatically fails over to Vertex or Bedrock
- The Vercel dashboard shows logs and costs for every request
- The code does not change if you switch providers

### Why `finalAnswer` without `execute`?

Alternative 1: Parse the model's text output to detect that it "finished." Fragile and untyped.

Alternative 2: Terminal tool without `execute`. The model calls the tool with a known Zod schema, the SDK stops the loop immediately, and you get `{ answer: string, sources: Source[] }` fully typed. Zero parsing, zero regex.

---

## Limits

| Limit | Value | Reason |
|-------|-------|--------|
| Queries per IP/hour | 5 | Protect Exa quota and API costs |
| Maximum steps per query | 8 | Prevent infinite loops on ambiguous queries |
| Results per search | 5 | Balance between context and prompt size |
| Content per page | 8,000 characters | Keep prompts within the token budget |
| Maximum function duration | 60 seconds | Vercel Hobby plan limit |
