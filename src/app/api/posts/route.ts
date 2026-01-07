import { createPostWithEmbeddings, getPosts } from "@/server/actions/posts";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

//API to get all posts
export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get("x-user-id")
        console.log(userId)
        const posts = await getPosts();
        const postsModified = posts.map(post => ({
            ...post,
            isOwner: userId ? (post.userId === userId ? true : false) : false
        }))
        return NextResponse.json(postsModified);
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

        const userId = req.headers.get("x-user-id");

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

        const imageUrl = `/uploads/${filename}`;
        const post = await createPostWithEmbeddings(caption, imageUrl, userId);

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Failed to create post!" },
            { status: 500 }
        );
    }
}

