# 18 — Escenarios económicos CLP / USD

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** desarrollo del proyecto.

## Escenarios económicos de PaMaRa Bodega

**Finalidad:** presupuestar decisiones futuras, no tasar el repositorio ni declarar costos/ventas históricos. Alcance modelado: **Validación con la administradora, recuperación y flujos web/Android de registro**. No hay venta de software ni aumento de ventas probado. El ahorro familiar y la mejora de registro son hipótesis; stock y deuda no son ingresos del desarrollador.

### Moneda y supuestos

Conversión: **USD 1 = CLP 994,29**, valor del **27-10-2026** en la [tabla oficial SII](https://www.sii.cl/valores_y_fechas/dolar/dolar2026.htm), último día con cifra visible al consultar el 29-10-2026. No se atribuye ese valor al día 29 ni a una transacción bancaria. CLP = USD × R; USD = CLP / R, con R = 994,29.

Para valorizar esfuerzo se supone **CLP 15.000/h** (USD 15,09/h). Es una tasa elegida para comparar escenarios, no sueldo de mercado, tarifa profesional ni compromiso del responsable. Rangos de horas, mantenimiento y reservas también son supuestos; no se deducen de SCT, commits o líneas de código.

### Inversión del siguiente alcance

| Concepto                        | Base del escenario                       | CLP                     | USD                   |
| ------------------------------- | ---------------------------------------- | ----------------------- | --------------------- |
| Tiempo del siguiente alcance    | 24–48 h a CLP 15.000/h                   | CLP 360.000–CLP 720.000 | USD 362,07–USD 724,13 |
| Reserva de materiales           | Supuesto; equipo existente no valorizado | CLP 0                   | USD 0,00              |
| Total de inversión de escenario | No es inversión histórica ni cotización  | CLP 360.000–CLP 720.000 | USD 362,07–USD 724,13 |

### Operación mensual

Alternativa de presupuesto: USD 20/mes de hosting Pro + USD 25/mes de base Pro + USD 10/mes como tope hipotético de consumo IA = USD 55/mes. El último monto es una reserva, no una tarifa por modelo. La instalación actual puede utilizar otros planes/proveedores; no se propone una migración automática.

| Concepto                        | Base                               | CLP/mes    | USD/mes    |
| ------------------------------- | ---------------------------------- | ---------- | ---------- |
| Mantenimiento de escenario      | 3 h/mes                            | CLP 45.000 | USD 45,26  |
| Servicios externos de escenario | Ver composición; no factura actual | CLP 54.686 | USD 55,00  |
| Costo mensual modelado          | Tiempo + servicios                 | CLP 99.686 | USD 100,26 |

No se suman aquí impuestos, comisiones, dominio, sobreconsumo, reposición extraordinaria o equipo no valorizado. Costos de nube por proyecto/organización y cuotas gratuitas deben revisarse para la cuenta concreta. Una cuota de nube no sustituye la arquitectura ni la validación necesarias para escalar.

### Justificación y retorno

Ejemplo **hipotético**, no resultado medido: evitar 4 h/mes a la misma tasa representa CLP 60.000 / USD 60,34 de tiempo valorizado, no ingresos. Frente al costo modelado, el saldo de ese ejemplo es CLP -39.686 / USD -39,91 al mes. El punto de equilibrio por ahorro temporal sería 6.65 h/mes; debe comprobarse con uso real, pérdidas evitadas o un beneficio distinto.

Tiempo de captura revisada y discrepancias de stock/saldo; recuperación de un snapshot y facilidad de uso por la administradora.

ROI sólo se calcula cuando beneficios y costos comparables estén medidos: (beneficio − costo) / costo, indicando período y si el tiempo valorizado realmente se convierte en ahorro. Un costo de caja bajo no acredita rentabilidad ni valor comercial de la idea.

### Sensibilidad y decisión

- Con R ±10 %, cambia en ±10 % el costo CLP de servicios fijados en USD; el gasto local CLP no cambia por ese supuesto.
- Separar creación puntual de mantenimiento recurrente y reserva física de consumo.
- Registrar facturas/uso, horas observadas y aceptación antes de reemplazar estos escenarios por un presupuesto comprometido.
- Las monedas ficticias de un videojuego, saldos de clientes e inventario de una empresa no son ingresos del software.

### Referencias de servicios

[Supabase](https://supabase.com/pricing): Free y Pro desde USD 25/mes; [Vercel](https://vercel.com/pricing): Hobby y Pro desde USD 20/mes. Son referencias consultadas, no planes asignados al proyecto. [Gemini](https://ai.google.dev/gemini-api/docs/pricing) y [Firebase](https://firebase.google.com/pricing) requieren revisar producto/modelo, cuotas y condiciones antes de cuantificar consumo. El plan actual de Lovable u otro proveedor no se deduce de estas tarifas.

## Fuentes de implementación y contratos

[README.md](../README.md) · [src/lib/store.ts](../src/lib/store.ts) · [src/lib/cloudSync.ts](../src/lib/cloudSync.ts) · [src/lib/ai.functions.ts](../src/lib/ai.functions.ts) · [src/lib/vozNativa.ts](../src/lib/vozNativa.ts) · [docs/09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
