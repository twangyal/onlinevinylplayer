"use client";

import dynamic from "next/dynamic";

const VisualTruthEditor = dynamic(
  () =>
    import("./visual-truth.dev").then((module) => module.VisualTruthEditor),
  { ssr: false },
);

export function VisualTruthDev() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return <VisualTruthEditor />;
}
