'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  'input-streaming': 'bg-amber-500/10 text-amber-600',
  'input-available': 'bg-blue-500/10 text-blue-600',
  'output-available': 'bg-green-500/10 text-green-600',
  'output-error': 'bg-red-500/10 text-red-600',
};

const TOOL_LABELS: Record<string, string> = {
  searchWeb: 'Searching the web',
  readPage: 'Reading page',
  search: 'Searching the web',
  read: 'Reading page',
  fetch: 'Fetching page',
};

function getToolLabel(name: string): string {
  return TOOL_LABELS[name] ?? name;
}

function getSubtitle(toolName: string, input: unknown): string | null {
  if (!input || typeof input !== 'object') return null;
  const inp = input as Record<string, unknown>;
  if (toolName === 'searchWeb' || toolName === 'search') {
    const query = inp.query ?? inp.q ?? inp.search;
    if (typeof query === 'string') return query;
  }
  if (toolName === 'readPage' || toolName === 'read' || toolName === 'fetch') {
    const url = inp.url ?? inp.href;
    if (typeof url === 'string') return url;
  }
  return null;
}

const ACTIVE_STATES = new Set<ToolState>(['input-streaming', 'input-available']);

export function ToolCallCard({ toolName, input, output, errorText, state }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isActive = ACTIVE_STATES.has(state);
  const subtitle = getSubtitle(toolName, input);
  const hasDetails = output !== undefined || errorText !== undefined || input !== undefined;

  return (
    <Card className="border-l-4 border-l-indigo-500/40 overflow-hidden animate-slide-up">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Animated pulse for active states */}
            {isActive && (
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
            )}
            <div className="min-w-0">
              <span className="font-medium not-italic">{getToolLabel(toolName)}</span>
              {subtitle && (
                <p className="text-xs text-muted-foreground font-normal truncate mt-0.5 font-mono">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={STATE_COLORS[state]}>{STATE_LABELS[state]}</Badge>
            {hasDetails && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={expanded ? 'Collapse details' : 'Expand details'}
              >
                {expanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {expanded && hasDetails && (
        <CardContent className="py-2 space-y-2 text-xs border-t">
          {input !== undefined && (
            <div>
              <p className="text-muted-foreground mb-1 font-semibold uppercase tracking-wide text-[10px]">
                Input
              </p>
              <pre className="bg-muted/40 rounded p-2 overflow-x-auto">
                {JSON.stringify(input, null, 2)}
              </pre>
            </div>
          )}
          {output !== undefined && (
            <div>
              <p className="text-muted-foreground mb-1 font-semibold uppercase tracking-wide text-[10px]">
                Output
              </p>
              <pre className="bg-muted/40 rounded p-2 overflow-x-auto max-h-48">
                {JSON.stringify(output, null, 2)}
              </pre>
            </div>
          )}
          {errorText && (
            <pre className="bg-red-500/10 text-red-600 rounded p-2 overflow-x-auto">
              {errorText}
            </pre>
          )}
        </CardContent>
      )}
    </Card>
  );
}
