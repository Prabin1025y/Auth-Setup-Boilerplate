
import Link from "next/link";
import { Suspense } from "react";
import { EnvVarWarning } from "@/components/auth/env-var-warning";
import { AuthButton } from "@/components/auth/auth-button";
import { hasEnvVars } from "@/lib/utils";
// import { usePathname } from "next/navigation";

function NavLinks() {
  // const pathname = usePathname();

  return (
    <nav className="flex gap-6 items-center">
      <Link
        href="/"
        className={`text-sm font-medium transition-colors hover:text-foreground/80 text-foreground`}
      >
        Home
      </Link>
      <Link
        href="/posts"
        className={`text-sm font-medium transition-colors hover:text-foreground/80 text-foreground`}
      >
        Posts
      </Link>
    </nav>
  );
}

export function Navbar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-8 items-center">
          <Link href="/" className="font-semibold text-lg hover:opacity-80 transition-opacity">
            Next.js Supabase Starter
          </Link>
          <NavLinks />
        </div>
        <div className="flex items-center gap-4">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense fallback={<div className="h-8 w-20" />}>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </div>
    </nav>
  );
}

