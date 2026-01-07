import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-8 px-4 py-24 md:py-32 text-center">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Next.js Supabase Starter
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          The fastest way to build modern web applications with Next.js and Supabase.
          Create, share, and discover amazing content.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
          <Button asChild size="lg" className="text-base">
            <Link href="/posts">Explore Posts</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link href="/posts/new">Create Post</Link>
          </Button>
        </div>
      </div>
      <div className="w-full max-w-4xl mx-auto mt-12 px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </section>
  );
}
