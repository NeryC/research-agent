'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ResearchInput } from '@/components/research/research-input';
import { AgentTimeline } from '@/components/research/agent-timeline';
import { FinalAnswer } from '@/components/research/final-answer';

export function ResearchClient() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/research' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  return (
    <div className="space-y-6">
      <ResearchInput
        disabled={isLoading}
        onSubmit={(query: string) => sendMessage({ text: query })}
      />
      <AgentTimeline messages={messages} />
      <FinalAnswer messages={messages} />
    </div>
  );
}
