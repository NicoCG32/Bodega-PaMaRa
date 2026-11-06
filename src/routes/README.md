# Rutas de PaMaRa Bodega

TanStack Start genera las rutas a partir de los archivos de esta carpeta.

| Archivo                            | Ruta                             | Pantalla                                       |
| ---------------------------------- | -------------------------------- | ---------------------------------------------- |
| `index.tsx`                        | `/`                              | Boutique pública.                              |
| `vault.tsx`                        | `/vault`                         | Registro por voz o texto.                      |
| `cobros.tsx`                       | `/cobros`                        | Fiados, abonos y cuotas.                       |
| `encargos.tsx`                     | `/encargos`                      | Encargos y entregas.                           |
| `catalogo.tsx`                     | `/catalogo`                      | Productos y existencias.                       |
| `ajustes.tsx`                      | `/ajustes`                       | Precios, respaldo, avisos y PIN.               |
| `api/public/jobs/recordatorios.ts` | `/api/public/jobs/recordatorios` | Endpoint de recordatorios con secreto de cron. |

`__root.tsx` define la estructura común. Las pantallas de gestión se envuelven con `AppShell` y `AdminGate`; la Boutique usa su propia presentación. El archivo `src/routeTree.gen.ts` se genera automáticamente.

[Arquitectura](../../docs/tecnica/01-arquitectura.md) · [Desarrollo local](../../docs/desarrollo/01-desarrollo-local.md)
