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

  select current_members.space_id
    into current_space_id
    from public.space_members as current_members
   where current_members.profile_id = current_user_id
   order by
     case when current_members.role = 'member' then 0 else 1 end,
     (
       select count(*)
       from public.memories
       where memories.space_id = current_members.space_id
     ) desc,
     (
       select count(*)
       from public.space_members as space_members
       where space_members.space_id = current_members.space_id
     ) desc,
     current_members.joined_at asc
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
