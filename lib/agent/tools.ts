import { tool } from 'ai';
import { z } from 'zod';
import { searchExa, readExaPage } from '../exa';

export const searchWebTool = tool({
  description:
    'Search the web for relevant pages on a topic. Returns a list of results with titles, URLs, and highlights.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  execute: async ({ query }) => {
    const results = await searchExa(query, 5);
    return results.map((r) => ({
      title: r.title,
      url: r.url,
      highlights: r.highlights ?? [],
    }));
  },
});

export const readPageTool = tool({
  description:
    'Read the full text content of a specific web page by its URL. Use this after searching to get details from a promising result.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL of the page to read'),
  }),
  execute: async ({ url }) => {
    const page = await readExaPage(url);
    return { title: page.title, url: page.url, content: page.content };
  },
});

export const finalAnswerTool = tool({
  description:
    'Submit the final answer to the user with structured citations. Call this only when you have enough information from search and read tools.',
  inputSchema: z.object({
    answer: z.string().describe('The synthesized answer in markdown'),
    sources: z.array(
      z.object({
        url: z.string().url(),
        title: z.string(),
        snippet: z.string().optional(),
      }),
    ),
  }),
  // No execute — terminal signal, runtime does not invoke.
});
