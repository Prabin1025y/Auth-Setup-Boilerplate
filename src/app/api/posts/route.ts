import { createPostWithEmbeddings, getPosts, deletePost, updatePostWithEmbeddings } from "@/server/actions/posts";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

//API to get all posts
export async function GET() {
    try {
        const posts = await getPosts();
        // const postsModified = posts.map(post => ({
        //     ...post,
        //     isOwner: userId ? (post.userId === userId ? true : false) : false
        // }))
        return NextResponse.json(posts);
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch posts" },
            { status: 500 }
        );
    }
}

//API to create post
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const image = formData.get("image") as File;
        const caption = formData.get("caption") as string;

        const supabase = await createClient();
        console.log("here")
        const {
            data: { user },
        } = await supabase.auth.getUser()
        const userId = user?.id

        console.log("here 1")

        if (!userId)
            return NextResponse.json({ message: "Unauthenticated" }, { status: 401 })

        if (!image) {
            return NextResponse.json({ message: "Image is required" }, { status: 400 });
        }

        if (!caption || typeof caption !== 'string' || caption.trim().length === 0)
            return NextResponse.json({ message: "Invalid caption!!" }, { status: 400 });

        // Save file to public/uploads directory
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${image.name}`;
        const uploadDir = path.join(process.cwd(), "public/uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, filename), buffer);

        console.log("here3")

        const imageUrl = `/uploads/${filename}`;
        const post = await createPostWithEmbeddings(caption, imageUrl, userId);

        console.log("here4")

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Failed to create post!" },
            { status: 500 }
        );
    }
}

//API to update post
export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get("id");

        if (!postId) {
            return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;

        if (!userId) {
            return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
        }

        // Verify post ownership
        const existingPost = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!existingPost) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        if (existingPost.userId !== userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const formData = await req.formData();
        const image = formData.get("image") as File | null;
        const caption = formData.get("caption") as string;

        if (!caption || typeof caption !== 'string' || caption.trim().length === 0) {
            return NextResponse.json({ message: "Invalid caption!!" }, { status: 400 });
        }

        let imageUrl = existingPost.imageUrl;
        const existinImageName = imageUrl.slice(imageUrl.indexOf("-") + 1);

        // If new image is provided, save it and delete old one
        if (image && image?.name !== existinImageName) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${image.name}`;
            const uploadDir = path.join(process.cwd(), "public/uploads");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            fs.writeFileSync(path.join(uploadDir, filename), buffer);

            // Delete old image
            const oldImagePath = path.join(process.cwd(), "public", existingPost.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            imageUrl = `/uploads/${filename}`;
        }

        // Check if anything changed
        if (caption === existingPost.caption && imageUrl === existingPost.imageUrl) {
            return NextResponse.json({ message: "No changes detected" }, { status: 200 });
        }

        const updatedPost = await updatePostWithEmbeddings(postId, caption, imageUrl);

        return NextResponse.json(updatedPost, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to update post!" },
            { status: 500 }
        );
    }
}

//API to delete post
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get("id");

        if (!postId) {
            return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;

        if (!userId) {
            return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
        }

        // Verify post ownership
        const existingPost = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!existingPost) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        if (existingPost.userId !== userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        // Delete image file
        const imagePath = path.join(process.cwd(), "public", existingPost.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await deletePost(postId);

        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to delete post!" },
            { status: 500 }
        );
    }
}

