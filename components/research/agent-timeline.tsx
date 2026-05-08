import type { UIMessage } from 'ai';
import { isToolUIPart, getToolName } from 'ai';
import { ToolCallCard } from './tool-call-card';
import { Loader2 } from 'lucide-react';

type Props = { messages: UIMessage[]; isStreaming?: boolean };

const RENDERABLE_STATES = new Set([
  'input-streaming',
  'input-available',
  'output-available',
  'output-error',
] as const);

type RenderableState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error';

function isRenderableState(state: string): state is RenderableState {
  return RENDERABLE_STATES.has(state as RenderableState);
}

export function AgentTimeline({ messages, isStreaming }: Props) {
  const items: React.ReactNode[] = [];

  for (const msg of messages) {
    if (msg.role !== 'assistant') continue;
    for (const part of msg.parts) {
      if (!isToolUIPart(part)) continue;
      const toolName = getToolName(part);
      // skip the finalAnswer tool — rendered separately
      if (toolName === 'finalAnswer') continue;
      if (!isRenderableState(part.state)) continue;

      items.push(
        <ToolCallCard
          key={part.toolCallId}
          toolName={toolName}
          input={part.input}
          output={part.state === 'output-available' ? part.output : undefined}
          errorText={part.state === 'output-error' ? part.errorText : undefined}
          state={part.state}
        />,
      );
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Agent steps
        </h2>
        {isStreaming && (
          <Loader2
            className="w-3.5 h-3.5 animate-spin text-muted-foreground"
            aria-label="Running"
          />
        )}
        <span className="text-xs text-muted-foreground font-mono">({items.length})</span>
      </div>
      <div className="space-y-2">{items}</div>
    </div>
  );
}
