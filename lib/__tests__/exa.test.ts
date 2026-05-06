import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchExa, readExaPage } from '../exa';

describe('searchExa', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubEnv('EXA_API_KEY', 'test-key');
  });

  it('returns results array on a successful response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { id: '1', title: 'Test', url: 'https://example.com', highlights: ['snippet'] },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const results = await searchExa('next.js 16');

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test');
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('throws a descriptive error on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'unauthorized',
    }));
    await expect(searchExa('q')).rejects.toThrow(/401/);
  });
});

describe('readExaPage', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubEnv('EXA_API_KEY', 'test-key');
  });

  it('returns content and title for a known URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ url: 'https://example.com', title: 'X', text: 'page body' }],
      }),
    }));
    const result = await readExaPage('https://example.com');
    expect(result.title).toBe('X');
    expect(result.content).toBe('page body');
  });
});
