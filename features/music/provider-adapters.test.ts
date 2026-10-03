import { afterEach, describe, expect, it, vi } from "vitest";
import { mountProvider } from "./provider-adapters";
import { MusicPlayerController } from "./player-controller";
import { buildMusicLibrary } from "./library";

const track = buildMusicLibrary([
  {
    id: "memory",
    title: "Memory",
    description: "",
    memoryDate: "",
    createdBy: "",
    photos: [],
    songs: [
      {
        id: "song",
        title: "Song",
        artist: "",
        addedAt: "",
        addedBy: "",
        url: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
      },
    ],
  },
])[0];
type Events = {
  onReady(): void;
  onStateChange(event: { data: number }): void;
  onAutoplayBlocked(): void;
  onError(): void;
};
function provider() {
  let events: Events;
  const native = {
    playVideo: vi.fn(),
    pauseVideo: vi.fn(),
    seekTo: vi.fn(),
    getCurrentTime: () => 12,
    getDuration: () => 90,
    destroy: vi.fn(),
  };
  class Player {
    constructor(_element: HTMLElement, options: { events: Events }) {
      events = options.events;
      return native;
    }
  }
  const host = {
    replaceChildren: vi.fn(),
    querySelector: () => ({ setAttribute: vi.fn() }),
  } as unknown as HTMLElement;
  vi.stubGlobal("window", {
    YT: { Player },
    location: { origin: "https://example.test" },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  });
  vi.stubGlobal("document", { createElement: () => ({}) });
  return { host, native, events: () => events };
}
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("official YouTube adapter lifecycle", () => {
  it("select, ready, actual playing, pause and blocked autoplay cross the real controller seam", async () => {
    vi.useFakeTimers();
    const fake = provider();
    const player = new MusicPlayerController();
    player.setLibrary("user:space", [track]);
    player.select(track.key);
    const request = player.getSnapshot().request;
    const cleanup = mountProvider(
      fake.host,
      track,
      (adapter) => player.bind(request, adapter),
      (event) => player.report(request, event),
    );
    await Promise.resolve();
    fake.events().onReady();
    expect(fake.native.playVideo).toHaveBeenCalledOnce();
    expect(player.getSnapshot().status).toBe("loading");
    fake.events().onStateChange({ data: 1 });
    expect(player.getSnapshot().status).toBe("playing");
    await vi.advanceTimersByTimeAsync(500);
    expect(player.getSnapshot()).toMatchObject({ position: 12, duration: 90 });
    player.pause();
    fake.events().onStateChange({ data: 2 });
    expect(player.getSnapshot().status).toBe("paused");
    player.play();
    fake.events().onAutoplayBlocked();
    expect(player.getSnapshot().status).toBe("blocked");
    player.stop();
    cleanup();
    cleanup();
    expect(fake.native.destroy).toHaveBeenCalledOnce();
    fake.events().onStateChange({ data: 1 });
    expect(player.getSnapshot().track).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("unmount before ready cancels playback, timers and late provider events", async () => {
    vi.useFakeTimers();
    const fake = provider();
    const ready = vi.fn();
    const report = vi.fn();
    const cleanup = mountProvider(fake.host, track, ready, report);
    await Promise.resolve();
    cleanup();
    fake.events().onReady();
    fake.events().onStateChange({ data: 1 });
    expect(ready).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
    expect(fake.native.destroy).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("official Spotify adapter events", () => {
  it("binds on ready, converts progress milliseconds and never invents an ended event", async () => {
    vi.useFakeTimers();
    const listeners = new Map<
      string,
      (event: {
        data: {
          isPaused: boolean;
          isBuffering: boolean;
          position: number;
          duration: number;
        };
      }) => void
    >();
    const native = {
      resume: vi.fn(),
      pause: vi.fn(),
      loadEntity: vi.fn(),
      destroy: vi.fn(),
      addListener: (
        name: string,
        listener: (event: {
          data: {
            isPaused: boolean;
            isBuffering: boolean;
            position: number;
            duration: number;
          };
        }) => void,
      ) => listeners.set(name, listener),
      removeListener: (name: string) => listeners.delete(name),
    };
    const host = {
      replaceChildren: vi.fn(),
      querySelector: () => ({ setAttribute: vi.fn() }),
    } as unknown as HTMLElement;
    vi.stubGlobal("window", {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    });
    vi.stubGlobal("document", {
      createElement: () => ({ remove: vi.fn() }),
      head: { appendChild: vi.fn() },
    });
    const spotifyTrack = buildMusicLibrary([
      {
        id: "spotify",
        title: "Spotify memory",
        description: "",
        memoryDate: "",
        createdBy: "",
        photos: [],
        songs: [
          {
            ...track,
            url: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
          },
        ],
      },
    ])[0];
    const player = new MusicPlayerController();
    player.setLibrary("user:space", [spotifyTrack, track]);
    player.select(spotifyTrack.key);
    const request = player.getSnapshot().request;
    const cleanup = mountProvider(
      host,
      spotifyTrack,
      (adapter) => player.bind(request, adapter),
      (event) => player.report(request, event),
    );
    window.onSpotifyIframeApiReady?.({
      createController: (_element, _options, callback) => callback(native),
    });
    await Promise.resolve();
    await Promise.resolve();
    const event = {
      data: {
        isPaused: false,
        isBuffering: false,
        position: 12000,
        duration: 90000,
      },
    };
    listeners.get("ready")?.(event);
    expect(native.resume).toHaveBeenCalledOnce();
    expect(player.getSnapshot().status).toBe("loading");
    listeners.get("playback_started")?.(event);
    listeners.get("playback_update")?.(event);
    expect(player.getSnapshot()).toMatchObject({
      status: "playing",
      position: 12,
      duration: 90,
    });
    listeners.get("playback_update")?.({
      data: { ...event.data, isPaused: true, position: 90000 },
    });
    expect(player.getSnapshot()).toMatchObject({
      status: "paused",
      track: { key: spotifyTrack.key },
    });
    player.stop();
    cleanup();
    expect(native.destroy).toHaveBeenCalledOnce();
    expect(listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
