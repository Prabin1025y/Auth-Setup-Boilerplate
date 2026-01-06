import { getPost } from "@/server/actions/posts";
import { Suspense } from "react";
import Link from "next/link";

interface Props {
    params: Promise<{ id: string }>;
}

async function PostDetail({ id }: { id: string }) {
    const post = await getPost(id);

    if (!post) {
        return (
            <div className="max-w-2xl mx-auto p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Post not found</h2>
                <Link href="/" className="text-blue-500 hover:underline">
                    Go back to gallery
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
                ← Back to gallery
            </Link>
            <img src={post.imageUrl} className="w-full h-96 object-cover rounded" />
            <h2 className="text-2xl font-bold mt-4">{post.caption}</h2>
            <p className="text-gray-500">Created at: {post.createdAt.toLocaleString()}</p>
        </div>
    );
}

function PostDetailLoading() {
    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                <div className="w-full h-96 bg-gray-200 rounded" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mt-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
            </div>
        </div>
    );
}

export default async function PostDetailPage({ params }: Props) {
    const { id } = await params;

    return (
        <main className="min-h-screen flex flex-col items-center py-8">
            <Suspense fallback={<PostDetailLoading />}>
                <PostDetail id={id} />
            </Suspense>
        </main>
    );
}
