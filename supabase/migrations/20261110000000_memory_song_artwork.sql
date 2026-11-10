-- Cover art for songs whose provider has no deterministic thumbnail (Spotify).
-- Filled from the provider's official oEmbed response when a song is saved.
-- Nullable and additive: older rows keep generative artwork, and the app keeps
-- working (without saving artwork) if it is deployed before this migration.
alter table public.memory_songs
  add column if not exists artwork_url text;

alter table public.memory_songs
  drop constraint if exists memory_songs_artwork_url_check;

alter table public.memory_songs
  add constraint memory_songs_artwork_url_check
  check (
    artwork_url is null
    or (char_length(artwork_url) <= 500 and artwork_url like 'https://%')
  );
