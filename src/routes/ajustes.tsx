import { createFileRoute, redirect } from "@tanstack/react-router";

// Enlace antiguo: se redirige a la nueva dirección de la Bodega.
export const Route = createFileRoute("/ajustes")({
  beforeLoad: () => {
    throw redirect({ to: "/bodega/ajustes", replace: true });
  },
});
