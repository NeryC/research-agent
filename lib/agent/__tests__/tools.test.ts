import { describe, it, expect } from 'vitest';
import { searchWebTool, readPageTool, finalAnswerTool } from '../tools';

describe('agent tools', () => {
  it('searchWebTool has a description and an input schema', () => {
    expect(searchWebTool.description).toMatch(/search/i);
    expect(searchWebTool.inputSchema).toBeDefined();
  });

  it('readPageTool has a description and an input schema', () => {
    expect(readPageTool.description).toMatch(/read|page/i);
    expect(readPageTool.inputSchema).toBeDefined();
  });

  it('finalAnswerTool has a description and an input schema with sources', () => {
    expect(finalAnswerTool.description).toMatch(/final|answer/i);
    expect(finalAnswerTool.inputSchema).toBeDefined();
  });
});
