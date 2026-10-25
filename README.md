# Pamara Bodega

Nombre del negocio: PaMaRa AyN (perfumes réplica, ropa, cosmética y encargos).
Códigos de perfumes: Hombre H-NN, Mujer M-NN, Juveniles T-NN.

Requisitos de la aplicación:
- Aplicación pensada para teléfono móvil (mobile-first, interfaz tipo app/PWA, ultra accesible y amigable como una red social, pensada para alguien no adepto a la tecnología: botones grandes, texto claro, sin enredos).
- Entrada por audio/voz integrada con IA: la usuaria presiona un botón grande de micrófono, dicta lo que pasó (ej: "Le fié a Carmen el H-05 en 18 mil, me paga 9 mil el viernes y el resto a fin de mes" o "Anoté encargo del M-12 para Andrea"), la IA transcribe y clasifica automáticamente los datos (cliente, código de perfume, abono, saldo pendiente, fecha comprometida de pago). También opción de escribir texto simple.
- Gestión de deudas y fiados ("Cobros y Deudores"): lista clara de quién debe, cuánto debe, y fecha pactada.
- Alarmas y recordatorios automáticos para fechas de cobro, con botón directo para enviar recordatorio amable a WhatsApp con un solo toque.
- Catálogo y control de stock rápido por código (en stock vs a encargo).
- Diseño cálido, elegante y familiar para PaMaRa AyN.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pamara-bodega.lovable.app

## Android (candidata beta)

El proyecto Android en `android/` genera una APK firmada que abre la web mediante Trusted Web Activity. Requiere internet, el backend publicado y un navegador compatible actualizado. La versión inicial es `0.1.0-beta.1`; compilarla no acredita todavía todos los recorridos en teléfono ni notificaciones.

Consulta la [guía de instalación, firma y GitHub Releases](docs/09-instalacion-y-despliegue.md) y los [criterios de aceptación Android](docs/android-acceptance.md). Cada push a `main` compila, verifica y publica automáticamente una nueva release beta con APK, SHA-256 y procedencia. Las versiones automáticas empiezan en `0.1.0-beta.1001`; la clave de firma se conserva entre actualizaciones.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f28b7e81-15d3-4524-b82a-69955673e05e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
