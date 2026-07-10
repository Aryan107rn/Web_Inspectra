import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-scan-cyan">Error 404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-100">Nothing detected at this address</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-400">
        The page you're looking for doesn't exist. Try heading back to the dashboard.
      </p>
      <Link href="/" className="mt-6">
        <Button variant="secondary">Back to home</Button>
      </Link>
    </div>
  );
}
