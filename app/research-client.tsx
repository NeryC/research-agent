'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ResearchInput } from '@/components/research/research-input';
import { AgentTimeline } from '@/components/research/agent-timeline';
import { FinalAnswer } from '@/components/research/final-answer';
import { AlertCircle } from 'lucide-react';

export function ResearchClient() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/research' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const isError = status === 'error';

  return (
    <div className="space-y-6">
      <ResearchInput
        disabled={isLoading}
        onSubmit={(query: string) => sendMessage({ text: query })}
      />

      {isError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>Something went wrong while researching. Please try again.</span>
        </div>
      )}

      <div aria-live="polite" aria-atomic="false" className="space-y-6">
        <AgentTimeline messages={messages} isStreaming={isLoading} />
        <FinalAnswer messages={messages} />
      </div>
    </div>
  );
}
