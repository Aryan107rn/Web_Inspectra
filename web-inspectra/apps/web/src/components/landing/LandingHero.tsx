"use client";

import { motion } from "framer-motion";
import { ScanBackgroundScene } from "@/components/three/ScanBackgroundScene";
import { ScanSweep } from "@/components/ui/ScanSweep";
import { ScanUrlInput } from "./ScanUrlInput";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 -z-0 opacity-70">
        <ScanBackgroundScene />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-void/60 to-void" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-28 text-center md:pt-36">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-scan-cyan"
        >
          Website MRI Scanner
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display text-4xl font-semibold leading-[1.1] text-ink-100 md:text-6xl"
        >
          See what's really running
          <br />
          under your website's skin.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-xl text-base text-ink-400 md:text-lg"
        >
          Web Inspectra scans any URL and turns performance, network, accessibility,
          and security internals into a clear, visual diagnosis — no report to
          decode.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 w-full"
        >
          <div className="flex justify-center">
            <ScanUrlInput />
          </div>
        </motion.div>
      </div>
      <ScanSweep />
    </section>
  );
}
