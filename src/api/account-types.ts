export interface Account {
  id?: number;
  username: string;
  email: string;
  display_name: string;
  bio: string;
  country_code: string;
  language_code: string;
  is_private: boolean;
}

export interface PublicProfile {
  username: string;
  display_name: string;
  bio?: string;
  country_code?: string;
  language_code?: string;
  is_private: boolean;
}

export type FieldErrors = Record<string, string[]>;
