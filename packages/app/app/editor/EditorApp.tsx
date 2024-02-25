"use client";

import type { File } from "@/db/schema";
import { SideBar } from "./SideBar";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
});

export const EditorApp: React.FC<{
  files: File[];
  createFile(): Promise<void>;
  fileID?: string;
}> = ({ files, createFile, fileID }) => {
  return (
    <main className="flex">
      <SideBar files={files} createFile={createFile} fileID={fileID} />
      {fileID && <Editor fileID={fileID} className="flex-1" key={fileID} />}
    </main>
  );
};
