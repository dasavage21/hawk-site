import { createFileRoute } from "@tanstack/react-router";
import { generateAdCopy } from "../../../ai/ad-generator";

export const Route = createFileRoute("/api/ads/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as any;
        const { businessId } = body;

        if (!businessId) {
          return Response.json({ error: "businessId is required" }, { status: 400 });
        }

        const adCopy = await generateAdCopy(businessId);
        return Response.json(adCopy);
      },
    },
  },
});
