import type { Metadata } from "next";
import SandboxApp from "@/components/lab/sandbox-app";

export const metadata: Metadata = {
  title: "Sandbox",
  description: "Raccoon Supply Co., a tiny store built to be tested.",
  robots: { index: false },
};

/** The store on its own, so tests recorded in the Lab can run against a real URL. */
export default function SandboxPage() {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border">
      <SandboxApp />
    </div>
  );
}
