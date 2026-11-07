import { createFileRoute, redirect } from "@tanstack/react-router";

// Enlace antiguo: se redirige a la nueva dirección de la Bodega.
export const Route = createFileRoute("/cobros")({
  beforeLoad: () => {
    throw redirect({ to: "/bodega/cobros", replace: true });
  },
});
