import { sameMedia, type MusicTrack } from "./library";

export type PlaybackStatus =
  "idle" | "loading" | "playing" | "paused" | "ended" | "blocked" | "error";
export type PlayerState = {
  identity: string | null;
  tracks: readonly MusicTrack[];
  track: MusicTrack | null;
  status: PlaybackStatus;
  position: number;
  duration: number;
  request: number;
  wantsPlay: boolean;
  owner: "story" | "preview" | null;
  expanded: boolean;
  message: string;
};
export type PlaybackEvent = {
  status?: PlaybackStatus;
  position?: number;
  duration?: number;
  message?: string;
};
export interface PlaybackAdapter {
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  destroy(): void;
}
type Snapshot = {
  track: MusicTrack | null;
  position: number;
  wasPlaying: boolean;
  owner: PlayerState["owner"];
};
type TemporarySession = { token: number; closed: boolean; snapshot: Snapshot };

const initialState: PlayerState = {
  identity: null,
  tracks: [],
  track: null,
  status: "idle",
  position: 0,
  duration: 0,
  request: 0,
  wantsPlay: false,
  owner: null,
  expanded: false,
  message: "",
};

/** Owns queue, playback arbitration and temporary sessions; providers report facts. */
export class MusicPlayerController {
  private state: PlayerState = initialState;
  private listeners = new Set<() => void>();
  private adapter: PlaybackAdapter | null = null;
  private sessions: TemporarySession[] = [];
  private sequence = 0;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = () => this.state;
  private update(patch: Partial<PlayerState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  reset = () => {
    this.adapter?.destroy();
    this.adapter = null;
    this.sessions = [];
    this.state = { ...initialState, request: this.state.request + 1 };
    this.listeners.forEach((listener) => listener());
  };
  setLibrary = (identity: string, tracks: readonly MusicTrack[]) => {
    if (this.state.identity !== identity) this.reset();
    const reconcile = (track: MusicTrack | null) =>
      track ? (tracks.find((item) => item.key === track.key) ?? null) : null;
    for (const session of this.sessions) {
      const previous = session.snapshot.track;
      const next =
        session.snapshot.owner === "preview" ? previous : reconcile(previous);
      session.snapshot.track = next;
      if (previous && (!next || !sameMedia(previous, next))) {
        session.snapshot.wasPlaying = false;
        session.snapshot.position = 0;
      }
    }
    const current = this.state.track;
    this.update({ identity, tracks });
    if (current && !this.state.owner) {
      const next = reconcile(current);
      if (!next) this.stop();
      else if (!sameMedia(current, next)) this.activate(next, false);
      else this.update({ track: next });
    } else if (current && this.state.owner === "story") {
      const next = reconcile(current);
      if (!next) this.stop();
      else if (!sameMedia(current, next)) this.activate(next, false);
      else this.update({ track: next });
    }
  };
  private activate(track: MusicTrack | null, play: boolean, position = 0) {
    this.adapter?.destroy();
    this.adapter = null;
    this.update({
      track,
      position,
      duration: 0,
      status: track ? "loading" : "idle",
      wantsPlay: play,
      request: this.state.request + 1,
      message: "",
    });
  }
  select = (key: string) => {
    if (!this.state.identity || this.state.owner) return;
    const track = this.state.tracks.find((item) => item.key === key);
    if (track) {
      this.activate(track, true);
      this.update({ expanded: false });
    }
  };
  toggleLibrary = () => this.update({ expanded: !this.state.expanded });
  stop = () => this.activate(null, false);
  play = () => {
    if (this.state.track) {
      this.update({ wantsPlay: true, message: "" });
      this.adapter?.play();
    }
  };
  pause = () => {
    this.update({ wantsPlay: false });
    this.adapter?.pause();
  };
  seek = (seconds: number) => {
    if (this.state.duration > 0)
      this.adapter?.seek(Math.max(0, Math.min(seconds, this.state.duration)));
  };
  next = (direction: -1 | 1 = 1) => {
    if (this.state.owner || !this.state.track) return;
    const index = this.state.tracks.findIndex(
      (track) => track.key === this.state.track?.key,
    );
    const track = index >= 0 ? this.state.tracks[index + direction] : null;
    if (track) this.activate(track, true);
  };
  bind = (request: number, adapter: PlaybackAdapter) => {
    if (request !== this.state.request || !this.state.track) {
      adapter.destroy();
      return;
    }
    this.adapter = adapter;
    if (this.state.position) adapter.seek(this.state.position);
    if (this.state.wantsPlay) adapter.play();
    else adapter.pause();
  };
  report = (request: number, event: PlaybackEvent) => {
    if (request !== this.state.request || !this.state.track) return;
    this.update({
      ...event,
      ...(event.status === "playing"
        ? { wantsPlay: true }
        : event.status === "paused" ||
            event.status === "blocked" ||
            event.status === "error"
          ? { wantsPlay: false }
          : {}),
    });
    if (event.status === "ended") {
      this.update({ wantsPlay: false });
      if (!this.state.owner) this.next();
    }
  };
  retry = () => {
    if (this.state.track)
      this.activate(this.state.track, true, this.state.position);
  };
  beginTemporary = (owner: "story" | "preview", track: MusicTrack | null) => {
    if (!this.state.identity) return 0;
    const token = ++this.sequence;
    this.sessions.push({
      token,
      closed: false,
      snapshot: {
        track: this.state.track,
        position: this.state.position,
        wasPlaying: this.state.status === "playing",
        owner: this.state.owner,
      },
    });
    this.pause();
    this.update({ owner, expanded: false });
    this.activate(track, Boolean(track));
    return token;
  };
  /** Replaces a temporary source without overwriting the session it will restore. */
  replaceTemporary = (token: number, track: MusicTrack | null) => {
    const session = this.sessions.at(-1);
    if (!session || session.token !== token || session.closed) return;
    const current = this.state.track;
    if (current && track && sameMedia(current, track)) {
      if (
        current.key !== track.key ||
        current.title !== track.title ||
        current.artist !== track.artist ||
        current.url !== track.url ||
        current.memoryId !== track.memoryId ||
        current.memoryTitle !== track.memoryTitle
      )
        this.update({ track });
      return;
    }
    if (current || track) this.activate(track, Boolean(track));
  };
  endTemporary = (token: number) => {
    const session = this.sessions.find((item) => item.token === token);
    if (!session || session.closed) return;
    session.closed = true;
    let restore: Snapshot | undefined;
    while (this.sessions.at(-1)?.closed)
      restore = this.sessions.pop()?.snapshot;
    if (restore) {
      this.update({ owner: restore.owner });
      this.activate(restore.track, restore.wasPlaying, restore.position);
    }
  };
}
