'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const MAX_LENGTH = 2000;
const CHAR_COUNTER_THRESHOLD = 0.8;

const SUGGESTIONS = [
  'What are the latest features in Next.js 16?',
  'How does Vercel AI Gateway compare to LiteLLM?',
  'What are best practices for prompt caching with Claude in 2026?',
];

type Props = {
  disabled?: boolean;
  onSubmit: (query: string) => void;
};

export function ResearchInput({ disabled, onSubmit }: Props) {
  const [value, setValue] = useState('');

  const charsRemaining = MAX_LENGTH - value.length;
  const showCounter = value.length >= MAX_LENGTH * CHAR_COUNTER_THRESHOLD;

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          placeholder="e.g. What are the differences between pgvector and Pinecone?"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={3}
          disabled={disabled}
          maxLength={MAX_LENGTH}
          className="resize-none pr-3"
        />
        {showCounter && (
          <span
            className={`absolute bottom-2 right-3 text-xs tabular-nums ${
              charsRemaining <= 100 ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {charsRemaining}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={submit} disabled={disabled || !value.trim()} className="gap-2">
          {disabled ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              Researching...
            </>
          ) : (
            'Research'
          )}
        </Button>
        <span className="text-xs text-muted-foreground ml-2">(Ctrl/Cmd + Enter)</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => {
              onSubmit(s);
            }}
            className="text-xs px-2 py-1 rounded border bg-muted/40 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
