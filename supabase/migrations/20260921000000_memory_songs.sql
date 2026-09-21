create table if not exists public.memory_songs (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  added_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 100),
  artist text not null default '' check (char_length(artist) <= 100),
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memory_songs_memory_url_key unique (memory_id, url)
);

create index if not exists memory_songs_memory_order_idx
  on public.memory_songs (memory_id, created_at asc, id asc);

create index if not exists memory_songs_created_at_idx
  on public.memory_songs (created_at asc);

insert into public.memory_songs (memory_id, added_by, title, artist, url)
select
  memories.id,
  memories.created_by,
  left(coalesce(nullif(trim(memories.song_title), ''), 'Untitled'), 100),
  left(coalesce(nullif(trim(memories.song_artist), ''), ''), 100),
  coalesce(nullif(trim(memories.song_url), ''), '')
from public.memories
where (
  nullif(trim(memories.song_title), '') is not null
  or nullif(trim(memories.song_artist), '') is not null
  or nullif(trim(memories.song_url), '') is not null
)
and not exists (
  select 1
  from public.memory_songs
  where memory_songs.memory_id = memories.id
    and memory_songs.url = coalesce(nullif(trim(memories.song_url), ''), '')
);

alter table public.memory_songs enable row level security;

create policy "members can read memory songs"
  on public.memory_songs for select
  using (
    exists (
      select 1
      from public.memories
      where memories.id = memory_songs.memory_id
        and public.is_space_member(memories.space_id)
    )
  );

create policy "members can add memory songs"
  on public.memory_songs for insert
  with check (
    added_by = auth.uid()
    and exists (
      select 1
      from public.memories
      where memories.id = memory_songs.memory_id
        and public.is_space_member(memories.space_id)
    )
  );

create policy "members can update memory songs"
  on public.memory_songs for update
  using (
    exists (
      select 1
      from public.memories
      where memories.id = memory_songs.memory_id
        and public.is_space_member(memories.space_id)
    )
  )
  with check (
    exists (
      select 1
      from public.memories
      where memories.id = memory_songs.memory_id
        and public.is_space_member(memories.space_id)
    )
  );

create policy "members can delete memory songs"
  on public.memory_songs for delete
  using (
    exists (
      select 1
      from public.memories
      where memories.id = memory_songs.memory_id
        and public.is_space_member(memories.space_id)
    )
  );
