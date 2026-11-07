import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { NubeCard } from "@/components/NubeCard";
import { InstalarCard } from "@/components/InstalarCard";
import { PreciosCard } from "@/components/PreciosCard";

export const Route = createFileRoute("/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes · PaMaRa AyN" },
      { name: "description", content: "Respaldo, avisos e instalación de la app PaMaRa AyN." },
      { property: "og:title", content: "Ajustes · PaMaRa AyN" },
      { property: "og:description", content: "Respaldo, avisos e instalación." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ajustes,
});

function Ajustes() {
  return (
    <div className="space-y-4">
      <Link to="/vault" className="flex h-12 items-center gap-2 text-lg font-bold text-primary">
        <ArrowLeft /> Volver
      </Link>
      <h2 className="text-3xl font-semibold">Ajustes</h2>
      <PreciosCard />
      <NubeCard />
      <InstalarCard />
    </div>
  );
}
