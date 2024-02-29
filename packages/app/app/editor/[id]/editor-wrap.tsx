"use client";

import dynamic from "next/dynamic";

export const EditorWrap = dynamic(
  () => import("./editor").then((m) => m.Editor),
  {
    ssr: false,
  }
);
