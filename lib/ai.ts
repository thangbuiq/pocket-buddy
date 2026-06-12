import { ChatOpenAICompletions } from "@langchain/openai";

export const aiModel = new ChatOpenAICompletions({
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  },
  maxRetries: 3,
});
