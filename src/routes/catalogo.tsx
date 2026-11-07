import { createFileRoute, redirect } from "@tanstack/react-router";

// Enlace antiguo: se redirige a la nueva dirección de la Bodega.
export const Route = createFileRoute("/catalogo")({
  beforeLoad: () => {
    throw redirect({ to: "/bodega/stock", replace: true });
  },
});
