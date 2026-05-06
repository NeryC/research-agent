const EXA_BASE = 'https://api.exa.ai';

export type ExaResult = {
  id: string;
  title: string;
  url: string;
  highlights?: string[];
};

export async function searchExa(query: string, numResults = 5): Promise<ExaResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error('EXA_API_KEY is not set');

  const res = await fetch(`${EXA_BASE}/search`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      numResults,
      type: 'auto',
      contents: { highlights: true },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Exa /search failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.results ?? [];
}

export type ExaPage = {
  url: string;
  title: string;
  content: string;
};

export async function readExaPage(url: string): Promise<ExaPage> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error('EXA_API_KEY is not set');

  const res = await fetch(`${EXA_BASE}/contents`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      urls: [url],
      text: { maxCharacters: 8000 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Exa /contents failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const first = data.results?.[0];
  if (!first) throw new Error(`Exa /contents returned no results for ${url}`);

  return {
    url: first.url,
    title: first.title ?? '',
    content: first.text ?? '',
  };
}
