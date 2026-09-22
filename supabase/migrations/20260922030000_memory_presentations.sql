alter table public.space_members
  add column if not exists welcome_seen_at timestamptz;

create table if not exists public.memory_views (
  memory_id uuid not null references public.memories(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  seen_at timestamptz not null default now(),
  primary key (memory_id, profile_id)
);

create index if not exists memory_views_profile_seen_idx
  on public.memory_views (profile_id, seen_at desc);

create index if not exists memory_views_memory_idx
  on public.memory_views (memory_id);

update public.space_members
   set welcome_seen_at = coalesce(welcome_seen_at, now());

insert into public.memory_views (memory_id, profile_id)
select memories.id, space_members.profile_id
from public.memories
join public.space_members
  on space_members.space_id = memories.space_id
on conflict (memory_id, profile_id) do nothing;

alter table public.memory_views enable row level security;

create policy "members can read their own memory views"
  on public.memory_views for select
  using (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.memories
      where memories.id = memory_views.memory_id
        and public.is_space_member(memories.space_id)
    )
  );

create policy "members can create their own memory views"
  on public.memory_views for insert
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.memories
      where memories.id = memory_views.memory_id
        and public.is_space_member(memories.space_id)
    )
  );

create or replace function public.start_memory_welcome(target_space_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  update public.space_members
     set welcome_seen_at = coalesce(welcome_seen_at, now())
   where space_id = target_space_id
     and profile_id = auth.uid();

  if not found then
    raise exception 'space_access_denied';
  end if;

  return true;
end;
$$;

create or replace function public.mark_memory_seen(target_memory_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_space_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  select memories.space_id
    into target_space_id
    from public.memories
   where memories.id = target_memory_id;

  if target_space_id is null or not public.is_space_member(target_space_id) then
    raise exception 'memory_access_denied';
  end if;

  insert into public.memory_views (memory_id, profile_id, seen_at)
  values (target_memory_id, auth.uid(), now())
  on conflict (memory_id, profile_id)
  do update set seen_at = excluded.seen_at;

  return true;
end;
$$;

revoke execute on function public.start_memory_welcome(uuid) from public, anon;
revoke execute on function public.mark_memory_seen(uuid) from public, anon;

grant execute on function public.start_memory_welcome(uuid) to authenticated;
grant execute on function public.mark_memory_seen(uuid) to authenticated;
