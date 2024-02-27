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
  fileID?: string;
  files: File[];
  createFile: () => Promise<void>;
  generateCollaborativeAuthToken: (fileID: string) => Promise<string>;
}> = ({ user, fileID, files, createFile, generateCollaborativeAuthToken }) => {
  return (
    <main className="flex">
      <SideBar
        user={user}
        files={files}
        createFile={createFile}
        fileID={fileID}
      />
      {fileID && (
        <Editor
          key={fileID}
          className="flex-1"
          user={user}
          fileID={fileID}
          generateCollaborativeAuthToken={generateCollaborativeAuthToken}
        />
      )}
    </main>
  );
};
