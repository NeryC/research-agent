import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ToolState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error';

type Props = {
  toolName: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  state: ToolState;
};

const STATE_LABELS: Record<ToolState, string> = {
  'input-streaming': 'Streaming',
  'input-available': 'Calling',
  'output-available': 'Done',
  'output-error': 'Error',
};

const STATE_COLORS: Record<ToolState, string> = {
  'input-streaming': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'input-available': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'output-available': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'output-error': 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function ToolCallCard({
  toolName,
  input,
  output,
  errorText,
  state,
}: Props) {
  return (
    <Card className="border-l-4 border-l-blue-500/40">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center justify-between font-mono">
          <span>{toolName}</span>
          <Badge className={STATE_COLORS[state]}>{STATE_LABELS[state]}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-2 text-xs">
        {input !== undefined && (
          <pre className="bg-muted/40 rounded p-2 overflow-x-auto">
            {JSON.stringify(input, null, 2)}
          </pre>
        )}
        {output !== undefined && (
          <pre className="bg-muted/40 rounded p-2 overflow-x-auto max-h-48">
            {JSON.stringify(output, null, 2)}
          </pre>
        )}
        {errorText && (
          <pre className="bg-red-500/10 text-red-600 dark:text-red-400 rounded p-2 overflow-x-auto">
            {errorText}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
