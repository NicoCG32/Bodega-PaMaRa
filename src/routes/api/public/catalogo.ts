import { createFileRoute } from "@tanstack/react-router";
import { catalogoPublico } from "@/lib/boutique.functions";

export const Route = createFileRoute("/api/public/catalogo")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(await catalogoPublico(), {
          headers: { "cache-control": "no-store" },
        }),
    },
  },
});
