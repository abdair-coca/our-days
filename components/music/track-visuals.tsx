"use client";

/* Provider thumbnails are remote and tiny; next/image would add a proxy hop. */
/* eslint-disable @next/next/no-img-element */

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { MusicTrack } from "@/features/music/library";
import { classNames } from "@/lib/utils/class-names";

type ArtworkTrack = Pick<MusicTrack, "title" | "source"> | null | undefined;

/* Warm pairs taken from the scrapbook palette, never neon. */
const palettePairs = [
  ["#b86552", "#e7c8be"],
  ["#798069", "#e3d3bd"],
  ["#9e4b3d", "#d9aaa0"],
  ["#6f5b6e", "#e2bfb5"],
  ["#4f6466", "#d8c5ae"],
  ["#b48248", "#f2e8dd"],
] as const;

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

/** Same media → same colours, wherever the song is saved. */
export function trackPalette(track: ArtworkTrack): CSSProperties {
  const seed = track ? `${track.source.provider}:${track.source.id}` : "our-days";
  const value = hash(seed);
  const [a, b] = palettePairs[value % palettePairs.length];
  return {
    "--art-a": a,
    "--art-b": b,
    "--art-angle": `${(value >> 4) % 360}deg`,
  } as CSSProperties;
}

function thumbnail(track: ArtworkTrack) {
  return track?.source.provider === "youtube"
    ? `https://i.ytimg.com/vi/${encodeURIComponent(track.source.id)}/mqdefault.jpg`
    : null;
}

function initial(track: ArtworkTrack) {
  return (track?.title.trim()[0] ?? "♪").toUpperCase();
}

/** Remote art when the provider offers it, generative paper art otherwise. */
function ArtFill({ track, showInitial }: { track: ArtworkTrack; showInitial: boolean }) {
  const src = thumbnail(track);
  const [failed, setFailed] = useState<string | null>(null);
  const usable = src && failed !== src;
  return (
    <>
      {usable ? (
        <img
          alt=""
          className="track-art-image"
          decoding="async"
          draggable={false}
          loading="lazy"
          onError={() => setFailed(src)}
          referrerPolicy="no-referrer"
          src={src}
        />
      ) : showInitial ? (
        <span className="track-art-initial">{initial(track)}</span>
      ) : null}
    </>
  );
}

export function TrackCover({
  className,
  size,
  track,
}: {
  className?: string;
  size: number;
  track: ArtworkTrack;
}) {
  return (
    <span
      aria-hidden="true"
      className={classNames("track-cover", className)}
      style={{ ...trackPalette(track), "--art-size": `${size}px` } as CSSProperties}
    >
      <ArtFill showInitial={size >= 32} track={track} />
    </span>
  );
}

export function Vinyl({
  className,
  size,
  spinning,
  track,
}: {
  className?: string;
  size: number;
  spinning: boolean;
  track: ArtworkTrack;
}) {
  return (
    <span
      aria-hidden="true"
      className={classNames("vinyl", className)}
      data-spinning={spinning}
      style={{ ...trackPalette(track), "--art-size": `${size}px` } as CSSProperties}
    >
      <span className="vinyl-disc">
        <span className="vinyl-label">
          <ArtFill showInitial={size >= 96} track={track} />
        </span>
      </span>
      <span className="vinyl-sheen" />
    </span>
  );
}

export function Equalizer({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={classNames("equalizer", className)} data-active={active}>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/** Play and pause share one slot and morph instead of swapping abruptly. */
export function PlayPauseGlyph({ playing, size = 20 }: { playing: boolean; size?: number }) {
  return (
    <span aria-hidden="true" className="play-glyph" data-playing={playing} style={{ width: size, height: size }}>
      <svg className="play-glyph-play" height={size} viewBox="0 0 24 24" width={size}>
        <path d="M8 5.4c0-.9 1-1.5 1.8-1l9.6 6.1c.7.5.7 1.5 0 2L9.8 18.6c-.8.5-1.8-.1-1.8-1V5.4Z" fill="currentColor" />
      </svg>
      <svg className="play-glyph-pause" height={size} viewBox="0 0 24 24" width={size}>
        <rect fill="currentColor" height="14" rx="1.6" width="4.2" x="6.4" y="5" />
        <rect fill="currentColor" height="14" rx="1.6" width="4.2" x="13.4" y="5" />
      </svg>
    </span>
  );
}

export function ProgressRing({
  progress,
  size,
  stroke = 2.5,
}: {
  progress: number;
  size: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  return (
    <svg aria-hidden="true" className="progress-ring" height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
      <circle className="progress-ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
      <circle
        className="progress-ring-value"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - value)}
        strokeWidth={stroke}
      />
    </svg>
  );
}

/** Long titles glide once in a while instead of hiding behind an ellipsis. */
export function MarqueeText({
  children,
  className,
  run,
}: {
  children: ReactNode;
  className?: string;
  run: boolean;
}) {
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);
  useLayoutEffect(() => {
    const element = outer.current;
    const content = inner.current;
    if (!element || !content || typeof ResizeObserver === "undefined") return;
    const measure = () => setShift(Math.max(0, content.scrollWidth - element.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children]);
  return (
    <span
      className={classNames("marquee", className)}
      data-overflow={shift > 4}
      data-run={run && shift > 4}
      ref={outer}
      style={{ "--marquee-shift": `-${shift}px`, "--marquee-duration": `${Math.max(6, shift / 18)}s` } as CSSProperties}
    >
      <span className="marquee-inner" ref={inner}>
        {children}
      </span>
    </span>
  );
}
