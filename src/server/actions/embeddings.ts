import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Text embedding
export async function getTextEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    console.log(response.data[0].embedding)
    return response.data[0].embedding;
}

// Image embedding placeholder
export async function getImageEmbedding(imagePath: string) {
    // Option 1: convert image to Base64 and call OpenAI / CLIP
    const imageData = fs.readFileSync(path.join(process.cwd(), "public", imagePath), "base64");

    // Placeholder: return random vector for now
    return Array(512).fill(0).map(() => Math.random());
}
