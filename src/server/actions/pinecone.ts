import { prisma } from "@/lib/prisma";
import { Pinecone, RecordMetadata, ScoredPineconeRecord } from "@pinecone-database/pinecone";

//Pinecone client to interact with pinecone db
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!, process.env.PINECONE_INDEX_HOST!);


export async function upsertPostEmbeddings(
  postId: string,
  textEmbedding: number[] | null,
  imageEmbedding: number[] | null,
  caption: string | null
) {
  try {
    const upsertPromises = [];

    // Text vector - only upsert if provided
    if (textEmbedding) {
      upsertPromises.push(
        index.namespace("text-namespace").upsert([
          {
            id: postId,
            values: textEmbedding,
            metadata: { type: "text" }
          }
        ])
      );
    }

    // Image vector - only upsert if provided
    if (imageEmbedding && caption) {
      upsertPromises.push(
        index.namespace("image-namespace").upsert([
          {
            id: postId,
            values: imageEmbedding,
            metadata: { type: "image", caption: caption }
          }
        ])
      );
    }

    // Execute all upserts in parallel
    if (upsertPromises.length > 0) {
      await Promise.all(upsertPromises);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed upsert post embedding: ${error.message}`);
    }
    throw new Error('Failed to upsert post embedding: Unknown error occurred');
  }
}

export async function getSimilarPosts(postId: string) {
  const TEXT_WEIGHT = 0.4;
  const IMAGE_WEIGHT = 0.6;
  const CANDIDATES = 20;
  const FINAL_K = 6;

  console.log("coming")

  //Fetch embedding for currently shown post
  const [ textEmbeddingFetchResult, imageEmbeddingFetchResult ] = await Promise.all([
    index.namespace("text-namespace").fetch([ postId ]),
    index.namespace("image-namespace").fetch([ postId ])
  ])


  const currentPostTextEmbedding = textEmbeddingFetchResult?.records[ postId ]?.values;
  const currentPostImageEmbedding = imageEmbeddingFetchResult?.records[ postId ]?.values;

  // console.log(currentPostImageEmbedding)

  if (!currentPostImageEmbedding && !currentPostTextEmbedding)
    return []

  //Search the vector database with embedding vectors of current post
  const [ textResults, imageResults ] = await Promise.all([
    currentPostTextEmbedding
      ? index.namespace("text-namespace").query({
        vector: currentPostTextEmbedding,
        topK: CANDIDATES,
        includeMetadata: true,
      })
      : null,

    currentPostImageEmbedding
      ? index.namespace('image-namespace').query({
        vector: currentPostImageEmbedding,
        topK: CANDIDATES,
        includeMetadata: true,
      })
      : null,
  ]);

  // 3. Normalize scores (min-max)
  const normalize = (matches: ScoredPineconeRecord<RecordMetadata>[]) => {
    if (!matches || matches.length === 0) return {};
    const scores = matches.map(m => m.score ?? 0);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    return Object.fromEntries(
      matches.map(m => [
        m.id,
        max === min ? 1 : (m.score! - min) / (max - min),
      ])
    );
  };

  const textScores = normalize(textResults?.matches || []);
  const imageScores = normalize(imageResults?.matches || []);

  // 4. Late fusion with weights
  const fusedScores: Record<string, number> = {};

  for (const [ id, score ] of Object.entries(textScores)) {
    fusedScores[ id ] = (fusedScores[ id ] || 0) + TEXT_WEIGHT * score;
  }

  for (const [ id, score ] of Object.entries(imageScores)) {
    fusedScores[ id ] = (fusedScores[ id ] || 0) + IMAGE_WEIGHT * score;
  }

  delete fusedScores[ postId ];

  // 5. Final ranking
  const rankedIds = Object.entries(fusedScores)
    .sort((a, b) => b[ 1 ] - a[ 1 ])
    .slice(0, FINAL_K)
    .map(([ id ]) => id);

  if (rankedIds.length === 0) return [];

  // 6. Fetch posts & preserve order
  const posts = await prisma.post.findMany({
    where: { id: { in: rankedIds } },
  });

  console.log(posts)

  return rankedIds.map(id => posts.find(p => p.id === id)).filter((post): post is NonNullable<typeof post> => post !== undefined);;
}