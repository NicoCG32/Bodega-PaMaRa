# Origen y propósito

PaMaRa Bodega surgió de una necesidad que conozco de cerca: ayudar a mi mamá a llevar PaMaRa AyN sin convertir cada operación en una tarea administrativa complicada. La venta de perfumes y otros productos convive con encargos, abonos, stock disponible y conversaciones con clientes. Si todo queda repartido entre mensajes y recuerdos, es difícil tener una respuesta confiable cuando alguien pregunta cuánto debe o si aún queda un producto.

Quiero **ordenar el trabajo cotidiano** con una herramienta cómoda desde el celular, respetando la manera en que mi mamá atiende a sus clientes.

## Personas que intervienen

| Persona                          | Necesidad                                                        | Interfaz prevista                              |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| Administradora del negocio       | Anotar operaciones, revisar cuentas, controlar productos         | PaMaRa Vault (rutas privadas de la aplicación) |
| Cliente o visitante              | Saber qué está disponible, precio y forma de consultar un pedido | Boutique pública (`/`)                         |
| Persona que mantiene el software | Verificar reglas, cuidar datos, distribuir versiones             | Código, pruebas y documentación                |

## Decisiones que orientan el producto

- **Primero revisar, luego guardar.** Una transcripción o un resultado de IA es una sugerencia, no un asiento definitivo.
- **El teléfono es la herramienta principal.** Se priorizan pasos cortos, controles grandes y lenguaje cotidiano.
- **La información sensible no se mezcla con el catálogo.** Deudas, abonos y teléfonos pertenecen a la gestión, no al escaparate público.
- **La continuidad importa.** Los datos se guardan en el navegador y pueden respaldarse con una cuenta, pero restaurar datos completos entre dispositivos requiere precauciones.

## Cómo sabré si ayuda

Quiero comprobar con mi mamá si puede registrar un fiado sin errores, encontrar un encargo, corregir el stock y recuperar una copia cuando hace falta. Esas tareas me ayudan a decidir qué simplificar y qué hace falta mejorar.

[Funciones actuales](02-alcance-y-funciones.md) · [Pruebas sugeridas](../desarrollo/03-pruebas-y-limitaciones.md)
