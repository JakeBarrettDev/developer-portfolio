import type { Metadata } from "next";
import SandboxApp from "@/components/lab/sandbox-app";

export const metadata: Metadata = {
  title: "Sandbox",
  description: "Raccoon Supply Co., a tiny store built to be tested.",
  robots: { index: false },
};

/**
 * The store on its own, so tests recorded in the Lab can run against a real
 * URL. Deliberately outside the (site) group: no navbar or footer whose
 * labels could collide with the locators the Lab generates.
 */
export default function SandboxPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border">
        <SandboxApp />
      </div>
    </main>
  );
}
