'use client'
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Post = {
    id: string;
    caption: string;
    imageUrl: string;
    createdAt: string | Date;
};

type PostCardProps = {
    post: Post;
    onEdit?: (post: Post) => void;
    onDelete?: (post: Post) => void;
};

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
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

                    <div className="absolute right-2 top-2 z-10">
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onEdit?.(post);
                                    }}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onDelete?.(post);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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


