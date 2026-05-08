'use client';

import { useMemo } from 'react';
import type { UIMessage } from 'ai';
import { isToolUIPart, getToolName } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SourceCard } from './source-card';
import { CheckCircle } from 'lucide-react';

type FinalAnswerInput = {
  answer: string;
  sources: Array<{ url: string; title: string; snippet?: string }>;
};

function findFinalAnswer(messages: UIMessage[]): FinalAnswerInput | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== 'assistant') continue;
    for (const part of m.parts) {
      if (!isToolUIPart(part)) continue;
      if (getToolName(part) !== 'finalAnswer') continue;
      // For tools without `execute`, state stays at 'input-available'.
      if (part.state !== 'input-available' && part.state !== 'output-available') {
        continue;
      }
      return part.input as FinalAnswerInput;
    }
  }
  return null;
}

export function FinalAnswer({ messages }: { messages: UIMessage[] }) {
  const final = useMemo(() => findFinalAnswer(messages), [messages]);
  if (!final) return null;

  return (
    <article className="space-y-4 border rounded-lg p-5 bg-card">
        {/* Research complete badge */}
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-green-600">Research complete</span>
        </div>

        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-blue-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{final.answer}</ReactMarkdown>
        </div>

        {final.sources.length > 0 && (
          <div className="space-y-2 pt-3 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Sources ({final.sources.length})
            </h3>
            <div className="space-y-2">
              {final.sources.map((s, i) => (
                <SourceCard key={s.url + i} source={s} index={i} />
              ))}
            </div>
          </div>
        )}
    </article>
  );
}
