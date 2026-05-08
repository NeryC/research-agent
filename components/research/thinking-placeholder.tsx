/**
 * ThinkingPlaceholder — shown while the agent is working but no tool cards
 * have arrived yet. Three shimmer skeleton cards mimic the shape of ToolCallCard.
 */
export function ThinkingPlaceholder() {
  return (
    <div className="space-y-3 animate-fade-in" aria-label="Agent thinking…">
      <div className="flex items-center gap-2">
        {/* Pulsing dot to indicate live activity */}
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
        </span>
        <span className="text-xs text-muted-foreground font-medium">Agent is working…</span>
      </div>

      {/* Three skeleton cards — staggered delay for a cascading feel */}
      {[0, 150, 300].map((delay) => (
        <div
          key={delay}
          className="skeleton rounded-xl border border-white/5"
          style={{
            height: '60px',
            // animationDelay cannot be expressed as a Tailwind class with a dynamic value;
            // inline style is intentional, not an oversight.
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
    </div>
  )
}
