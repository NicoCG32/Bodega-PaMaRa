# Pruebas y limitaciones

Las pruebas automatizadas comprueban reglas y flujos con datos controlados. Las integraciones con Google, Groq, Firebase y Android también requieren pruebas con los servicios configurados y el teléfono de uso.

## Comprobaciones automáticas

Desde la raíz del proyecto:

```bash
bun run lint
bunx tsc --noEmit
node --test scripts/android-release.test.mjs
bun run test
bun run build
```

| Archivo                                                              | Cobertura principal                                   |
| -------------------------------------------------------------------- | ----------------------------------------------------- |
| [`precios.test.ts`](../../src/test/precios.test.ts)                  | Precio de venta y encargos.                           |
| [`boutique.test.ts`](../../src/test/boutique.test.ts)                | Visibilidad, filtros y mensajes de WhatsApp.          |
| [`vault.test.ts`](../../src/test/vault.test.ts)                      | Resumen de bodega y reposición.                       |
| [`ai.functions.test.ts`](../../src/test/ai.functions.test.ts)        | Contratos de Groq y Whisper con respuestas simuladas. |
| [`vozNativa.test.ts`](../../src/test/vozNativa.test.ts)              | Transcripciones alternativas y esperas del dictado.   |
| [`app-routing.test.tsx`](../../src/test/app-routing.test.tsx)        | Composición de rutas.                                 |
| [`android-release.test.mjs`](../../scripts/android-release.test.mjs) | Validación del empaquetador Android.                  |

## Recorridos manuales

Usa una cuenta de prueba y datos ficticios.

| Escenario                     | Qué comprobar                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Fiado, abono inicial y cuotas | Total, saldo y próxima cuota después de guardar y reabrir.                                      |
| Abono posterior               | Importe positivo, deuda correcta y saldo resultante; incluir importes mayores al saldo.         |
| Voz nativa y Groq             | Una sola propuesta aunque una transcripción llegue tarde; conservación del texto ante fallos.   |
| Conteo por foto               | Corrección de cantidades y suma al stock una sola vez.                                          |
| Edición de producto           | Conservación de stock, precio y visibilidad en Boutique.                                        |
| Respaldo                      | Recuperación en otro perfil, cierre de sesión, pérdida de red y cambios desde dos dispositivos. |
| Boutique                      | Productos visibles, precios, cuenta de origen y mensaje de WhatsApp.                            |
| Notificaciones                | Permisos, recepción con la aplicación cerrada y fecha de cobro en Chile.                        |
| Android TWA                   | Instalación, asociación del dominio, reapertura y actualización conservando los datos.          |
| Accesibilidad                 | Teclado, foco, lector de pantalla, zoom y contraste.                                            |

Para Android, utiliza también la [lista de aceptación en dispositivo](../android-acceptance.md).

## Limitaciones actuales

- El respaldo sustituye el estado completo; la edición simultánea desde varios dispositivos puede sobrescribir cambios.
- La boutique lee el último respaldo global. El uso con varias cuentas requiere seleccionar expresamente al propietario del catálogo.
- El fiado por voz descuenta una unidad de stock; comprueba las existencias cuando una operación incluya varias unidades.
- El pedido por WhatsApp se registra por separado en Vault. La bolsa calcula productos, sin tarifa de despacho.
- La recepción de avisos depende de Firebase, el programador externo, el navegador y los permisos del teléfono.

## Registrar una prueba

Anota commit, URL o versión del APK, fecha, navegador, dispositivo, pasos y resultado. Si adjuntas capturas o mensajes de error a un issue, elimina los datos personales.

[Desarrollo local](01-desarrollo-local.md) · [Próximos pasos](04-evolucion.md)
