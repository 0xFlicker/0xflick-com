"use client";
import { Head } from "@/components/Head";
import { DefaultProvider } from "@/context/default";
import { Toolbar } from "@/components/Toolbar";

export default function Home() {
  return (
    <DefaultProvider>
      <Head />
      <Toolbar />
    </DefaultProvider>
  );
}
