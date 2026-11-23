import { createFileRoute } from "@tanstack/react-router";
import { CollageEditor } from "@/components/CollageEditor";

export const Route = createFileRoute("/bodega/promociones")({
  head: () => ({
    meta: [
      { title: "Crear collage · PaMaRa AyN" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CollageEditor,
});
