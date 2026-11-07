# Licencias y recursos · PaMaRa Bodega

[← Documentación](../README.md) · [Licensing](../../LICENSING.md) · [LICENSE](../../LICENSE) · [NOTICE](../../NOTICE)

## Dos ámbitos que no deben confundirse

**PaMaRa AyN** es el emprendimiento familiar al que sirve el sistema. **PaMaRa Bodega** es el software desarrollado para apoyar su operación. Que el código sea visible en GitHub no concede por ello derechos sobre el nombre comercial, los logotipos, las fotografías de los productos ni los datos del negocio.

`LICENSE` contiene **PolyForm Noncommercial 1.0.0**. El texto se mantiene sin cambios. `LICENSING.md` explica cómo plantear un acuerdo escrito para usos comerciales que no estén autorizados por esa licencia. No se ha autorizado un régimen más permisivo.

## Inventario de procedencia y comprobación

| Elemento | Fuente comprobable | Estado documental |
| --- | --- | --- |
| Código y documentación propios | [Repositorio](../../README.md), [LICENSE](../../LICENSE) | PolyForm Noncommercial; conservar avisos exigidos |
| Marca PaMaRa AyN | [Catálogo visual](../../branding/README.md) | **Titularidad y permisos de reutilización por confirmar**; no confundir con la licencia del código |
| Logos, monogramas, banners e iconos | [`branding/`](../../branding/README.md) | Archivos presentes; **proceso de creación, fuentes de partida y condiciones aún por confirmar** |
| Dependencias web | [`package.json`](../../package.json), `bun.lock` | Revisar avisos/condiciones de las dependencias incluidas en distribución |
| Envoltorio Android | [`android/app/build.gradle`](../../android/app/build.gradle) | Incluye `androidbrowserhelper`; revisar licencia y avisos que apliquen a la APK |
| Groq y modelos de IA | [`ai.functions.ts`](../../src/lib/ai.functions.ts) | Proveedor de servicios de captura e interpretación; revisar condiciones y tratamiento de información real |
| Supabase, Google y Firebase | Código de auth, persistencia y push | Servicios externos: configuración, términos y permisos independientes |
| Datos de productos y clientas | [`store.ts`](../../src/lib/store.ts), `backups` | No deben publicarse datos personales ni confundirse con código reutilizable |

El [NOTICE](../../NOTICE) contiene dos líneas `Required Notice:` del proyecto. **No demuestra que las atribuciones de terceros estén completas**. Añadir una lista inventada sería menos fiable que registrar lo que aún falta comprobar.

## Pendientes para cerrar la atribución

1. Confirmar quién es titular de la identidad **PaMaRa AyN** y qué permisos se permiten sobre el logo y la marca en proyectos derivados.
2. Registrar el origen de cada familia visual (creación propia, generación con IA dirigida, adaptación de un recurso previo u otro caso), sin presuponer que todas las imágenes tienen el mismo origen.
3. Inspeccionar las dependencias efectivamente distribuidas en el bundle web y la APK y conservar sus avisos cuando sea obligatorio.
4. Verificar las condiciones de los servicios externos; una clave API o un conector disponible **no** implica autorización ilimitada de reutilización.
5. Mantener fuera de documentación pública los contactos de clientas, deudas, respaldos reales y otros datos sensibles.

**Decisión actual:** conservar PolyForm Noncommercial para el código tal como está publicado, sin modificar `LICENSE` ni `NOTICE` en esta ronda. Los derechos sobre marca y recursos externos requieren revisión independiente.
