"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { ChatBubble } from "@/components/shared/ChatBubble";

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant",
        body: {
          context: {
            periodDays: 90,
            summary: {
              topCategories: ["Food", "Rent", "Transport"],
              monthlyAverageExpense: 1930,
              budgetUtilization: { food: 70, transport: 64, entertainment: 88 },
            },
          },
        },
      }),
    []
  );
  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <h1 className="mb-4 text-2xl font-semibold">AI Financial Assistant</h1>
      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">Try: “How can I save $200 next month?”</p>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              role={message.role === "assistant" ? "assistant" : "user"}
              content={message.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}
            />
          ))
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="mt-3 flex gap-2"
      >
        <input
          className="min-h-11 flex-1 rounded-xl bg-slate-900 px-3"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask Pocket Buddy anything about your money..."
        />
        <button className="min-h-11 rounded-xl bg-indigo-600 px-4 font-medium" disabled={isLoading}>
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
