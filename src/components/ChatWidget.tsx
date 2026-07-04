import { useState, useRef, useEffect, type FormEvent } from "react";

export interface ChatWidgetProps {
  /** The business ID this chat belongs to */
  businessId: string;
  /** The business industry for greeting customization */
  industry?: string;
  /** Optional position (default: "right") */
  position?: "left" | "right";
}

interface ChatMessage {
  role: "bot" | "user";
  content: string;
}

/**
 * AI Chat Assistant Widget for local business websites.
 *
 * Floating chat button → expands into a chat window →
 * guides visitors through lead qualification → captures leads.
 *
 * Embeds in generated websites by passing businessId and industry props.
 */
export function ChatWidget({
  businessId,
  industry = "generic",
  position = "right",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize chat on first open
  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, sessionId, industry }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start chat");
      }

      setMessages(data.messages || []);
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
      setMessages([
        { role: "bot", content: "Hi! How can we help you today?" },
      ]);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          sessionId,
          industry,
          message: text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Add bot response
      const newMessages = data.messages || [];
      setMessages((prev) => [...prev, ...newMessages.filter((m: ChatMessage) => m.role === "bot")]);

      if (data.leadCaptured) {
        setLeadCaptured(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, I had trouble connecting. Please try again or call us directly." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage(text);
  };

  const posClasses =
    position === "left"
      ? "left-4 right-auto"
      : "right-4 left-auto";

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          style={{ [position]: "16px" }}
          aria-label="Open chat"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 z-50 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl ${posClasses}`}
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                AI
              </div>
              <div>
                <p className="text-sm font-semibold">Chat Assistant</p>
                <p className="text-xs text-white/70">We typically reply instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 hover:bg-white/20"
              aria-label="Close chat"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: "320px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2 text-sm text-gray-500">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {leadCaptured && (
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <p className="text-sm font-medium text-green-800">✅ Thanks!</p>
                <p className="text-xs text-green-700">
                  We'll get back to you shortly. Feel free to keep chatting!
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/**
 * Generate an embed snippet for adding the chat widget to any website.
 * Returns a self-contained HTML/JS snippet.
 */
export function generateChatEmbedSnippet(
  businessId: string,
  industry: string,
): string {
  // We use the server URL from the current window location
  return `<!-- LocalAmp Chat Widget -->
<div id="localamp-chat" data-business-id="${businessId}" data-industry="${industry}"></div>
<script>
(function() {
  var s = document.createElement('script');
  s.src = window.location.origin + '/embed/chat.js';
  s.async = true;
  document.body.appendChild(s);
})();
</script>`;
}