import { prisma } from "@/lib/prisma";
import { getImageEmbedding, getTextEmbedding } from "./embeddings";
import { upsertPostEmbeddings } from "./pinecone";

// CRUD actions
export async function createPost(caption: string, imageUrl: string) {
    return prisma.post.create({
        data: { caption, imageUrl },
    });
}

export async function createPostWithEmbeddings(caption: string, imageUrl: string) {
    // const textEmbedding = await getTextEmbedding(caption);
    // const imageEmbedding = await getImageEmbedding(imageUrl);

    const [textEmbedding, imageEmbedding] = await Promise.all([
        getTextEmbedding(caption),
        getImageEmbedding(imageUrl)
    ])

    const post = await prisma.post.create({
        data: {
            caption,
            imageUrl,
            embeddingDim: 1024,
            textEmbeddingModel: "intfloat/multilingual-e5-large",
            imageCaptioningModel: "Salesforce/blip-image-captioning-base",
            embeddingUpdatedAt: new Date()
        }
    })

    await upsertPostEmbeddings(post.id, textEmbedding, imageEmbedding.imageEmbedding, imageEmbedding.caption);

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
