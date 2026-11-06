# Arquitectura · de la persona al código

PaMaRa Bodega es una aplicación **web con servidor**, estado local y servicios externos. El APK Android abre el sitio publicado mediante una Trusted Web Activity.

## Nivel 1 · Contexto

```mermaid
flowchart LR
  Adm[Administradora] --> Vault[PaMaRa Vault]
  Cli[Visitante] --> Shop[PaMaRa Boutique]
  Vault --> DB[(Supabase)]
  Shop --> DB
  Vault --> AI[Groq]
  Vault --> WA[WhatsApp y Facebook]
  Shop --> WA
  Cron[Programador externo] --> Avisos[Servicio de recordatorios]
  Avisos --> DB
  Avisos --> Push[Firebase Cloud Messaging]
```

**Límites:** los clientes de la boutique no deben ver deudas ni teléfonos; el servicio Groq procesa sólo lo enviado a sus funciones; la entrega de mensajes de WhatsApp ocurre fuera del sistema.

## Nivel 2 · Contenedores y ejecución

```mermaid
flowchart TB
  subgraph Dispositivo[Teléfono o navegador]
    UI[React: Boutique y Vault]
    Local[(localStorage)]
    Voz[Micrófono y Web Speech API]
    UI <--> Local
    UI <--> Voz
  end
  subgraph Aplicacion[Servidor TanStack Start]
    SF[Funciones de servidor]
    Public[Proyección pública de catálogo]
    CronAPI[Endpoint autenticado de cron]
  end
  UI <-->|HTTPS| SF
  UI <-->|HTTPS GET| Public
  SF <--> DB[(Supabase Auth y Postgres)]
  UI <-->|Sesión y respaldo con RLS| DB
  Public -->|Consulta privilegiada| DB
  SF --> Groq[Groq API]
  CronAPI --> DB
  CronAPI --> FCM[FCM a través del gateway]
  UI -->|Pedido preparado| WA[WhatsApp]
```

`localStorage` pertenece al origen y perfil del navegador. El servidor ejecuta las funciones de IA, consulta pública del catálogo y recordatorios.

## Nivel 3 · Componentes del proyecto

```mermaid
flowchart LR
  subgraph Frontend
    R[Routes: index, vault, cobros, encargos, catalogo]
    VC[VoiceCapture y BodegaCapture]
    S[store.ts: estado y reglas]
    B[boutique.ts: proyección y pedido]
    SY[cloudSync.ts]
  end
  subgraph Backend
    A[ai.functions.ts]
    BF[boutique.functions.ts]
    PF[push.functions.ts]
    J[recordatorios.ts]
  end
  R --> VC
  R --> S
  R --> B
  VC --> A
  SY -->|Supabase cliente con RLS| DB[(Backups)]
  BF -->|Supabase admin| DB
  R --> BF
  R --> PF
  J -->|Supabase admin| DB
```

| Responsabilidad            | Archivo principal                                                                                  | Función                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Estado y reglas            | [`store.ts`](../../src/lib/store.ts)                                                               | Deudas, cuotas, abonos, productos, encargos y precios.                |
| Captura y validación de IA | [`ai.functions.ts`](../../src/lib/ai.functions.ts)                                                 | Funciones servidor, validación con Zod, Groq.                         |
| Dictado alternativo        | [`vozNativa.ts`](../../src/lib/vozNativa.ts)                                                       | Web Speech y transcripción grabada concurrentes.                      |
| Respaldo                   | [`cloudSync.ts`](../../src/lib/cloudSync.ts)                                                       | Snapshot completo por cuenta y temporizador de subida.                |
| Vista pública              | [`boutique.functions.ts`](../../src/lib/boutique.functions.ts)                                     | Lee `backups` y convierte productos en `ItemPublico`.                 |
| Protección de rutas        | [`__root.tsx`](../../src/routes/__root.tsx), [`AdminGate.tsx`](../../src/components/AdminGate.tsx) | Separación visual y PIN **del lado cliente**.                         |
| Notificaciones             | [`recordatorios.ts`](../../src/routes/api/public/jobs/recordatorios.ts)                            | Trabajo HTTP protegido por secreto, lectura de snapshots y envío FCM. |

Las reglas de precios, saldos y existencias están en `store.ts`; los componentes coordinan la captura y confirmación de operaciones.

## Nivel 4 · Despliegue

```mermaid
flowchart TD
  Repo[Repositorio GitHub] --> CI[CI: calidad y pruebas]
  Repo --> WebBuild[Build web y publicación en Lovable]
  Repo --> AndroidBuild[GitHub Actions: Gradle y firma APK]
  AndroidBuild --> Release[GitHub Releases: APK beta + SHA256]
  WebBuild --> Site[Sitio HTTPS con TanStack Start]
  Release --> TWA[Android TWA instalada]
  TWA -->|Necesita conexión| Site
  Browser[Navegador web] --> Site
  Site --> Supa[(Supabase)]
  Site --> Groq[Groq]
  Site --> Push[FCM / gateway]
```

La web y el APK se publican por separado. El workflow Android genera una beta con **cada push a `main`**, incluidos los cambios de documentación.

## Decisiones y consecuencias

- **Snapshot frente a tablas normalizadas:** simplifica respaldar un negocio de una administradora, pero complica conflictos y consulta de un historial transaccional.
- **IA como propuesta:** facilita registrar narraciones, pero requiere confirmar montos, códigos y cantidades.
- **TWA frente a app nativa:** conserva el servidor y el OAuth web, a costa de depender de la conectividad y del navegador.
- **Catálogo derivado de backups:** evita duplicar inventarios, pero debe fijarse la cuenta propietaria y revisar qué productos se publican por defecto.

[Modelo y estados](02-dominio-y-reglas.md) · [Persistencia](03-persistencia-y-sincronizacion.md) · [Pruebas](../desarrollo/03-pruebas-y-limitaciones.md)
