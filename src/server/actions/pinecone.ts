import { Pinecone } from "@pinecone-database/pinecone";
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
  });

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

export async function upsertPostEmbeddings(postId: string, textEmbedding: number[], imageEmbedding: number[]) {
  // Text vector
//   await index.upsert({
//     upsertRequest: {
//       vectors: [
//         { id: postId, values: textEmbedding, metadata: { type: "text" } },
//       ],
//       namespace: "text-namespace",
//     },
//   });

//   // Image vector
//   await index.upsert({
//     upsertRequest: {
//       vectors: [
//         { id: postId, values: imageEmbedding, metadata: { type: "image" } },
//       ],
//       namespace: "image-namespace",
//     },
//   });
}
