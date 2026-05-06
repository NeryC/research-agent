import type { UIMessage } from 'ai';
import { isToolUIPart, getToolName } from 'ai';
import { ToolCallCard } from './tool-call-card';

type Props = { messages: UIMessage[] };

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

export function AgentTimeline({ messages }: Props) {
  const items: React.ReactNode[] = [];

  for (const msg of messages) {
    if (msg.role !== 'assistant') continue;
    for (const part of msg.parts) {
      if (!isToolUIPart(part)) continue;
      const toolName = getToolName(part);
      // skip the finalAnswer tool — it's rendered separately
      if (toolName === 'finalAnswer') continue;
      if (!isRenderableState(part.state)) continue;

      items.push(
        <ToolCallCard
          key={part.toolCallId}
          toolName={toolName}
          input={part.input}
          output={part.state === 'output-available' ? part.output : undefined}
          errorText={
            part.state === 'output-error' ? part.errorText : undefined
          }
          state={part.state}
        />,
      );
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">Agent steps</h2>
      <div className="space-y-2">{items}</div>
    </div>
  );
}
