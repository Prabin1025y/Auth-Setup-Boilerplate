export interface PostType {
    // isOwner: boolean;
    id: string;
    userId: string;
    caption: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    pineconeTextVectorId: string | null;
    pineconeImageVectorId: string | null;
    textEmbeddingModel: string | null;
    imageCaptioningModel: string | null;
    embeddingDim: number | null;
    embeddingUpdatedAt: Date | null;
}