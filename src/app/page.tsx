import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { headers } from "next/headers";

async function PostsList() {
  // Access headers to construct the API URL and satisfy Next.js 15 requirement
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const apiUrl = `${protocol}://${host}/api/posts`;
  
  const res = await fetch(apiUrl, {
    cache: 'no-store', // Ensure fresh data on each request
  });
  
  if (!res.ok) {
    return <div className="text-red-500">Failed to load posts</div>;
  }
  
  const posts = await res.json() as Array<{ id: string; caption: string; imageUrl: string; createdAt: Date }>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.id}`}>
          <div className="border p-2 rounded hover:shadow-lg">
            <img src={post.imageUrl} className="w-full h-48 object-cover rounded" />
            <p className="mt-2">{post.caption}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PostsLoading() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border p-2 rounded animate-pulse">
          <div className="w-full h-48 bg-gray-200 rounded" />
          <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Next.js Supabase Starter</Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Gallery</h1>
            <Suspense fallback={<PostsLoading />}>
              <PostsList />
            </Suspense>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
