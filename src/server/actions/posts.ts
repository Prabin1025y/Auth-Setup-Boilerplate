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

export async function deletePost(id: string) {
    return prisma.post.delete({ where: { id } });
}
