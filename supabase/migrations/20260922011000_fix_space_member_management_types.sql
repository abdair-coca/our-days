create or replace function public.list_space_members(target_space_id uuid)
returns table (
  profile_id uuid,
  display_name text,
  email text,
  role text,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_space_member(target_space_id) then
    raise exception 'space_access_denied';
  end if;

  return query
  select
    profiles.id,
    coalesce(nullif(profiles.display_name, ''), users.email::text),
    users.email::text,
    space_members.role,
    space_members.joined_at
  from public.space_members
  join public.profiles
    on profiles.id = space_members.profile_id
  join auth.users
    on users.id = space_members.profile_id
  where space_members.space_id = target_space_id
  order by
    case when space_members.role = 'owner' then 0 else 1 end,
    space_members.joined_at asc;
end;
$$;

create or replace function public.search_space_users(
  target_space_id uuid,
  search_query text
)
returns table (
  profile_id uuid,
  display_name text,
  email text,
  is_member boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_query text := lower(trim(search_query));
begin
  if not public.is_space_member(target_space_id) then
    raise exception 'space_access_denied';
  end if;

  if char_length(normalized_query) < 2 then
    return;
  end if;

  return query
  select
    profiles.id,
    coalesce(nullif(profiles.display_name, ''), users.email::text),
    users.email::text,
    space_members.profile_id is not null
  from auth.users
  join public.profiles
    on profiles.id = users.id
  left join public.space_members
    on space_members.profile_id = users.id
   and space_members.space_id = target_space_id
  where users.deleted_at is null
    and users.email_confirmed_at is not null
    and (
      lower(coalesce(users.email, '')) like '%' || normalized_query || '%'
      or lower(coalesce(profiles.display_name, '')) like '%' || normalized_query || '%'
    )
  order by
    case when space_members.profile_id is not null then 0 else 1 end,
    coalesce(profiles.display_name, users.email),
    users.email
  limit 10;
end;
$$;

create or replace function public.add_space_member(
  target_space_id uuid,
  target_profile_id uuid
)
returns table (
  profile_id uuid,
  display_name text,
  email text,
  role text,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_space_member(target_space_id) then
    raise exception 'space_access_denied';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = target_profile_id
  ) then
    raise exception 'user_not_found';
  end if;

  if exists (
    select 1
    from public.space_members
    where space_members.space_id = target_space_id
      and space_members.profile_id = target_profile_id
  ) then
    raise exception 'user_already_member';
  end if;

  insert into public.space_members (space_id, profile_id, role)
  values (target_space_id, target_profile_id, 'member');

  return query
  select
    profiles.id,
    coalesce(nullif(profiles.display_name, ''), users.email::text),
    users.email::text,
    space_members.role,
    space_members.joined_at
  from public.space_members
  join public.profiles
    on profiles.id = space_members.profile_id
  join auth.users
    on users.id = space_members.profile_id
  where space_members.space_id = target_space_id
    and space_members.profile_id = target_profile_id;
end;
$$;
