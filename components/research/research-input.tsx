'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Ask a research question..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
        }}
        rows={3}
        disabled={disabled}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={submit} disabled={disabled || !value.trim()}>
          {disabled ? 'Researching...' : 'Research'}
        </Button>
        <span className="text-xs text-muted-foreground ml-2">
          (Ctrl/Cmd + Enter)
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => setValue(s)}
            className="text-xs px-2 py-1 rounded border bg-muted/40 hover:bg-muted disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
