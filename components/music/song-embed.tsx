import type { SongLinkResult } from "@/features/music/song-source";

type ResolvedSongLink = Extract<SongLinkResult, { ok: true }>;

type SongEmbedProps = {
  autoplay?: boolean;
  compact?: boolean;
  fill?: boolean;
  visuallyHidden?: boolean;
  source: ResolvedSongLink;
  title: string;
};

export function SongEmbed({
  autoplay = false,
  compact = false,
  fill = false,
  visuallyHidden = false,
  source,
  title,
}: SongEmbedProps) {
  const embedUrl = autoplay
    ? `${source.embedUrl}${source.embedUrl.includes("?") ? "&" : "?"}autoplay=1&playsinline=1`
    : source.embedUrl;

  return (
    <div
      aria-hidden={visuallyHidden || undefined}
      className={
        visuallyHidden
          ? "pointer-events-none absolute left-0 top-0 size-px overflow-hidden opacity-0"
          : `${
              fill || compact ? "size-full" : "overflow-hidden"
            } rounded-[var(--radius-card)] border border-border-soft bg-surface shadow-[var(--shadow-card)]`
      }
    >
      <div
        className={`${visuallyHidden ? "pointer-events-none absolute left-0 top-0 size-px overflow-hidden opacity-0" : fill ? "size-full" : compact ? "h-20 w-full" : "aspect-video w-full"} bg-surface-soft`}
      >
        <iframe
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="size-full border-0"
          loading={visuallyHidden ? "eager" : "lazy"}
          referrerPolicy="strict-origin-when-cross-origin"
          src={embedUrl}
          tabIndex={visuallyHidden ? -1 : undefined}
          title={`Reproductor de ${title}`}
        />
      </div>
    </div>
  );
}
