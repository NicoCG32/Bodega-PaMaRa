# Desarrollo y próximos pasos

He ido acercando PaMaRa Bodega a las tareas que se repiten en el negocio de mi mamá: anotar movimientos, ordenar bodega y cobros, recuperar la información y mostrar los productos en una boutique.

## Etapas del proyecto

| Etapa        | Alcance                                                              |
| ------------ | -------------------------------------------------------------------- |
| Registro     | Captura por texto y voz, fiados, abonos, cuotas y encargos.          |
| Bodega       | Productos por código, conteo por voz o foto y precios configurables. |
| Continuidad  | Respaldo JSON por cuenta y sincronización compartida de productos y precios. |
| Boutique     | Consulta pública de productos y preparación de pedidos por WhatsApp. |
| Distribución | Aplicación web y APK Android beta.                                   |

## Cómo trabajo los cambios

1. Parto de una operación cotidiana de la tienda.
2. Reviso qué productos, cantidades, saldos o entregas deberían cambiar.
3. Pruebo la captura y su resumen, incluyendo entradas incompletas y respuestas tardías.
4. Compruebo el resultado y la recuperación antes de incorporar el cambio al uso habitual.

## Prioridades

- **Uso diario:** revisar con la administradora la captura, los abonos y las cantidades para reducir pasos y errores.
- **Continuidad:** validar conflictos entre respaldo JSON y tablas compartidas cuando se edita desde varios dispositivos.
- **Catálogo:** comprobar reglas RLS y visibilidad de cada producto. La Boutique ya consulta las tablas `productos` y `ajustes_tienda`.
- **Autorización:** revisar la inicialización del primer administrador y la recuperación de acceso antes de habilitar cuentas adicionales.
- **Avisos y Android:** completar la configuración de web push y probar permisos, recepción y actualización en el teléfono.

Después me interesa evaluar tarifas de entrega, pedidos estructurados o estadísticas según lo que necesite el negocio. El uso por varias tiendas requiere primero un modelo de cuentas, permisos y persistencia que lo soporte.

[Guía de pruebas](03-pruebas-y-limitaciones.md) · [Funciones actuales](../general/02-alcance-y-funciones.md)
