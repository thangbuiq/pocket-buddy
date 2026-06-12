import { ChatOpenAI } from "@langchain/openai";

export const aiModel = new ChatOpenAI({
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  },
  maxRetries: 3,
});
