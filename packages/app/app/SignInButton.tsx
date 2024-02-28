"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const SignInButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const supabase = createClient();
  const router = useRouter();

  const onClick = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL,
      },
    });
  };

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        router.push("/editor");
      }
    });
  }, [supabase, router]);

  return (
    <button className={className} onClick={onClick}>
      Launch Editor
    </button>
  );
};
