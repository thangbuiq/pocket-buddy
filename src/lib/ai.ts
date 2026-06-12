import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export const aiModel = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");
