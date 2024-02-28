"use client";

import type { File } from "@/db/schema";
import { SideBar } from "./SideBar";

import dynamic from "next/dynamic";
import { User } from "@supabase/supabase-js";

const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
});

export const EditorApp: React.FC<{
  user: User;
  isPremium: boolean;
  fileID?: string;
  files: File[];
}> = ({ user, isPremium, fileID, files }) => {
  return (
    <main className="flex">
      <SideBar
        user={user}
        isPremium={isPremium}
        files={files}
        fileID={fileID}
      />
      {fileID && (
        <Editor key={fileID} className="flex-1" user={user} fileID={fileID} />
      )}
    </main>
  );
};
