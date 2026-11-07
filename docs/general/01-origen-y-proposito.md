# Origen y propósito

PaMaRa Bodega surgió de una necesidad que conozco de cerca: ayudar a mi mamá a llevar PaMaRa AyN sin convertir cada operación en una tarea administrativa complicada. La venta de perfumes y otros productos convive con encargos, abonos, stock disponible y conversaciones con clientes. Si todo queda repartido entre mensajes y recuerdos, es difícil tener una respuesta confiable cuando alguien pregunta cuánto debe o si aún queda un producto.

Quiero **ordenar el trabajo cotidiano** con una herramienta cómoda desde el celular, respetando la manera en que mi mamá atiende a sus clientes.

**PaMaRa AyN** es el emprendimiento de mi mamá; **PaMaRa Bodega** es el software que desarrollé para apoyarlo. El negocio, su marca y la aplicación no deben confundirse en los créditos ni en las licencias.

## Personas que intervienen

| Persona                          | Necesidad                                                        | Interfaz prevista                              |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| Administradora del negocio       | Anotar operaciones, revisar cuentas, controlar productos         | Bodega (`/bodega/*`), con Google y rol `admin` |
| Cliente o visitante              | Saber qué está disponible, precio y forma de consultar un pedido | Boutique pública (`/`)                         |
| Persona que mantiene el software | Verificar reglas, cuidar datos, distribuir versiones             | Código, pruebas y documentación                |

## Decisiones que orientan el producto

- **Primero revisar, luego guardar.** Una transcripción o un resultado de IA es una sugerencia, no un asiento definitivo.
- **El teléfono es la herramienta principal.** Se priorizan pasos cortos, controles grandes y lenguaje cotidiano.
- **La información sensible no se mezcla con el catálogo.** Deudas, abonos y teléfonos pertenecen a la gestión, no al escaparate público.
- **La continuidad importa.** Cobros y encargos forman parte del estado local y su respaldo por cuenta; productos y precios se sincronizan también con tablas compartidas. Los cambios entre dispositivos todavía requieren comprobación.

## Cómo sabré si ayuda

Quiero comprobar con mi mamá si puede registrar un fiado sin errores, encontrar un encargo, corregir el stock y recuperar una copia cuando hace falta. Esas tareas me ayudan a decidir qué simplificar y qué hace falta mejorar.

[Funciones actuales](02-alcance-y-funciones.md) · [Pruebas sugeridas](../desarrollo/03-pruebas-y-limitaciones.md)
