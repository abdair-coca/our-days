"use client";

import { useEffect, useState } from "react";

import {
  addSpaceMemberAction,
  removeSpaceMemberAction,
  searchSpaceUsersAction,
  type SpaceMember,
  type SpaceUserSearchResult,
} from "@/features/auth/space-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, TrashIcon, UserPlusIcon } from "@/components/ui/icons";

type SpaceMembersPanelProps = {
  canManage: boolean;
  currentUserId: string;
  initialError?: string;
  initialMembers: SpaceMember[];
};

function initials(name: string): string {
  const letters = name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return letters.toUpperCase() || "?";
}

export function SpaceMembersPanel({
  canManage,
  currentUserId,
  initialError,
  initialMembers,
}: SpaceMembersPanelProps) {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpaceUserSearchResult[]>([]);
  const [searchError, setSearchError] = useState(initialError ?? "");
  const [feedback, setFeedback] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pendingProfileId, setPendingProfileId] = useState("");

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      const response = await searchSpaceUsersAction(normalizedQuery);

      if (cancelled) {
        return;
      }

      setResults(response.results);
      setSearchError(response.error);
      setIsSearching(false);
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [initialError, query]);

  async function handleAdd(result: SpaceUserSearchResult) {
    if (result.isMember || pendingProfileId) {
      return;
    }

    setPendingProfileId(result.profileId);
    setFeedback("");

    const response = await addSpaceMemberAction(result.profileId);

    setPendingProfileId("");

    if (!response.ok) {
      setSearchError(response.message);
      return;
    }

    const member = response.member ?? {
      displayName: result.displayName,
      email: result.email,
      joinedAt: new Date().toISOString(),
      profileId: result.profileId,
      role: "member" as const,
    };

    setMembers((current) =>
      current.some((item) => item.profileId === member.profileId)
        ? current
        : [...current, member],
    );
    setResults((current) =>
      current.map((item) =>
        item.profileId === result.profileId ? { ...item, isMember: true } : item,
      ),
    );
    setFeedback(response.message);
  }

  async function handleRemove(member: SpaceMember) {
    if (!canManage || member.role === "owner" || member.profileId === currentUserId) {
      return;
    }

    if (!window.confirm(`¿Quitar a ${member.displayName} de tus recuerdos?`)) {
      return;
    }

    setPendingProfileId(member.profileId);
    setFeedback("");

    const response = await removeSpaceMemberAction(member.profileId);

    setPendingProfileId("");

    if (!response.ok) {
      setFeedback(response.message);
      return;
    }

    setMembers((current) =>
      current.filter((item) => item.profileId !== member.profileId),
    );
    setResults((current) =>
      current.map((item) =>
        item.profileId === member.profileId ? { ...item, isMember: false } : item,
      ),
    );
    setFeedback(response.message);
  }

  return (
    <section className="rounded-3xl border border-ink/8 bg-card p-6 shadow-sm lg:col-span-2">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-olive uppercase">
            Espacio compartido
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold">Personas conectadas</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Estas son las personas que pueden ver y guardar recuerdos en este espacio.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-sage/15 px-3 py-1.5 text-xs font-bold tracking-wide text-sage">
          {members.length} {members.length === 1 ? "persona" : "personas"}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <Input
            helpText="Busca por nombre o correo. Escribe al menos dos caracteres."
            id="space-user-search"
            label="Añadir a este espacio"
            placeholder="Nombre o correo"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setResults([]);
              setIsSearching(event.target.value.trim().length >= 2);
              setSearchError("");
              setFeedback("");
            }}
          />

          {isSearching ? (
            <p className="mt-4 text-sm text-text-soft" role="status">
              Buscando…
            </p>
          ) : null}

          {!isSearching && query.trim().length >= 2 && !searchError && results.length === 0 ? (
            <p className="mt-4 text-sm text-text-soft">No encontramos a nadie con esa búsqueda.</p>
          ) : null}

          {(query.trim().length >= 2 ? searchError : initialError) ? (
            <p aria-live="polite" className="mt-4 text-sm font-semibold text-error" role="alert">
              {query.trim().length >= 2 ? searchError : initialError}
            </p>
          ) : null}

          {results.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface-soft">
              <ul aria-label="Resultados de personas" className="divide-y divide-border-soft">
                {results.map((result) => (
                  <li className="flex items-center gap-3 p-3" key={result.profileId}>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                      {initials(result.displayName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{result.displayName}</p>
                      <p className="truncate text-xs text-text-soft">{result.email}</p>
                    </div>
                    {result.isMember ? (
                      <span className="text-xs font-semibold text-success">Conectada</span>
                    ) : (
                      <Button
                        aria-label={`Añadir a ${result.displayName}`}
                        className="shrink-0 p-3"
                        disabled={Boolean(pendingProfileId)}
                        loading={pendingProfileId === result.profileId}
                        onClick={() => handleAdd(result)}
                        title="Añadir persona"
                        variant="secondary"
                      >
                        <UserPlusIcon size={18} />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-text">
            <SearchIcon size={17} />
            Acceso actual
          </div>
          <ul className="mt-3 grid gap-2">
            {members.map((member) => {
              const isCurrentUser = member.profileId === currentUserId;
              const canRemove = canManage && member.role !== "owner" && !isCurrentUser;

              return (
                <li
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border-soft bg-surface-soft p-3"
                  key={member.profileId}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sand/50 text-sm font-bold text-text">
                    {initials(member.displayName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate text-sm font-semibold">
                        {member.displayName}
                      </p>
                      {isCurrentUser ? (
                        <span className="text-xs text-text-soft">Tú</span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-text-soft">{member.email}</p>
                  </div>
                  <span className="hidden shrink-0 text-xs font-semibold text-text-soft sm:inline">
                    {member.role === "owner" ? "Propietaria/o" : "Miembro"}
                  </span>
                  {canRemove ? (
                    <Button
                      aria-label={`Quitar a ${member.displayName}`}
                      className="shrink-0 p-3 text-error"
                      disabled={Boolean(pendingProfileId)}
                      loading={pendingProfileId === member.profileId}
                      onClick={() => handleRemove(member)}
                      title="Quitar persona"
                      variant="quiet"
                    >
                      <TrashIcon size={18} />
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {!canManage ? (
            <p className="mt-3 text-xs leading-5 text-text-soft">
              Solo la persona propietaria puede quitar miembros del espacio.
            </p>
          ) : null}
        </div>
      </div>

      {feedback ? (
        <p aria-live="polite" className="mt-5 text-sm font-semibold text-success" role="status">
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
