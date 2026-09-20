create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.space_members (
  space_id uuid not null references public.spaces(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (space_id, profile_id)
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 2 and 80),
  description text not null check (char_length(description) between 10 and 1200),
  memory_date date not null,
  song_title text,
  song_artist text,
  song_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  storage_path text,
  visual_value text,
  alt_text text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create index if not exists memories_space_date_idx
  on public.memories (space_id, memory_date desc, created_at desc);

create index if not exists memory_photos_memory_order_idx
  on public.memory_photos (memory_id, sort_order asc);

create or replace function public.is_space_member(target_space_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.space_members
    where space_id = target_space_id
      and profile_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  personal_space_id uuid;
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email))
  on conflict (id) do nothing;

  select id
    into personal_space_id
    from public.spaces
   where created_by = new.id
   order by created_at asc
   limit 1;

  if personal_space_id is null then
    insert into public.spaces (name, created_by)
    values ('Our Days', new.id)
    returning id into personal_space_id;
  end if;

  insert into public.space_members (space_id, profile_id, role)
  values (personal_space_id, new.id, 'owner')
  on conflict (space_id, profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.memories enable row level security;
alter table public.memory_photos enable row level security;

create policy "profiles are visible to their spaces"
  on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.space_members viewer_membership
      join public.space_members profile_membership
        on profile_membership.space_id = viewer_membership.space_id
      where viewer_membership.profile_id = auth.uid()
        and profile_membership.profile_id = profiles.id
    )
  );

create policy "users can create their profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "members can read their spaces"
  on public.spaces for select
  using (public.is_space_member(id));

create policy "memberships are visible inside a space"
  on public.space_members for select
  using (public.is_space_member(space_id));

create policy "members can read memories"
  on public.memories for select
  using (public.is_space_member(space_id));

create policy "members can create memories"
  on public.memories for insert
  with check (
    public.is_space_member(space_id)
    and created_by = auth.uid()
  );

create policy "members can update memories"
  on public.memories for update
  using (public.is_space_member(space_id))
  with check (public.is_space_member(space_id));

create policy "members can delete memories"
  on public.memories for delete
  using (public.is_space_member(space_id));

create policy "members can read memory photos"
  on public.memory_photos for select
  using (
    exists (
      select 1
      from public.memories
      where memories.id = memory_photos.memory_id
        and public.is_space_member(memories.space_id)
    )
  );

create policy "members can manage memory photos"
  on public.memory_photos for all
  using (
    exists (
      select 1
      from public.memories
      where memories.id = memory_photos.memory_id
        and public.is_space_member(memories.space_id)
    )
  )
  with check (
    exists (
      select 1
      from public.memories
      where memories.id = memory_photos.memory_id
        and public.is_space_member(memories.space_id)
    )
  );
