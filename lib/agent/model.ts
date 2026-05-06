// Single source of truth for the model used by the research agent.
// Gateway provider is implicit — AI SDK picks up AI_GATEWAY_API_KEY from env.
// Latest Sonnet as of 2026-05-06 per https://ai-gateway.vercel.sh/v1/models.
// Verified with a live HTTP 200 from the gateway with this exact slug.
export const RESEARCH_MODEL = 'anthropic/claude-sonnet-4.6';
