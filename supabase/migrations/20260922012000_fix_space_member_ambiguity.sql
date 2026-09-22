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
    where profiles.id = target_profile_id
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

revoke execute on function public.list_space_members(uuid) from public, anon;
revoke execute on function public.search_space_users(uuid, text) from public, anon;
revoke execute on function public.add_space_member(uuid, uuid) from public, anon;
revoke execute on function public.remove_space_member(uuid, uuid) from public, anon;

grant execute on function public.list_space_members(uuid) to authenticated;
grant execute on function public.search_space_users(uuid, text) to authenticated;
grant execute on function public.add_space_member(uuid, uuid) to authenticated;
grant execute on function public.remove_space_member(uuid, uuid) to authenticated;
