'use client'
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostType } from "@/types/post";


type PostCardProps = {
    post: PostType;
    userId?: string | undefined
};

export function PostCard({ post, userId }: PostCardProps) {
    const router = useRouter();
    const [ isDeleting, setIsDeleting ] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this post?")) {
            return;
        }

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/posts?id=${post.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to delete post");
            }

            router.refresh();
        } catch (error) {
            console.error("Failed to delete post:", error);
            alert(error instanceof Error ? error.message : "Failed to delete post");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/posts/${post.id}/edit`);
    };

    const created =
        typeof post.createdAt === "string"
            ? new Date(post.createdAt)
            : post.createdAt;

    return (
        <Link href={`/posts/${post.id}`}>
            <div className="group overflow-hidden rounded-xl border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={post.imageUrl}
                        alt={post.caption}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />

                    {(userId && post.userId === userId) && <div className="absolute right-2 top-2 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white shadow-sm backdrop-blur hover:bg-black/80"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={handleEdit}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>}
                </div>

                <div className="flex flex-col gap-1 p-3">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                        {post.caption}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {created instanceof Date && !isNaN(created.getTime())
                            ? created.toLocaleDateString()
                            : ""}
                    </p>
                </div>
            </div>
        </Link>
    );
}


