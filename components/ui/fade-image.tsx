"use client";

/* Signed Supabase URLs are private and dynamic, so native loading is intentional. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useState, type CSSProperties, type ImgHTMLAttributes } from "react";

import type { MemoryPhoto } from "@/types/memory";
import { classNames } from "@/lib/utils/class-names";

/** Paints a photo's tiny preview behind it; nothing when it has none. */
export function placeholderStyle(photo?: Pick<MemoryPhoto, "placeholder" | "src">): CSSProperties | undefined {
  return photo?.src && photo.placeholder
    ? { backgroundImage: `url(${photo.placeholder})`, backgroundPosition: "center", backgroundSize: "cover" }
    : undefined;
}

/**
 * An image that fades in over its placeholder once decoded. Images already
 * complete when hydrated (cache, eager loads) never flicker or hide.
 */
export function FadeImage({ className, onLoad, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [state, setState] = useState<"initial" | "pending" | "loaded">("initial");
  const attach = useCallback((image: HTMLImageElement | null) => {
    if (!image) return;
    setState((current) =>
      current !== "initial" ? current : image.complete && image.naturalWidth > 0 ? "loaded" : "pending",
    );
  }, []);
  return (
    <img
      {...props}
      alt={props.alt ?? ""}
      className={classNames("fade-image", className)}
      data-state={state}
      onLoad={(event) => {
        setState("loaded");
        onLoad?.(event);
      }}
      ref={attach}
    />
  );
}
