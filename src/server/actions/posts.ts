'use server'

import { prisma } from "@/lib/prisma";
import { createImageEmbedding, createTextEmbedding } from "./embeddings";
import { upsertPostEmbeddings } from "./pinecone";

export async function createPostWithEmbeddings(caption: string, imageUrl: string, userId: string) {
    //create embeddings of image and text
    const [ textEmbedding, imageEmbedding ] = await Promise.all([
        createTextEmbedding(caption),
        createImageEmbedding(imageUrl)
    ])

    //Create post
    const post = await prisma.post.create({
        data: {
            userId,
            caption,
            imageUrl,
            embeddingDim: 1024,
            textEmbeddingModel: "intfloat/multilingual-e5-large",
            imageCaptioningModel: "Salesforce/blip-image-captioning-base",
            embeddingUpdatedAt: new Date()
        }
    })

    //Add embedding records to pinecone
    await upsertPostEmbeddings(post.id, textEmbedding, imageEmbedding.imageEmbedding, imageEmbedding.caption);

    //update pinecone vectors id
    const updatedPost = await prisma.post.update({
        where: { id: post.id },
        data: { pineconeTextVectorId: post.id, pineconeImageVectorId: post.id },
    });

    return updatedPost;

}

export async function getPosts() {
    return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getPost(id: string) {
    return prisma.post.findUnique({ where: { id } });
}

export async function updatePost(id: string, caption?: string, imageUrl?: string) {
    return prisma.post.update({
        where: { id },
        data: { caption, imageUrl },
    });
}

export async function updatePostWithEmbeddings(
    postId: string,
    caption: string,
    imageUrl: string
) {
    // Get existing post to compare what changed
    const existingPost = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!existingPost) {
        throw new Error("Post not found");
    }

    const captionChanged = caption !== existingPost.caption;
    const imageChanged = imageUrl !== existingPost.imageUrl;

    // Only create embeddings for what changed
    let textEmbedding = null;
    let imageEmbedding = null;
    let imageCaption = null;

    if (captionChanged && imageChanged) {
        // Both changed - generate both embeddings
        const [ textEmb, imageEmb ] = await Promise.all([
            createTextEmbedding(caption),
            createImageEmbedding(imageUrl)
        ]);
        textEmbedding = textEmb;
        imageEmbedding = imageEmb.imageEmbedding;
        imageCaption = imageEmb.caption;
    } else if (captionChanged) {
        // Only caption changed
        textEmbedding = await createTextEmbedding(caption);
    } else if (imageChanged) {
        // Only image changed
        const imageEmb = await createImageEmbedding(imageUrl);
        imageEmbedding = imageEmb.imageEmbedding;
        imageCaption = imageEmb.caption;
    }

    // Update post in database
    const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
            caption,
            imageUrl,
            embeddingUpdatedAt: new Date()
        }
    });

    // Update embeddings in Pinecone only for what changed
    if (textEmbedding && imageEmbedding) {
        // Both changed
        await upsertPostEmbeddings(postId, textEmbedding, imageEmbedding, imageCaption!);
    } else if (textEmbedding) {
        // Only text changed
        await upsertPostEmbeddings(postId, textEmbedding, null, null);
    } else if (imageEmbedding) {
        // Only image changed
        await upsertPostEmbeddings(postId, null, imageEmbedding, imageCaption!);
    }

    return updatedPost;
}

export async function deletePost(id: string) {
    return prisma.post.delete({ where: { id } });
}
