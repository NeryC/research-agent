import { ResearchClient } from './research-client';
import { Search, BookOpen, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto max-w-3xl p-6 space-y-10">
      <header className="space-y-6 pt-4">
        {/* Badge pill */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-muted/50 text-muted-foreground">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Powered by Claude Sonnet + Exa AI
          </span>
        </div>

        {/* Hero heading */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            Research Agent
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Ask a research question. The agent will search the web, read sources, and synthesize a
            cited answer.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="flex flex-col items-center gap-2 text-center p-3 rounded-lg bg-muted/30 border">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold">Search</p>
              <p className="text-xs text-muted-foreground mt-0.5">Finds relevant sources on the web</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-center p-3 rounded-lg bg-muted/30 border">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold">Read</p>
              <p className="text-xs text-muted-foreground mt-0.5">Reads and extracts key content</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-center p-3 rounded-lg bg-muted/30 border">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold">Synthesize</p>
              <p className="text-xs text-muted-foreground mt-0.5">Writes a cited, accurate answer</p>
            </div>
          </div>
        </div>
      </header>

      <ResearchClient />
    </main>
  );
}
