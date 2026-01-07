import { InferenceClient, type FeatureExtractionOutput } from "@huggingface/inference";
import Bytez from "bytez.js"


const HF_API_KEY = process.env.HF_API_KEY!;
const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY!;

// Text embedding
export async function getTextEmbedding(text: string) {
    const client = new InferenceClient(HF_API_KEY);

    const output = await client.featureExtraction({
        model: "intfloat/multilingual-e5-large",
        inputs: text,
        provider: "hf-inference",
    });

    return normalizeEmbedding(output);
}

// Image embedding placeholder
export async function getImageEmbedding(imagePath: string) {
    const key = BYTEZ_API_KEY
    const sdk = new Bytez(key)

    // choose blip-image-captioning-base
    const model = sdk.model("Salesforce/blip-image-captioning-base")

    // send input to model
    const { error, output } = await model.run(`${imagePath}`)

    if (!error) {
        const imageEmbedding = await getTextEmbedding(output);
        return { imageEmbedding, caption: output };
    } else {
        throw new Error(error || "Error occured while generating image embeddings");
    }
}

function normalizeEmbedding(output: FeatureExtractionOutput): number[] {
    if (Array.isArray(output)) {
        if (output.length === 0) return [];

        if (typeof output[0] === "number") {
            return output as number[];
        }

        if (Array.isArray(output[0])) {
            return (output as number[][])[0];
        }
    }

    throw new Error("Invalid embedding output format");
}