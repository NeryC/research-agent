import { ResearchClient } from './research-client';

export default function Home() {
  return (
    <main className="container mx-auto max-w-3xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Research Agent</h1>
        <p className="text-muted-foreground">
          Ask a research question. The agent will search the web, read sources, and synthesize a cited answer.
        </p>
      </header>
      <ResearchClient />
    </main>
  );
}
