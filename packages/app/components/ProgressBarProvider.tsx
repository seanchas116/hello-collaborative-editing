"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Suspense } from "react";
import colors from "tailwindcss/colors";

export const ProgressBarProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      {children}
      <Suspense fallback={<></>}>
        <ProgressBar
          // height="4px"
          // color={colors.blue[500]}
          // options={{ showSpinner: false }}
          shallowRouting
        />
      </Suspense>
    </>
  );
};
