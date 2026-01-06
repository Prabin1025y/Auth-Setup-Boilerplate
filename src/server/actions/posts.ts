import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

// CRUD actions
export async function createPost(caption: string, imageUrl: string) {
    return prisma.post.create({
        data: { caption, imageUrl },
    });
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
