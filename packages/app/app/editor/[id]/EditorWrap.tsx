"use client";

import dynamic from "next/dynamic";

export const EditorWrap = dynamic(
  () => import("./Editor").then((m) => m.Editor),
  {
    ssr: false,
  }
);
