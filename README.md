# Research Agent

An autonomous web-research assistant that searches, reads, and synthesizes answers with citations — built on Next.js 16, AI SDK v6, the Vercel AI Gateway, and Exa.

> **Live demo:** [research-agent-three-pi.vercel.app](https://research-agent-three-pi.vercel.app)

<!--
Drop two screenshots into `docs/` and they'll show up here:
  - docs/screenshot-agent-steps.png   (the tool-call timeline as the agent searches/reads)
  - docs/screenshot-final-answer.png  (the markdown answer with cited sources)
File names are intentionally fixed so the README links never break.

![Agent reasoning steps](docs/screenshot-agent-steps.png)
![Final answer with sources](docs/screenshot-final-answer.png)
-->

## Stack

- **Next.js 16** (App Router, Server Components, Route Handlers)
- **AI SDK v6** — `ai` (server) + `@ai-sdk/react` (client `useChat` with `DefaultChatTransport`)
- **Vercel AI Gateway** — single key, observability, automatic provider failover (Anthropic → Vertex Anthropic → Bedrock)
- **Model:** `anthropic/claude-sonnet-4.6` (pinned via the gateway)
- **Exa** — `/search` and `/contents` endpoints for grounded retrieval
- **shadcn/ui** + **Tailwind CSS v4** for the UI
- **Vitest** + **happy-dom** for tests
- **Zod** for tool input/output schemas

## What it demonstrates

- **Multi-step tool use.** The agent decides between `searchWeb`, `readPage`, and `finalAnswer` and loops until it has enough context to answer — no hard-coded pipeline.
- **Streaming generative UI.** Tool calls and partial results render in the chat as they execute, so the user sees the reasoning unfold instead of waiting on a single blob of text.
- **Citations grounded in real sources.** Every answer ships with the URLs the agent actually read, not hallucinated references.
- **Reasoning loop with safety.** `stopWhen: stepCountIs(8)` caps the loop so the agent can't spin indefinitely on a hard query.
- **Idiomatic AI SDK v6.** Uses `ToolLoopAgent` (the v6-recommended pattern) to encapsulate `model + instructions + tools + stopWhen`, `useChat` with `DefaultChatTransport` on the client, Zod-typed tool inputs, and a no-`execute` terminal tool that produces structured output cleanly.
- **Production-ready.** IP-based rate limiting, environment-based secrets via the AI Gateway, deployed on Vercel.

## Architecture

```
+---------------------+         +------------------------------+         +------------------+
|  Browser            |  POST   |  /api/research               |  HTTP   |  Vercel          |
|  React + useChat    | ------> |  - rate limit (5/hr/IP)      | ------> |  AI Gateway      |
|  DefaultChatTransport|         |  - researchAgent.stream()   |         |  (provider       |
+---------------------+         +------------------------------+         |   failover)      |
         ^                                   |                            +--------+---------+
         |                                   | tool calls                          |
         |       streamed UI parts           v                                     v
         +-----------------------------------+                            +------------------+
                                             |                            |  Anthropic       |
                                             |                            |  claude-sonnet-4.6|
                                             v                            +------------------+
                                  +----------------------+
                                  |  Tools               |
                                  |  - searchWeb (Exa)   |
                                  |  - readPage  (Exa)   |
                                  |  - finalAnswer       |
                                  +----------------------+
```

## Local development

```bash
git clone https://github.com/NeryC/research-agent.git
cd research-agent
npm install

cp .env.example .env.local
# fill in AI_GATEWAY_API_KEY and EXA_API_KEY

npm run dev      # http://localhost:3000
npm test         # 14 tests across exa / rate-limit / tools
npm run lint
```

## Environment variables

| Variable              | Required | Where to get it                                                          |
| --------------------- | -------- | ------------------------------------------------------------------------ |
| `AI_GATEWAY_API_KEY`  | yes      | Vercel dashboard → AI Gateway → API keys (`https://vercel.com/<team>/~/ai-gateway`) |
| `EXA_API_KEY`         | yes      | Exa dashboard (`https://dashboard.exa.ai`)                               |

## Technical decisions

**Vercel AI Gateway over a direct Anthropic SDK.** A single gateway key replaces per-provider credentials, gives me built-in request logs and cost tracking, and configures automatic failover (Vertex Anthropic, Bedrock) without changing application code. It is the same shape a production team would use, so the demo doubles as a representative integration.

**`ToolLoopAgent` over raw `streamText + tools`.** v6 recommends `ToolLoopAgent` because it declaratively bundles the model, system instructions, tools, and stop condition into a single object that exposes a `stream()` method. The route handler stays a thin adapter — it just rate-limits, calls `researchAgent.stream({ messages: await convertToModelMessages(messages) })`, and returns the UI message stream — which keeps business logic out of the HTTP layer.

**A `finalAnswer` tool with no `execute`.** Instead of trying to parse free-form text at the end of the run, the agent calls a terminal `finalAnswer` tool whose Zod schema fixes the shape (`answer: string`, `sources: { url, title }[]`). Because the tool has no `execute`, the loop ends as soon as it's called and the UI reads the structured input directly. This trades one prompt instruction for type-safe output and zero parsing code.

**In-memory rate limit (5 queries / IP / hour).** A single-region demo doesn't justify pulling in Redis or KV — a `Map<string, { count, windowStart }>` is enough to protect the Exa quota and the gateway budget. The tradeoffs are documented openly: it resets on cold start and is per-instance rather than global. For a multi-region production deploy, this is the file I would swap to Upstash Redis without touching the route logic.

**Exa over Google or Bing.** Exa's `/contents` endpoint returns extracted, readable page text directly, which removes the entire HTML-scraping layer (no Cheerio, no Readability, no anti-bot games). The free tier covers portfolio-scale demos, and the API surface is small enough that the Zod schema and tests stay tight.

## Limits

- **5 research queries per IP per hour** (in-memory; resets on cold start).
- **8 reasoning steps per query** (`stopWhen: stepCountIs(8)`).
- **Max 5 results per `searchWeb` call.**
- **Max 8000 characters per `readPage` call** (truncated server-side to keep prompts bounded).
