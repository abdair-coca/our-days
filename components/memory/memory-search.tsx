"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { MAX_SEARCH_LENGTH } from "@/features/memories/search";
import { ButtonLink } from "@/components/ui/button-link";
import { SearchIcon, XIcon } from "@/components/ui/icons";

const CLEAR_EVENT = "our-days:clear-memory-search";

/** Clears the timeline search from elsewhere (e.g. the empty state). */
export function ClearMemorySearchLink({ href }: { href: string }) {
  return (
    <ButtonLink
      href={href}
      onClick={() => window.dispatchEvent(new Event(CLEAR_EVENT))}
      scroll={false}
      variant="secondary"
    >
      Limpiar búsqueda
    </ButtonLink>
  );
}

/** Updates ?q= as people type; the server filters, the year chip is kept. */
export function MemorySearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<number | undefined>(undefined);

  function navigate(next: string) {
    window.clearTimeout(timer.current);
    const params = new URLSearchParams(searchParams.toString());
    const query = next.trim();
    if (query) params.set("q", query);
    else params.delete("q");
    const search = params.toString();
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    });
  }

  function update(next: string) {
    setValue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => navigate(next), 250);
  }

  // "/" jumps to search from anywhere on the timeline, like most search UIs.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      input.current?.focus();
    }
    function onClear() {
      window.clearTimeout(timer.current);
      setValue("");
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(CLEAR_EVENT, onClear);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(CLEAR_EVENT, onClear);
      window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <search className="mb-5">
      <label className="memory-search" data-pending={isPending || undefined}>
        <SearchIcon aria-hidden="true" className="memory-search-icon" size={18} />
        <span className="sr-only">Buscar recuerdos</span>
        <input
          autoComplete="off"
          enterKeyHint="search"
          maxLength={MAX_SEARCH_LENGTH}
          onChange={(event) => update(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && value) {
              event.preventDefault();
              setValue("");
              navigate("");
            } else if (event.key === "Enter") {
              event.preventDefault();
              navigate(value);
            }
          }}
          placeholder="Buscar por título, historia, canción o fecha"
          ref={input}
          type="search"
          value={value}
        />
        {isPending ? <span aria-hidden="true" className="memory-search-spinner" /> : null}
        {value ? (
          <button
            aria-label="Limpiar búsqueda"
            className="memory-search-clear"
            onClick={() => {
              setValue("");
              navigate("");
              input.current?.focus();
            }}
            type="button"
          >
            <XIcon size={16} />
          </button>
        ) : (
          <kbd aria-hidden="true" className="memory-search-key">/</kbd>
        )}
      </label>
    </search>
  );
}
