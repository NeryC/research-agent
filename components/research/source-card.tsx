import { Card, CardContent } from '@/components/ui/card';

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
      className="block hover:no-underline"
    >
      <Card className="hover:bg-muted/40 transition-colors">
        <CardContent className="py-3 flex gap-3 items-start">
          <span className="text-xs text-muted-foreground font-mono mt-0.5">[{index + 1}]</span>
          <img src={favicon} alt="" width={16} height={16} className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{source.title}</div>
            <div className="text-xs text-muted-foreground truncate">{host}</div>
            {source.snippet && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {source.snippet}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
