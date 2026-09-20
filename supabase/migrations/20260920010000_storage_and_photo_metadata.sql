alter table public.memory_photos
  add column if not exists mime_type text,
  add column if not exists byte_size bigint,
  add column if not exists width integer,
  add column if not exists height integer;

insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', false)
on conflict (id) do update set public = excluded.public;

create policy "members can read memory photo objects"
  on storage.objects for select
  using (
    bucket_id = 'memory-photos'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  );

create policy "members can upload memory photo objects"
  on storage.objects for insert
  with check (
    bucket_id = 'memory-photos'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  );

create policy "members can update memory photo objects"
  on storage.objects for update
  using (
    bucket_id = 'memory-photos'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  )
  with check (
    bucket_id = 'memory-photos'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  );

create policy "members can delete memory photo objects"
  on storage.objects for delete
  using (
    bucket_id = 'memory-photos'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  );
