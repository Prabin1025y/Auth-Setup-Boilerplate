import { InferenceClient, type FeatureExtractionOutput } from "@huggingface/inference";
import Bytez from "bytez.js"


const HF_API_KEY = process.env.HF_API_KEY;
const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;

// Text embedding
export async function createTextEmbedding(text: string) {
    try {
        // Validate API key
        if (!HF_API_KEY) {
            throw new Error('Unauthorized usage of HF API');
        }

        const client = new InferenceClient(HF_API_KEY);

        const output = await client.featureExtraction({
            model: "intfloat/multilingual-e5-large",
            inputs: text,
            provider: "hf-inference",
        });

        return normalizeEmbedding(output);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to create text embedding: ${error.message}`);
        }
        throw new Error('Failed to create text embedding: Unknown error occurred');
    }
}

// Image embedding
export async function createImageEmbedding(imagePath: string) {
    try {
        // Validate API key
        if (!BYTEZ_API_KEY) {
            throw new Error('Unauthorized usage of HF API');
        }

        // Validate frontend URL
        if (!process.env.NEXT_PUBLIC_FRONTEND_URL) {
            throw new Error('NEXT_PUBLIC_FRONTEND_URL environment variable is not set');
        }

        const key = BYTEZ_API_KEY;
        const sdk = new Bytez(key);

        // choose blip-image-captioning-base
        const model = sdk.model("Salesforce/blip-image-captioning-base");

        // send input to model
        const { error, output } = await model.run(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/${imagePath}`);

        if (error) {
            throw new Error(`Image captioning failed: ${error}`);
        }

        if (!output || typeof output !== 'string') {
            throw new Error('Invalid output from image captioning model');
        }

        const imageEmbedding = await createTextEmbedding(output);
        return { imageEmbedding, caption: output };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to create image embedding: ${error.message}`);
        }
        throw new Error('Failed to create image embedding: Unknown error occurred');
    }
}

function normalizeEmbedding(output: FeatureExtractionOutput): number[] {
    try {
        if (!output) {
            throw new Error('Embedding output is null or undefined');
        }

        if (!Array.isArray(output)) {
            throw new Error('Embedding output must be an array');
        }

        if (output.length === 0) {
            throw new Error('Embedding output array is empty');
        }

        // If output is a 1D array of numbers
        if (typeof output[ 0 ] === "number") {
            return output as number[];
        }

        // If output is a 2D array (batch of embeddings), return the first one
        if (Array.isArray(output[ 0 ])) {
            const firstEmbedding = (output as number[][])[ 0 ];
            if (!firstEmbedding || firstEmbedding.length === 0) {
                throw new Error('First embedding in batch is empty or invalid');
            }
            return firstEmbedding;
        }

        throw new Error('Embedding output format is not recognized');
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to normalize embedding: ${error.message}`);
        }
        throw new Error('Failed to normalize embedding: Unknown error occurred');
    }
}