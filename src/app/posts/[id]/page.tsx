import { getPost } from "@/server/actions/posts";
import { getSimilarPosts } from "@/server/actions/pinecone";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { PostCard } from "@/components/posts/PostCard";
import { Separator } from "@/components/ui/separator";

interface Props {
    params: Promise<{ id: string }>;
}

async function SimilarPostsSection({ postId }: { postId: string }) {
    const similarPosts = await getSimilarPosts(postId);

    if (similarPosts.length === 0) {
        return null;
    }

    return (
        <section className="mt-16">
            <div className="flex items-center gap-3 mb-6">
                <Separator className="flex-1" />
                <h2 className="text-2xl font-bold">Similar Posts</h2>
                <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {similarPosts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                    />
                ))}
            </div>
        </section>
    );
}

async function PostDetail({ params }: Props) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        return (
            <div className="w-full max-w-4xl mx-auto p-5 py-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h2 className="text-2xl font-bold mb-4">Post not found</h2>
                            <p className="text-muted-foreground mb-6">
                                The post you&apos;re looking for doesn&apos;t exist or has been removed.
                            </p>
                            <Button asChild variant="outline">
                                <Link href="/posts">Back to Gallery</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const createdAt = post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);

    return (
        <div className="w-full max-w-5xl mx-auto p-5 py-8">
            {/* Back Button */}
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/posts" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Gallery
                    </Link>
                </Button>
            </div>

            {/* Main Post Card */}
            <Card className="overflow-hidden">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <img
                        src={post.imageUrl}
                        alt={post.caption}
                        className="h-full w-full object-cover"
                    />
                </div>
                <CardContent className="p-6 md:p-8">
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                                {post.caption}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={createdAt.toISOString()}>
                                    {createdAt.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </time>
                                <span>•</span>
                                <span>{createdAt.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Similar Posts Section */}
            <Suspense
                fallback={
                    <div className="mt-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Separator className="flex-1" />
                            <h2 className="text-2xl font-bold">Similar Posts</h2>
                            <Separator className="flex-1" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[ ...Array(6) ].map((_, i) => (
                                <div
                                    key={i}
                                    className="border rounded-xl overflow-hidden animate-pulse"
                                >
                                    <div className="w-full aspect-[4/3] bg-muted" />
                                    <div className="p-3 space-y-2">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-3 bg-muted rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            >
                <SimilarPostsSection postId={id} />
            </Suspense>
        </div>
    );
}

function PostDetailLoading() {
    return (
        <div className="w-full max-w-5xl mx-auto p-5 py-8">
            <div className="mb-6">
                <div className="h-9 w-32 bg-muted rounded animate-pulse" />
            </div>
            <Card className="overflow-hidden">
                <div className="w-full aspect-video bg-muted animate-pulse" />
                <CardContent className="p-6 md:p-8">
                    <div className="space-y-4">
                        <div className="h-10 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default async function PostDetailPage({ params }: Props) {
    return (
        <Suspense fallback={<PostDetailLoading />}>
            <PostDetail params={params} />
        </Suspense>
    );
}
