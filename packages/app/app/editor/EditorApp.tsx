"use client";

import type { File } from "@/db/schema";
import { Editor } from "./Editor";
import { SideBar } from "./SideBar";

export const EditorApp: React.FC<{
  files: File[];
  createFile(): Promise<void>;
  fileID?: string;
}> = ({ files, createFile, fileID }) => {
  return (
    <main className="flex">
      <SideBar files={files} createFile={createFile} fileID={fileID} />
      {fileID && <Editor fileID={fileID} className="flex-1" />}
    </main>
  );
};
