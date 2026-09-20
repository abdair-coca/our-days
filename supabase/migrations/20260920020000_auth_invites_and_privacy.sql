create table if not exists public.space_invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  invited_email text,
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists space_invites_token_hash_idx
  on public.space_invites (token_hash);

create index if not exists space_invites_space_idx
  on public.space_invites (space_id, created_at desc);

alter table public.space_invites enable row level security;

create policy "members can read their space invites"
  on public.space_invites for select
  using (
    public.is_space_member(space_id)
    and created_by = auth.uid()
  );

create policy "members can create space invites"
  on public.space_invites for insert
  with check (
    public.is_space_member(space_id)
    and created_by = auth.uid()
  );

create policy "creators can revoke space invites"
  on public.space_invites for delete
  using (created_by = auth.uid());

create or replace function public.ensure_current_user_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_space_id uuid;
  current_email text := auth.jwt() ->> 'email';
  current_display_name text := coalesce(
    auth.jwt() -> 'user_metadata' ->> 'display_name',
    current_email
  );
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  insert into public.profiles (id, display_name)
  values (current_user_id, current_display_name)
  on conflict (id) do nothing;

  select space_id
    into current_space_id
    from public.space_members
   where profile_id = current_user_id
   order by joined_at asc
   limit 1;

  if current_space_id is null then
    insert into public.spaces (name, created_by)
    values ('Our Days', current_user_id)
    returning id into current_space_id;

    insert into public.space_members (space_id, profile_id, role)
    values (current_space_id, current_user_id, 'owner');
  end if;

  return current_space_id;
end;
$$;

create or replace function public.get_space_invite(invite_token text)
returns table (
  space_name text,
  invited_email text,
  expires_at timestamptz,
  is_valid boolean
)
language sql
security definer
set search_path = public
as $$
  select
    spaces.name,
    space_invites.invited_email,
    space_invites.expires_at,
    space_invites.accepted_at is null
      and space_invites.expires_at > now()
  from public.space_invites
  join public.spaces on spaces.id = space_invites.space_id
  where space_invites.token_hash = encode(extensions.digest(invite_token, 'sha256'), 'hex')
  limit 1;
$$;

create or replace function public.accept_space_invite(invite_token text)
returns table (
  space_id uuid,
  space_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  invite_row public.space_invites%rowtype;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select *
    into invite_row
    from public.space_invites
   where token_hash = encode(extensions.digest(invite_token, 'sha256'), 'hex')
   for update;

  if not found
    or invite_row.accepted_at is not null
    or invite_row.expires_at <= now() then
    raise exception 'invite_invalid_or_expired';
  end if;

  if invite_row.invited_email is not null
    and lower(invite_row.invited_email) <> current_email then
    raise exception 'invite_email_mismatch';
  end if;

  insert into public.space_members (space_id, profile_id, role)
  values (invite_row.space_id, current_user_id, 'member')
  on conflict (space_id, profile_id) do nothing;

  update public.space_invites
     set accepted_at = now(),
         accepted_by = current_user_id
   where id = invite_row.id;

  return query
  select spaces.id, spaces.name
    from public.spaces
   where spaces.id = invite_row.space_id;
end;
$$;

grant execute on function public.ensure_current_user_workspace() to authenticated;
grant execute on function public.get_space_invite(text) to anon, authenticated;
grant execute on function public.accept_space_invite(text) to authenticated;

do $$
declare
  auth_user record;
  existing_space_id uuid;
begin
  for auth_user in
    select id, email, raw_user_meta_data
      from auth.users
  loop
    insert into public.profiles (id, display_name)
    values (
      auth_user.id,
      coalesce(auth_user.raw_user_meta_data ->> 'display_name', auth_user.email)
    )
    on conflict (id) do nothing;

    select id
      into existing_space_id
      from public.spaces
     where created_by = auth_user.id
     order by created_at asc
     limit 1;

    if existing_space_id is null then
      insert into public.spaces (name, created_by)
      values ('Our Days', auth_user.id)
      returning id into existing_space_id;
    end if;

    insert into public.space_members (space_id, profile_id, role)
    values (existing_space_id, auth_user.id, 'owner')
    on conflict (space_id, profile_id) do nothing;
  end loop;
end;
$$;
