import { ToolLoopAgent, stepCountIs } from 'ai';
import { searchWebTool, readPageTool, finalAnswerTool } from './tools';
import { RESEARCH_MODEL } from './model';

const SYSTEM_PROMPT = `You are a research assistant. Given a user question:
1. Use searchWeb to find relevant pages.
2. Use readPage on 1-3 of the most promising results to get details.
3. Synthesize a clear, well-structured answer in markdown.
4. ALWAYS finish by calling finalAnswer with the answer and sources.
Do not call finalAnswer without first having searched and read at least one page.
Be concise. Do not reproduce large blocks of source content verbatim.`;

export const researchAgent = new ToolLoopAgent({
  model: RESEARCH_MODEL,
  instructions: SYSTEM_PROMPT,
  tools: {
    searchWeb: searchWebTool,
    readPage: readPageTool,
    finalAnswer: finalAnswerTool,
  },
  stopWhen: stepCountIs(8),
});
