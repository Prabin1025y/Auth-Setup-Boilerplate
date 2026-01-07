import Link from 'next/link';
import { PostCard } from './PostCard';
import { headers } from 'next/headers';
import { PostType } from '@/types/post';

async function PostsList() {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const apiUrl = `${protocol}://${host}/api/posts`;

    const res = await fetch(apiUrl, {
        cache: "no-store",
    });

    if (!res.ok) {
        return <div className="text-red-500">Failed to load posts</div>;
    }

    // const posts = await getPosts()

    const posts: PostType[] = await res.json();
    // console.log(posts)

    return (
        <div className="w-full max-w-7xl mx-auto p-5 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Gallery</h1>
                <Link
                    href="/posts/new"
                    className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    New Post
                </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}

export default PostsList