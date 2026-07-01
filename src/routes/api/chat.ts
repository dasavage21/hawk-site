import { createFileRoute } from "@tanstack/react-router";
import { db } from "../../db";
import { conversations, leads } from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  getGreeting,
  processUserInput,
  createInitialState,
  serializeMessages,
  deserializeMessages,
  getNextStep,
  type Message,
  type ConversationState,
} from "../../ai/chat-assistant";

/**
 * POST /api/chat — Send a message in a chat conversation.
 *
 * Request body:
 *   businessId: string (required) - the business being chatted with
 *   sessionId: string (required) - client-generated unique session ID
 *   industry: string (optional) - used for greeting, defaults to "generic"
 *   message: string (required for ongoing conversations)
 *
 * On first message (no existing conversation), returns the greeting.
 * On subsequent messages, processes user input through the qualification flow.
 * When all info is collected, automatically creates a lead in the database.
 */
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
    try {
      const body = (await request.json()) as Record<string, unknown>;
      const businessId = String(body.businessId ?? "").trim();
      const sessionId = String(body.sessionId ?? "").trim();
      const industry = String(body.industry ?? "generic").trim();

      if (!businessId || !sessionId) {
        return Response.json(
          { error: "businessId and sessionId are required" },
          { status: 400 },
        );
      }

      // Check for existing conversation
      const existing = await db
        .select()
        .from(conversations)
        .where(eq(conversations.sessionId, sessionId))
        .limit(1);

      let conversation;

      if (existing.length === 0) {
        // New conversation — return greeting
        const greeting = getGreeting(industry);
        const initialMessages: Message[] = [
          { role: "bot", content: greeting },
        ];
        const initialState = createInitialState();
        initialState.step = "asking_service"; // greeting served, move to first question

        const [newConv] = await db
          .insert(conversations)
          .values({
            businessId,
            sessionId,
            messages: serializeMessages(initialMessages),
            status: "active",
          })
          .returning();

        return Response.json({
          sessionId,
          messages: initialMessages,
          state: { step: "asking_service", collected: {} },
          leadCaptured: false,
        });
      }

      // Existing conversation — process user message
      conversation = existing[0];
      const userMessage = String(body.message ?? "").trim();
      if (!userMessage) {
        return Response.json({ error: "message is required" }, { status: 400 });
      }

      const existingMessages = deserializeMessages(conversation.messages);

      // Reconstruct state from messages
      const state = createInitialState();
      // Count messages to determine current step
      const userMessages = existingMessages.filter((m) => m.role === "user");
      const steps = ["greeting", "asking_service", "asking_urgency", "asking_name", "asking_email", "asking_phone", "done"];
      const stepIndex = Math.min(userMessages.length, steps.length - 1);
      state.step = steps[stepIndex] as ConversationState["step"];

      // Reconstruct collected data from user messages
      if (userMessages.length >= 1) state.collected.service = userMessages[0].content;
      if (userMessages.length >= 2) state.collected.urgency = userMessages[1].content;
      if (userMessages.length >= 3) state.collected.name = userMessages[2].content;
      if (userMessages.length >= 4) state.collected.email = userMessages[3].content;
      if (userMessages.length >= 5) state.collected.phone = userMessages[4].content;

      // Process the input
      const { state: newState, response, leadCaptured } = processUserInput(state, userMessage);

      // Add messages
      const updatedMessages: Message[] = [
        ...existingMessages,
        { role: "user", content: userMessage },
        { role: "bot", content: response },
      ];

      // If lead captured, create a lead record
      if (leadCaptured) {
        await db.insert(leads).values({
          businessId,
          name: newState.collected.name || "Chat Lead",
          email: newState.collected.email || "",
          phone: newState.collected.phone || "",
          message: `Service needed: ${newState.collected.service || "N/A"}. Urgency: ${newState.collected.urgency || "N/A"}. From chat assistant.`,
          source: "chat",
        });

        await db
          .update(conversations)
          .set({
            messages: serializeMessages(updatedMessages),
            status: "qualified",
            updatedAt: new Date(),
          })
          .where(eq(conversations.sessionId, sessionId));
      } else {
        await db
          .update(conversations)
          .set({
            messages: serializeMessages(updatedMessages),
            updatedAt: new Date(),
          })
          .where(eq(conversations.sessionId, sessionId));
      }

      return Response.json({
        sessionId,
        messages: [
          { role: "user", content: userMessage },
          { role: "bot", content: response },
        ],
        state: {
          step: newState.step,
          collected: newState.collected,
        },
        leadCaptured,
      });
    } catch (err) {
      console.error("Chat error:", err);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  },
    },
  },
});