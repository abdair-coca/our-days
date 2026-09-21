import type { SongLinkResult } from "@/features/music/song-source";

type ResolvedSongLink = Extract<SongLinkResult, { ok: true }>;

type SongEmbedProps = {
  autoplay?: boolean;
  fill?: boolean;
  source: ResolvedSongLink;
  title: string;
};

export function SongEmbed({ autoplay = false, fill = false, source, title }: SongEmbedProps) {
  const embedUrl = autoplay
    ? `${source.embedUrl}${source.embedUrl.includes("?") ? "&" : "?"}autoplay=1&playsinline=1`
    : source.embedUrl;

  return (
    <div
      className={`${
        fill ? "size-full" : "overflow-hidden"
      } rounded-[var(--radius-card)] border border-border-soft bg-surface shadow-[var(--shadow-card)]`}
    >
      <div className={`${fill ? "size-full" : "aspect-video w-full"} bg-surface-soft`}>
        <iframe
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="size-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={embedUrl}
          title={`Reproductor de ${title}`}
        />
      </div>
    </div>
  );
}
