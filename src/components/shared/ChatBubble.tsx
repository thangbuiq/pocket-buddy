import { cn } from "@/lib/utils";

export function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  return (
    <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm", role === "user" ? "ml-auto bg-indigo-600 text-white" : "bg-slate-800 text-slate-100")}>{content}</div>
  );
}
