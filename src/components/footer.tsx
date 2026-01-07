import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-t-foreground/10 mt-auto">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-5 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <p>&copy; 2026 Next.js Supabase Starter. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/posts" className="hover:text-foreground transition-colors">
            Posts
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}

