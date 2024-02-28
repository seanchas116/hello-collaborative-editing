"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import colors from "tailwindcss/colors";

export const ProgressBarProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      {children}
      <ProgressBar
        // height="4px"
        // color={colors.blue[500]}
        // options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};
