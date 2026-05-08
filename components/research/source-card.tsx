import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

type Source = {
  url: string;
  title: string;
  snippet?: string;
};

function getHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function SourceCard({ source, index }: { source: Source; index: number }) {
  const host = getHost(source.url);
  const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=32`;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className="block hover:no-underline group"
    >
      <Card className="transition-colors hover:bg-muted/40 group-hover:border-border/80">
        <CardContent className="py-3 flex gap-3 items-start">
          <span className="text-xs text-muted-foreground font-mono mt-0.5 shrink-0">
            [{index + 1}]
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={favicon} alt="" width={16} height={16} className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
              {source.title}
            </div>
            <div className="text-xs text-muted-foreground truncate">{host}</div>
            {source.snippet && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {source.snippet}
              </div>
            )}
          </div>
          <ExternalLink
            className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        </CardContent>
      </Card>
    </a>
  );
}
