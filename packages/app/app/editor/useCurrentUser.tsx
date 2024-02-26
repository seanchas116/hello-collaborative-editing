import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useCurrentUser(): User | undefined {
  const supabase = createClient();

  const [user, setUser] = useState<User | undefined>();
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user);
      }
    ).data.subscription;
    return () => subscription.unsubscribe();
  }, []);

  return user;
}
