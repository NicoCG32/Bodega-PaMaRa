# Uso y derechos de PaMaRa Bodega

## Destino: el negocio familiar

Desarrollé **PaMaRa Bodega** para apoyar la gestión de **PaMaRa AyN**, el emprendimiento familiar de mi mamá. La finalidad de este código y de su identidad no es servir de plantilla pública para negocios ajenos ni autorizar su comercialización por terceros.

Para esta revisión, **la administración del software se reserva para el negocio familiar y la Boutique se mantiene pública para sus clientes y visitantes**. Acceder a esa Boutique, consultar productos y preparar un mensaje de pedido no otorga permiso para explotar el código, reutilizar la identidad de PaMaRa AyN ni publicar una tienda derivada. La reutilización, modificación o distribución fuera de los permisos expresos requiere autorización escrita del titular correspondiente. Consulta el aviso en [LICENSE](LICENSE).

## Código, marca y datos no son lo mismo

| Ámbito | Condición actual |
| --- | --- |
| **Código y documentación originales** | Derechos reservados; acceso al catálogo no implica licencia general de reutilización |
| **PaMaRa AyN: nombre e identidad comercial** | Puede mostrarse en la Boutique pública oficial; su reutilización por terceros sigue reservada al negocio familiar |
| **Logos, monogramas, banners e iconos** | Uso reservado al negocio familiar, sujeto a verificar autoría y términos de los insumos de cada recurso |
| **Datos del negocio** | La Boutique puede mostrar productos publicados, precios y disponibilidad; **nombres, teléfonos, fiados, abonos y respaldos** siguen siendo privados y no se autorizan para publicación |
| **Dependencias, bibliotecas, fuentes y servicios externos** | Mantienen sus propias licencias y condiciones; no se reclaman como propiedad del proyecto |

Los recursos visuales se encuentran catalogados en [branding/](branding/README.md). Su procedencia individual queda por documentar en [Licencias y recursos](docs/desarrollo/05-licencias-y-recursos.md).

## Cambio de licencia y versiones previas

Este repositorio había publicado versiones bajo **PolyForm Noncommercial 1.0.0**. Esa licencia **sí concedía ciertos permisos de uso no comercial**. Sustituir el texto de licencia en una versión posterior **no retira retroactivamente** los permisos otorgados válidamente sobre copias anteriores.

Por eso, esta revisión propone el aviso de **derechos reservados** para versiones futuras del proyecto; no promete volver privadas copias, bifurcaciones o distribuciones que hayan sido públicas antes. La privacidad efectiva del código requiere también restringir la visibilidad del repositorio y revisar las publicaciones existentes.

## Lo público y lo privado

La **Boutique debe permanecer pública**, sin exigir una cuenta para explorar productos publicados, consultar precios o preparar pedidos por WhatsApp. La **Bodega debe permanecer restringida** a la administración familiar autorizada (sesión de Google, rol `admin` y RLS). No deben exponerse los respaldos, cobros, teléfonos ni datos personales.

El **repositorio de código se quiere privado**, pero a la fecha de esta revisión sigue publicado en GitHub: un archivo `LICENSE` o este documento **no cambia** automáticamente su visibilidad. El sitio alojado es independiente del repositorio, y la parte de código enviada al navegador puede ser inspeccionada por visitantes aunque GitHub sea privado. Los secretos y la lógica privilegiada deben permanecer del lado del servidor.

Antes de compartir un enlace o APK hay que comprobar qué pantallas se exponen, quién tiene acceso a la administración y qué información devuelve el backend.

## Avisos y distribución

El [NOTICE](NOTICE) conserva los créditos y la URL de origen. No es todavía un inventario completo de avisos de terceros. Una distribución autorizada deberá respetar los avisos de todas las dependencias y elementos externos incluidos.

Para permisos excepcionales, contacta al titular a través de [NicoCG32](https://github.com/NicoCG32), sin publicar datos confidenciales en issues.
