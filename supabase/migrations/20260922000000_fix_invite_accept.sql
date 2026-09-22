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
  on conflict on constraint space_members_pkey do nothing;

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
