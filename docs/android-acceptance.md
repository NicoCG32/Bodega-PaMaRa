# Aceptación de una candidata Android

Usar exclusivamente datos sintéticos y una cuenta de pruebas. Registrar versión APK, SHA-256, certificado, Android, navegador/versión, fecha y resultado de cada recorrido. Las casillas describen criterios, no certifican que se hayan ejecutado.

- [ ] APK release firmada; paquete/versión/API y SHA-256 coinciden con el manifiesto de release; sin firma debug ni datos privados.
- [ ] Instalar desde cero y abrir desde el icono sin crash.
- [ ] Asociación HTTPS verificada en Android y arranque TWA sin barra; enlaces ajenos muestran claramente el navegador.
- [ ] Google: entrar, cancelar, volver a la app y cerrar sesión; ningún bucle o pérdida de estado.
- [ ] Crear fiado con abono inicial y cuotas; registrar otro abono y comprobar saldo.
- [ ] Crear/entregar encargo; modificar stock y comprobar catálogo.
- [ ] Dictar voz, revisar la interpretación y confirmar/cancelar sin escrituras involuntarias.
- [ ] Denegar micrófono, recuperarlo desde ajustes del sitio y repetir; no bloquear la app.
- [ ] Compartir anuncio y abrir WhatsApp; comprobar retorno a la app sin enviar mensajes durante la prueba.
- [ ] Cerrar/reabrir app y navegador conservando registros.
- [ ] Perder red: comprobar el comportamiento real y mensajes; recuperar red sin declarar guardados que no ocurrieron.
- [ ] Guardar snapshot; recuperar desde otro perfil de prueba; comprobar regla de snapshot más reciente y documentar conflictos.
- [ ] Denegar notificaciones; activar después si Firebase está configurado; verificar aviso real con app cerrada y horario UTC/Chile.
- [ ] Instalar actualización firmada con la misma clave y `versionCode` mayor conservando registros. Para la primera entrega, preparar una compilación previa de prueba en un perfil aislado; no simular una actualización mediante desinstalación.
- [ ] Revisar tamaños de texto, teclado, navegación atrás, rotación y áreas seguras en el teléfono objetivo.
- [ ] Keystore y contraseña respaldados fuera de Git/artefactos y recuperación de la copia comprobada.
- [ ] Release contiene APK, checksum, procedencia y notas honestas. Todo caso pendiente/fallido aparece en las limitaciones; no anunciar estabilidad con pendientes críticos.
