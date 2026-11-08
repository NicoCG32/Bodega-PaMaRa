# Rutas de PaMaRa Bodega

TanStack Start genera las rutas a partir de los archivos de esta carpeta.

| Archivo                            | Ruta                             | Pantalla                                       |
| ---------------------------------- | -------------------------------- | ---------------------------------------------- |
| `index.tsx`                        | `/`                              | Boutique pública.                              |
| `bodega.index.tsx`                 | `/bodega`                        | Inicio y registro de operaciones.              |
| `bodega.cobros.tsx`                | `/bodega/cobros`                 | Fiados, abonos y cuotas.                       |
| `bodega.encargos.tsx`              | `/bodega/encargos`               | Encargos y entregas.                           |
| `bodega.stock.tsx`                 | `/bodega/stock`                  | Productos y existencias.                       |
| `bodega.ajustes.tsx`               | `/bodega/ajustes`                | Precios, respaldo y avisos.                    |
| `api/public/jobs/recordatorios.ts` | `/api/public/jobs/recordatorios` | Endpoint de recordatorios con secreto de cron. |

`__root.tsx` define la estructura común. Las pantallas de gestión se envuelven con `AppShell` y `AdminGate`, que comprueba la sesión y el rol administrador. La Boutique usa su propia presentación.

Las rutas anteriores redirigen a las actuales: `/vault` a `/bodega`, `/cobros` a `/bodega/cobros`, `/encargos` a `/bodega/encargos`, `/catalogo` a `/bodega/stock` y `/ajustes` a `/bodega/ajustes`. El archivo `src/routeTree.gen.ts` se genera automáticamente.

[Arquitectura](../../docs/tecnica/01-arquitectura.md) · [Desarrollo local](../../docs/desarrollo/01-desarrollo-local.md)
