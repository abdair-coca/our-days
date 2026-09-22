revoke execute on function public.list_space_members(uuid) from public, anon;
revoke execute on function public.search_space_users(uuid, text) from public, anon;
revoke execute on function public.add_space_member(uuid, uuid) from public, anon;
revoke execute on function public.remove_space_member(uuid, uuid) from public, anon;

grant execute on function public.list_space_members(uuid) to authenticated;
grant execute on function public.search_space_users(uuid, text) to authenticated;
grant execute on function public.add_space_member(uuid, uuid) to authenticated;
grant execute on function public.remove_space_member(uuid, uuid) to authenticated;
