export interface Account {
  id?: number;
  username: string;
  email: string;
  email_verified?: boolean;
  has_password?: boolean;
  display_name: string;
  bio: string;
  country_code: string;
  language_code: string;
  followers_count?: number;
  following_count?: number;
  is_private: boolean;
}

export interface PublicProfile {
  followers_count?: number;
  following_count?: number;
  username: string;
  display_name: string;
  bio?: string;
  country_code?: string;
  language_code?: string;
  is_private: boolean;
  is_blocked?: boolean;
  is_following?: boolean;
  can_follow?: boolean;
}

export type FieldErrors = Record<string, string[]>;
