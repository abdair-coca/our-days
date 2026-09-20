import Link from "next/link";

import { formatMemoryDate } from "@/lib/utils/format-memory-date";
import type { Memory } from "@/types/memory";

type MemoryCardProps = {
  memory: Memory;
  priority?: boolean;
};

export function MemoryCard({ memory, priority = false }: MemoryCardProps) {
  const cover = memory.photos[0];

  return (
    <article className="group h-full overflow-hidden rounded-3xl border border-ink/8 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link
        className="block h-full rounded-3xl focus-visible:outline-offset-4"
        href={`/memories/${memory.id}`}
        prefetch={priority}
      >
        <div
          aria-label={cover?.alt ?? "Recuerdo sin imagen"}
          className="aspect-[4/3] w-full bg-[#eadfd7] transition duration-300 group-hover:scale-[1.015]"
          role="img"
          style={{ backgroundImage: cover?.gradient }}
        />
        <div className="p-5">
          <time
            className="text-xs font-bold tracking-[0.14em] text-blush-dark uppercase"
            dateTime={memory.memoryDate}
          >
            {formatMemoryDate(memory.memoryDate)}
          </time>
          <h2 className="mt-2 font-serif text-2xl leading-tight font-semibold">
            {memory.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
            {memory.description}
          </p>
        </div>
      </Link>
    </article>
  );
}
