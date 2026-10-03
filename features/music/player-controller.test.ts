import { describe, expect, it, vi } from "vitest";
import {
  buildMusicLibrary,
  isPrivateMusicPath,
  type MusicTrack,
} from "./library";
import {
  MusicPlayerController,
  type PlaybackAdapter,
} from "./player-controller";
import type { Memory } from "../../types/memory";

function memory(id: string, urls: string[]): Memory {
  return {
    id,
    title: id,
    memoryDate: "2026-10-03",
    description: "",
    createdBy: "",
    photos: [],
    songs: urls.map((url, index) => ({
      id: String(index),
      title: `Song ${index}`,
      artist: "Artist",
      addedAt: "",
      addedBy: "",
      url,
    })),
  };
}
const youtube = "https://www.youtube.com/watch?v=M7lc1UVf-VE";
const spotify = "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC";
function setup() {
  const tracks = buildMusicLibrary([
    memory("recent", [youtube, spotify]),
    memory("older", [youtube]),
  ]);
  const player = new MusicPlayerController();
  player.setLibrary("user:space", tracks);
  return { player, tracks };
}
function fakeAdapter(): PlaybackAdapter {
  return { play: vi.fn(), pause: vi.fn(), seek: vi.fn(), destroy: vi.fn() };
}
function confirmPlaying(player: MusicPlayerController, position = 0) {
  player.report(player.getSnapshot().request, {
    status: "playing",
    position,
    duration: 100,
  });
}

describe("authorized music queue", () => {
  it("retains catalog/song order and duplicate media in different memories, omits homepages", () => {
    const tracks = buildMusicLibrary([
      memory("recent", [spotify, "https://youtube.com", youtube]),
      memory("older", [youtube]),
    ]);
    expect(tracks.map((track) => track.key)).toEqual([
      "recent:0",
      "recent:2",
      "older:0",
    ]);
    expect(tracks[1].source).toEqual(tracks[2].source);
    expect(tracks[1].memoryTitle).toBe("recent");
    expect(
      buildMusicLibrary([
        memory("demo", [
          "https://open.spotify.com",
          "https://music.youtube.com",
        ]),
      ]),
    ).toEqual([]);
  });
  it("enables only explicit private routes including replay", () => {
    expect(
      ["/", "/memories/new", "/presentations", "/settings"].every(
        isPrivateMusicPath,
      ),
    ).toBe(true);
    expect(
      ["/login", "/auth/confirm", "/invite/abc", "/presentations/public"].some(
        isPrivateMusicPath,
      ),
    ).toBe(false);
  });
  it("never wraps and advances only on confirmed end", () => {
    const { player, tracks } = setup();
    player.select(tracks[0].key);
    player.next(-1);
    expect(player.getSnapshot().track?.key).toBe(tracks[0].key);
    player.report(player.getSnapshot().request, {
      status: "paused",
      position: 100,
      duration: 100,
    });
    expect(player.getSnapshot().track?.key).toBe(tracks[0].key);
    player.report(player.getSnapshot().request, { status: "ended" });
    expect(player.getSnapshot().track?.key).toBe(tracks[1].key);
    player.next();
    player.next();
    expect(player.getSnapshot().track?.key).toBe(tracks[2].key);
    player.report(player.getSnapshot().request, { status: "ended" });
    expect(player.getSnapshot()).toMatchObject({
      status: "ended",
      wantsPlay: false,
    });
  });
});

describe("single playback owner", () => {
  it("select waits for provider readiness and playing confirmation; native resume remains usable", () => {
    const { player, tracks } = setup();
    const adapter = fakeAdapter();
    player.select(tracks[0].key);
    expect(player.getSnapshot().status).toBe("loading");
    player.bind(player.getSnapshot().request, adapter);
    expect(adapter.play).toHaveBeenCalledOnce();
    expect(player.getSnapshot().status).toBe("loading");
    confirmPlaying(player);
    player.pause();
    expect(adapter.pause).toHaveBeenCalledOnce();
    player.report(player.getSnapshot().request, { status: "paused" });
    confirmPlaying(player);
    expect(player.getSnapshot().status).toBe("playing");
  });
  it("a pause while loading wins when adapter binds; stale events cannot affect replacement", () => {
    const { player, tracks } = setup();
    const adapter = fakeAdapter();
    player.select(tracks[0].key);
    const oldRequest = player.getSnapshot().request;
    player.pause();
    player.bind(oldRequest, adapter);
    expect(adapter.play).not.toHaveBeenCalled();
    expect(adapter.pause).toHaveBeenCalledOnce();
    player.select(tracks[1].key);
    expect(adapter.destroy).toHaveBeenCalledOnce();
    player.report(oldRequest, { status: "playing", position: 10 });
    expect(player.getSnapshot()).toMatchObject({
      status: "loading",
      position: 0,
    });
    const late = fakeAdapter();
    player.bind(oldRequest, late);
    expect(late.destroy).toHaveBeenCalledOnce();
  });
  it("metadata updates preserve playback, URL edits reload paused, deletion stops", () => {
    const { player, tracks } = setup();
    const adapter = fakeAdapter();
    player.select(tracks[0].key);
    player.bind(player.getSnapshot().request, adapter);
    confirmPlaying(player, 20);
    const revision = player.getSnapshot().request;
    const renamed = tracks.map((track) => ({
      ...track,
      title: "Renamed",
      memoryTitle: "Updated memory",
    }));
    player.setLibrary("user:space", renamed);
    expect(player.getSnapshot()).toMatchObject({
      request: revision,
      status: "playing",
      position: 20,
      track: { title: "Renamed" },
    });
    expect(adapter.destroy).not.toHaveBeenCalled();
    player.setLibrary(
      "user:space",
      renamed.map((track, index) =>
        index ? track : { ...track, source: tracks[1].source, url: spotify },
      ),
    );
    expect(player.getSnapshot()).toMatchObject({
      wantsPlay: false,
      position: 0,
      track: { key: tracks[0].key },
    });
    expect(adapter.destroy).toHaveBeenCalledOnce();
    player.setLibrary("user:space", tracks.slice(1));
    expect(player.getSnapshot().track).toBeNull();
  });
});

describe("temporary music sessions", () => {
  it("preserves the original playing session while a preview source changes", () => {
    const { player, tracks } = setup();
    player.select(tracks[0].key);
    confirmPlaying(player, 20);
    const first = player.beginTemporary("preview", tracks[1]);
    player.replaceTemporary(first, tracks[2]);
    player.endTemporary(first);
    expect(player.getSnapshot()).toMatchObject({
      track: { key: tracks[0].key },
      position: 20,
      wantsPlay: true,
      owner: null,
    });
  });
  it("an invalid preview source stops temporary audio without losing the saved session", () => {
    const { player, tracks } = setup();
    player.select(tracks[0].key);
    confirmPlaying(player, 20);
    const token = player.beginTemporary("preview", tracks[1]);
    const adapter = fakeAdapter();
    player.bind(player.getSnapshot().request, adapter);
    player.replaceTemporary(token, null);
    expect(adapter.destroy).toHaveBeenCalledOnce();
    expect(player.getSnapshot()).toMatchObject({
      track: null,
      owner: "preview",
      status: "idle",
    });
    player.replaceTemporary(token, tracks[2]);
    player.endTemporary(token);
    expect(player.getSnapshot()).toMatchObject({
      track: { key: tracks[0].key },
      position: 20,
      wantsPlay: true,
    });
  });
  it("temporary metadata edits preserve media; closed, nested and revoked tokens cannot take over", () => {
    const { player, tracks } = setup();
    player.select(tracks[0].key);
    player.report(player.getSnapshot().request, {
      status: "paused",
      position: 20,
    });
    const first = player.beginTemporary("preview", tracks[1]);
    confirmPlaying(player, 12);
    const request = player.getSnapshot().request;
    player.replaceTemporary(first, {
      ...tracks[1],
      title: "New preview title",
    });
    expect(player.getSnapshot()).toMatchObject({
      request,
      position: 12,
      status: "playing",
      track: { title: "New preview title" },
    });
    const second = player.beginTemporary("preview", tracks[2]);
    const nestedRequest = player.getSnapshot().request;
    player.replaceTemporary(first, null);
    expect(player.getSnapshot().request).toBe(nestedRequest);
    player.endTemporary(first);
    player.replaceTemporary(first, tracks[0]);
    expect(player.getSnapshot().track?.key).toBe(tracks[2].key);
    player.endTemporary(second);
    expect(player.getSnapshot()).toMatchObject({
      track: { key: tracks[0].key },
      position: 20,
      wantsPlay: false,
    });
    player.replaceTemporary(second, tracks[1]);
    expect(player.getSnapshot().track?.key).toBe(tracks[0].key);
    const revoked = player.beginTemporary("preview", tracks[1]);
    player.reset();
    player.replaceTemporary(revoked, tracks[2]);
    player.endTemporary(revoked);
    expect(player.getSnapshot()).toMatchObject({
      track: null,
      identity: null,
      owner: null,
    });
  });
  it("restores position and playback only when previously confirmed playing", () => {
    const { player, tracks } = setup();
    player.select(tracks[0].key);
    confirmPlaying(player, 32);
    const token = player.beginTemporary("story", tracks[1]);
    player.report(player.getSnapshot().request, { status: "ended" });
    expect(player.getSnapshot().track?.key).toBe(tracks[1].key);
    player.endTemporary(token);
    expect(player.getSnapshot()).toMatchObject({
      track: { key: tracks[0].key },
      position: 32,
      wantsPlay: true,
      owner: null,
    });
    const restored = fakeAdapter();
    player.bind(player.getSnapshot().request, restored);
    expect(restored.seek).toHaveBeenCalledWith(32);
    expect(restored.play).toHaveBeenCalledOnce();
    player.report(player.getSnapshot().request, { status: "paused" });
    const next = player.beginTemporary("preview", tracks[1]);
    player.endTemporary(next);
    expect(player.getSnapshot().wantsPlay).toBe(false);
  });
  it("nests previews and handles out-of-order unmount/duplicate cleanup", () => {
    const { player, tracks } = setup();
    player.select(tracks[0].key);
    confirmPlaying(player, 15);
    const preview: MusicTrack = { ...tracks[1], key: "preview:first" };
    const first = player.beginTemporary("preview", preview);
    confirmPlaying(player, 8);
    const second = player.beginTemporary("preview", {
      ...tracks[2],
      key: "preview:second",
    });
    player.setLibrary("user:space", tracks);
    player.endTemporary(second);
    expect(player.getSnapshot()).toMatchObject({
      track: { key: preview.key },
      position: 8,
      wantsPlay: true,
    });
    const third = player.beginTemporary("preview", tracks[2]);
    player.endTemporary(first);
    player.endTemporary(first);
    expect(player.getSnapshot().track?.key).toBe(tracks[2].key);
    player.endTemporary(third);
    expect(player.getSnapshot()).toMatchObject({
      track: { key: tracks[0].key },
      position: 15,
      owner: null,
    });
  });
  it("silent stories pause prior audio; identity changes never resurrect queue/session", () => {
    const { player, tracks } = setup();
    const adapter = fakeAdapter();
    player.select(tracks[0].key);
    player.bind(player.getSnapshot().request, adapter);
    confirmPlaying(player);
    const token = player.beginTemporary("story", null);
    expect(adapter.pause).toHaveBeenCalledOnce();
    expect(adapter.destroy).toHaveBeenCalledOnce();
    expect(player.getSnapshot()).toMatchObject({ track: null, owner: "story" });
    player.setLibrary("other:space", []);
    player.endTemporary(token);
    expect(player.getSnapshot()).toMatchObject({
      identity: "other:space",
      tracks: [],
      track: null,
      owner: null,
    });
    player.reset();
    expect(player.getSnapshot().identity).toBeNull();
  });
  it("refresh revokes deleted/changed snapshot tracks, including underlying nested sessions", () => {
    const { player, tracks } = setup();
    player.select(tracks[0].key);
    confirmPlaying(player, 25);
    const token = player.beginTemporary("preview", tracks[1]);
    player.setLibrary(
      "user:space",
      tracks.map((track, index) =>
        index
          ? track
          : {
              ...track,
              source: tracks[2].source,
              url: tracks[2].url + "&changed=1",
            },
      ),
    );
    // Equivalent canonical media keeps position even when raw URL metadata changes.
    player.endTemporary(token);
    expect(player.getSnapshot().position).toBe(25);
    const replacement = player.beginTemporary("preview", tracks[1]);
    player.setLibrary(
      "user:space",
      tracks.map((track, index) =>
        index ? track : { ...track, source: tracks[1].source },
      ),
    );
    player.endTemporary(replacement);
    expect(player.getSnapshot()).toMatchObject({
      wantsPlay: false,
      position: 0,
    });
    const deleted = player.beginTemporary("preview", tracks[1]);
    player.setLibrary("user:space", tracks.slice(1));
    player.endTemporary(deleted);
    expect(player.getSnapshot().track).toBeNull();
  });
});
