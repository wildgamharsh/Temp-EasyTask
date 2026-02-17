export interface Model {
    id?: string;
    model_name: string;
    model_title: string;
}

export interface ModelConfig {
    baseUrl: string;
    apiKey: string;
    modelName: string;
}

export const HARDCODED_MODELS: Model[] = [

    { model_name: "meta-llama/llama-3.3-70b-instruct:free", model_title: "Llama 3.3 70B Instruct" },
    { model_name: "nvidia/nemotron-3-nano-30b-a3b:free", model_title: "Nvidia Nemotron 3 Nano" },
    { model_name: "mistralai/devstral-2512:free", model_title: "Mistral Devstral 2512" },
    { model_name: "tngtech/deepseek-r1t2-chimera:free", model_title: "DeepSeek R1T2 Chimera" },
    { model_name: "tngtech/deepseek-r1t-chimera:free", model_title: "DeepSeek R1T Chimera" },
    { model_name: "z-ai/glm-4.5-air:free", model_title: "GLM 4.5 Air" },
    { model_name: "deepseek/deepseek-r1-0528:free", model_title: "DeepSeek R1 0528" },
    { model_name: "tngtech/tng-r1t-chimera:free", model_title: "TNG R1T Chimera" },
    { model_name: "qwen/qwen3-coder:free", model_title: "Qwen 3 Coder" },
    { model_name: "google/gemma-3-27b-it:free", model_title: "Gemma 3 27B IT" },
    { model_name: "openai/gpt-oss-120b:free", model_title: "GPT OSS 120B" },
    { model_name: "openai/gpt-oss-20b:free", model_title: "GPT OSS 20B" },
    { model_name: "google/gemini-2.0-flash-exp:free", model_title: "Gemini 2.0 Flash Exp" },
    { model_name: "qwen/qwen3-next-80b-a3b-instruct:free", model_title: "Qwen 3 Next 80B" },
    { model_name: "arcee-ai/trinity-mini:free", model_title: "Arcee Trinity Mini" },
    { model_name: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", model_title: "Dolphin Mistral 24B" },
    { model_name: "nvidia/nemotron-nano-9b-v2:free", model_title: "Nvidia Nemotron Nano 9B" },
    { model_name: "moonshotai/kimi-k2:free", model_title: "Moonshot Kimi K2" },
    { model_name: "liquid/lfm-2.5-1.2b-instruct:free", model_title: "Liquid LFM 2.5 1.2B Instruct" },
    { model_name: "qwen/qwen3-4b:free", model_title: "Qwen 3 4B" },
    { model_name: "google/gemma-3-12b-it:free", model_title: "Gemma 3 12B IT" },
    { model_name: "meta-llama/llama-3.2-3b-instruct:free", model_title: "Llama 3.2 3B Instruct" },
    { model_name: "google/gemma-3-4b-it:free", model_title: "Gemma 3 4B IT" },
    { model_name: "liquid/lfm-2.5-1.2b-thinking:free", model_title: "Liquid LFM 2.5 1.2B Thinking" },
];
