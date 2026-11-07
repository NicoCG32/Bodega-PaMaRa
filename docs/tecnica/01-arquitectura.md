# Arquitectura · del negocio a los servicios

[← Técnica](../README.md) · [Dominio](02-dominio-y-reglas.md) · [Datos](03-persistencia-y-sincronizacion.md) · [Seguridad](05-boutique-y-seguridad.md)

PaMaRa Bodega combina **administración privada y catálogo público**, pero no los guarda de la misma forma. El modelo técnico actual tiene **tablas compartidas de productos y precios**, un **respaldo JSON por cuenta** para el resto del estado y una **copia local** para la experiencia en el dispositivo.

> **Alcance de esta auditoría:** los diagramas representan código y migraciones del repositorio. No prueban por sí solos que los permisos, credenciales y proveedores estén configurados del mismo modo en un entorno publicado.

## C1 · Contexto del sistema

```mermaid
flowchart LR
    A["Administradora<br/>PaMaRa AyN"] --> B["PaMaRa Bodega<br/>gestión privada"]
    C["Visitante"] --> D["PaMaRa Boutique<br/>catálogo público"]
    B --> S[("Supabase · productos,<br/>precios y respaldos")]
    D --> S
    B --> G["Groq · captura<br/>asistida"]
    D --> W["WhatsApp · consulta<br/>sin cierre automático"]
    B --> N["Notificaciones<br/>condicionadas a configuración"]
    classDef business fill:#f8eef2,stroke:#895570,color:#352b33,stroke-width:1.5px;
    classDef external fill:#eaf0f7,stroke:#557493,color:#25374a;
    class B,D business;
    class S,G,W,N external;
```

**PaMaRa AyN** es el emprendimiento familiar. **Bodega** es el software que lo apoya; la Boutique pública es una interfaz de consulta del mismo producto informático.

## C2 · Contenedores y límites de confianza

```mermaid
flowchart TB
    subgraph DEV["Dispositivo y navegador"]
        UI["React · Boutique y Bodega"]
        LOCAL[("localStorage · State")]
        UI <--> LOCAL
        UI --> AUTH["Supabase Auth<br/>Google y rol admin"]
        UI --> WRITE["Supabase cliente<br/>productos, precios, backups"]
    end
    subgraph WEB["Runtime TanStack Start"]
        CAT["catalogoPublico()<br/>lectura con clave publicable"]
        IA["Funciones Groq<br/>texto, voz y visión"]
        CRON["POST /api/public/jobs/recordatorios<br/>Bearer secreto"]
    end
    subgraph DB["Supabase / PostgreSQL"]
        PD[("productos y ajustes_tienda")]
        BK[("backups y push_tokens")]
        ROLES[("user_roles")]
    end
    UI --> CAT
    UI --> IA
    WRITE --> PD
    WRITE --> BK
    AUTH --> ROLES
    CAT -->|"lectura pública con RLS"| PD
    IA --> GROQ["Groq API"]
    CRON -->|"acceso privilegiado, solo servidor"| BK
    CRON --> FCM["FCM vía conector"]
    UI --> WA["WhatsApp"]
    classDef local fill:#fff2eb,stroke:#bf704a,color:#422d30;
    classDef backend fill:#eaf0f8,stroke:#537492,color:#293c51;
    class UI,LOCAL local;
    class PD,BK,ROLES,CAT,IA,CRON backend;
```

**No confundir:**

- La Boutique pública obtiene `data` de **`productos`**, restringidos por `en_boutique = true` y la política RLS; también lee `ajustes_tienda`. **No consulta el respaldo global más reciente.**
- Bodega solicita sesión Google y rol **`admin`** a través de `AdminGate.tsx` y `has_role`. No usa un PIN local como autorización principal.
- `backups` guarda deudas, encargos, teléfonos y el estado completo **de la cuenta autenticada**. No es la tabla del catálogo.
- `productosSync.ts` y `cloudSync.ts` son procesos diferentes que interactúan con el mismo `State` local; su concurrencia necesita pruebas.
- Las funciones Groq tienen clave privada de servidor y validaciones de entrada. **Disponer de una clave no equivale a autorización por usuario**; sus restricciones deben revisarse antes de ampliar el uso.

## C3 · Componentes y responsabilidades

```mermaid
flowchart LR
    ROOT["__root.tsx<br/>AppShell + AdminGate"] --> B["/bodega/*<br/>cobros, encargos, stock"]
    ROOT --> STORE["store.ts<br/>State y reglas"]
    B --> VOZ["VoiceCapture / BodegaCapture"]
    VOZ --> IA["ai.functions.ts<br/>Groq"]
    STORE --> LOCAL[("localStorage")]
    STORE --> SYNC["productosSync.ts"]
    STORE --> BACK["cloudSync.ts"]
    SYNC --> PD[("productos<br/>ajustes_tienda")]
    BACK --> BAK[("backups")]
    SHOP["/ · Boutique"] --> API["boutique.functions.ts"]
    API --> PD
    SHOP --> CART["boutique.ts<br/>bolsa / WhatsApp"]
    classDef module fill:#f5edf1,stroke:#8c5c77,color:#392c39;
    class ROOT,B,VOZ,SHOP module;
```

| Componente | Código | Responsabilidad |
| --- | --- | --- |
| Entrada y autorización | [`__root.tsx`](../../src/routes/__root.tsx), [`AdminGate.tsx`](../../src/components/AdminGate.tsx) | Composición de rutas, sesión y rol administrador |
| Estado operativo | [`store.ts`](../../src/lib/store.ts) | Fiados, abonos, stock, encargos y reglas de precios |
| Inventario compartido | [`productosSync.ts`](../../src/lib/productosSync.ts) | Sincronizar productos/precios y recibir eventos Realtime |
| Respaldo por cuenta | [`cloudSync.ts`](../../src/lib/cloudSync.ts) | Subir o restaurar snapshot JSON completo |
| Boutique | [`boutique.functions.ts`](../../src/lib/boutique.functions.ts), [`boutique.ts`](../../src/lib/boutique.ts) | Lectura pública controlada, precio, filtros y mensaje de pedido |
| Asistencia | [`ai.functions.ts`](../../src/lib/ai.functions.ts) | Audio, interpretación y visión mediante Groq |
| Notificaciones | [`recordatorios.ts`](../../src/routes/api/public/jobs/recordatorios.ts) | Procesamiento programado y envío condicionado a FCM |

## C4 · Despliegue y distribución

```mermaid
flowchart TB
    REPO["GitHub main"] --> CI["Calidad web"]
    REPO --> APK["CI Android · APK beta firmada"]
    APK --> RELEASE["GitHub Releases"]
    REPO --> HOST["Publicación web<br/>proceso independiente"]
    HOST --> WEB["Origen HTTPS con servidor"]
    RELEASE --> TWA["APK instalada · TWA"]
    TWA -->|"URL inicial /"| WEB
    WEB --> SUPA[("Supabase")]
    WEB --> GROQ["Groq"]
    WEB --> FCM["Firebase/conector si habilitado"]
```

La APK usa **Trusted Web Activity** y su `launchUrl` apunta a la raíz **`/`**, es decir, a la **Boutique**. Las rutas anteriores `/vault`, `/cobros`, etc. redirigen a `/bodega/*` según su implementación. **No** se incluye un inventario Android con base autónoma ni un backend integrado en el APK.

El workflow de Android prepara una prerelease con cada push a `main`, si dispone de secretos de firma y supera sus controles. La publicación web es un proceso distinto. [Distribución Android](../desarrollo/02-android-y-despliegue.md).

## Decisiones que requieren atención

- **Administración:** la migración `0001_productos_y_admin.sql` asigna automáticamente el rol `admin` al primer usuario creado cuando no existe otro. **Es una decisión de inicialización sensible** que debe verificarse en el entorno real antes de abrir un alta de cuentas.
- **Protección de datos:** las políticas RLS protegen tablas, pero `catalogoPublico()` y las funciones con privilegios siguen necesitando revisión de entradas y salida.
- **Sincronización:** los cambios compartidos de productos y el respaldo integral local pueden confluir; no se ha probado una garantía general de ausencia de conflictos.
- **Operación:** las notificaciones cerradas requieren Firebase, un programador externo y pruebas con el teléfono.

[Persistencia y tablas reales](03-persistencia-y-sincronizacion.md) · [Seguridad de Boutique](05-boutique-y-seguridad.md) · [Pruebas](../desarrollo/03-pruebas-y-limitaciones.md).
