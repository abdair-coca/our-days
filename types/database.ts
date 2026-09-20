export type ProfileRow = {
  created_at: string;
  display_name: string | null;
  id: string;
};

export type SpaceRow = {
  created_at: string;
  created_by: string;
  id: string;
  name: string;
};

export type SpaceMemberRow = {
  joined_at: string;
  profile_id: string;
  role: "member" | "owner";
  space_id: string;
};

export type MemoryRow = {
  created_at: string;
  created_by: string;
  description: string;
  id: string;
  memory_date: string;
  song_artist: string | null;
  song_title: string | null;
  song_url: string | null;
  space_id: string;
  title: string;
  updated_at: string;
};

export type MemoryPhotoRow = {
  alt_text: string;
  byte_size: number | null;
  created_at: string;
  height: number | null;
  id: string;
  memory_id: string;
  mime_type: string | null;
  sort_order: number;
  storage_path: string | null;
  visual_value: string | null;
  width: number | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at"> & { created_at?: string };
        Update: Partial<Omit<ProfileRow, "id" | "created_at">>;
      };
      spaces: {
        Row: SpaceRow;
        Insert: Omit<SpaceRow, "id" | "created_at"> & {
          created_at?: string;
          id?: string;
        };
        Update: Partial<Omit<SpaceRow, "id" | "created_at" | "created_by">>;
      };
      space_members: {
        Row: SpaceMemberRow;
        Insert: SpaceMemberRow;
        Update: Partial<Pick<SpaceMemberRow, "role">>;
      };
      memories: {
        Row: MemoryRow;
        Insert: Omit<MemoryRow, "id" | "created_at" | "updated_at"> & {
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: Partial<
          Pick<MemoryRow, "description" | "memory_date" | "song_artist" | "song_title" | "song_url" | "title">
        >;
      };
      memory_photos: {
        Row: MemoryPhotoRow;
        Insert: Omit<MemoryPhotoRow, "id" | "created_at"> & {
          created_at?: string;
          id?: string;
        };
        Update: Partial<Pick<MemoryPhotoRow, "alt_text" | "sort_order" | "storage_path" | "visual_value">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
