import { User } from "@supabase/supabase-js";

export interface DetailedUser extends User {
  name: string;
  picture?: string;
}

export function toDetailedUser(user: User): DetailedUser {
  const userName = user?.user_metadata.name;
  const userPicture = user?.user_metadata.picture;

  return {
    ...user,
    name: userName,
    picture: userPicture,
  };
}
