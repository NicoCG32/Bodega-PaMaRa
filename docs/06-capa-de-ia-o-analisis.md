# 06 — Integraciones y asistencia

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Integraciones y límites de asistencia

Revisión documental: 2026-10-29. Base `482ddd6b2f71` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Aplicación web y cliente Android beta documentados. El código actual añade catálogo/boutique y captura paralela; notificaciones, actualización y operación real requieren evidencia específica.

| Servicio / integración | Finalidad / ejecución                        | Contrato o límite                                                                          |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Supabase               | Auth y snapshots                             | Aislamiento y resolución de recencia                                                       |
| Groq                   | Transcripción/interpretación servidor actual | Esquemas, límites y alternativa nativa; no asumir el antiguo Gemini como proveedor vigente |
| Firebase/cron          | Avisos programados                           | Configuración y recepción no acreditadas por el build                                      |
| TWA                    | Cliente Android del origen web               | Red, firma, Digital Asset Links y navegador compatible                                     |

Si no hay IA generativa implementada, este capítulo no la introduce. Una IA rival de videojuego no es un proveedor LLM. Cuando existe asistencia, documentar entradas enviadas, revisión, esquema, timeout/cancelación y efecto permitido. Los reintentos/fallback deben corresponder al código y al consentimiento; no se agregan a un contrato de intento único para seguir una plantilla.

Las claves de servidor y firma no se incluyen en cliente, informes o archivos de distribución. La disponibilidad, costo y condiciones de los proveedores se verifican para el entorno real. Sin esa comprobación, distinguir integración configurada, declarada y probada.

## Fuentes de implementación y contratos

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
