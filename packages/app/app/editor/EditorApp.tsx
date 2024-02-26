"use client";

import type { File } from "@/db/schema";
import { SideBar } from "./SideBar";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
});

export const EditorApp: React.FC<{
  fileID?: string;
  files: File[];
  createFile: () => Promise<void>;
  generateCollaborativeAuthToken: () => Promise<string>;
}> = ({ fileID, files, createFile, generateCollaborativeAuthToken }) => {
  return (
    <main className="flex">
      <SideBar files={files} createFile={createFile} fileID={fileID} />
      {fileID && (
        <Editor
          key={fileID}
          className="flex-1"
          fileID={fileID}
          generateCollaborativeAuthToken={generateCollaborativeAuthToken}
        />
      )}
    </main>
  );
};
