# Nebula Tech para Android

Aplicación Android de prueba con Capacitor 8.5.1. Usa las mismas pantallas React que la web y las empaqueta dentro de la aplicación. Es una app híbrida con contenedor Android y WebView local, con icono y apertura propios. No abre la web del ordenador y no necesita servidor, Wi-Fi ni Internet para las cuatro preguntas.

## Instalar la demo

El APK generado se guarda en **releases/nebula-tech-debug.apk**. Copia ese archivo a tu teléfono y ábrelo. Si Android lo solicita, permite temporalmente instalar aplicaciones desde la aplicación que estés usando para abrirlo. No requiere cuenta de Google Play ni publicación en una tienda.

También puedes descargarlo desde el móvil conectado a la misma Wi-Fi, mientras `iniciar.cmd` esté en marcha: abre `http://IP-DEL-EQUIPO:5173/downloads/nebula-tech-debug.apk` (la dirección actual es `http://192.168.1.25:5173/downloads/nebula-tech-debug.apk`). Solo la descarga necesita esa conexión; después puedes apagar el ordenador.

Compatible con Android 7.0 (API 24) o posterior. Usa un Android System WebView actualizado. Es un APK de depuración, firmado con una clave local de prueba; no es una versión de producción. No se ha probado aún en un móvil físico.

- Usuario: **demo**
- Contraseña: **Nebula123!**

La primera pantalla es Nebula Tech. El botón Atrás de Android vuelve al inicio; desde el inicio minimiza la app. El audio se pausa cuando la app pasa a segundo plano. El progreso de la lección actual se descarta al reiniciarla. El récord queda guardado en el almacenamiento de la app, independiente del navegador.

La versión 1.1 dedica la pantalla completa a la pregunta: respuestas y «Comprobar» se mantienen juntas. La corrección se abre en una ventana emergente con «Continuar» y «Revisar mi respuesta». La transcripción también se abre aparte. El botón Atrás cierra primero cualquier ventana abierta. Revisar una respuesta comprobada no concede puntos adicionales ni permite cambiar el resultado del intento.

En teléfonos de poca altura las cuatro opciones se distribuyen en dos columnas. El área del ejercicio se ajusta a la altura visible, incluido el teclado, y conserva el botón inferior. Con zoom elevado o ventanas excepcionalmente pequeñas se permite desplazar únicamente el contenido del ejercicio para no recortar texto. Queda pendiente la comprobación visual en el teléfono del usuario.

## Cambios de legibilidad

Las pistas, explicaciones, transcripciones, etiquetas de formulario y textos de repaso tienen al menos 16 px en pantallas de hasta 760 px. Los metadatos tienen al menos 14 px. Se ha aumentado el contraste del texto secundario, permitido saltos de línea en las cabeceras y simplificado las tarjetas a una columna. Los botones principales miden como mínimo 54 px de alto, se respetan las zonas reservadas del sistema y se permite el zoom.

## Regenerar después de hacer cambios

En este equipo, haz doble clic en **crear-apk.cmd**. El comando:

1. Compila las pantallas y copia preguntas, imágenes y audio a `dist-mobile`.
2. Sincroniza los recursos y el plugin de ciclo de vida con el proyecto `android`.
3. Compila el APK de depuración y lo copia a `releases/nebula-tech-debug.apk`.

Con Node.js 24 también puedes ejecutar `npm run android:apk`. Para preparar solo el contenido móvil, `npm run mobile:build`. `npm run android:open` abre el proyecto si tienes Android Studio instalado.

Las herramientas de compilación de este equipo están en `.tools`: Temurin OpenJDK 21 y Android SDK con plataforma 36, Build Tools 36 y Platform Tools. No se ha sustituido el Java del sistema. El script encuentra esas herramientas automáticamente y utiliza los certificados de confianza de Windows para las descargas Java. La primera compilación necesita Internet; la aplicación resultante no.

El APK se ha compilado correctamente y su firma APK v2 se ha verificado con `apksigner`. Las siete pruebas de lógica y empaquetado han pasado; también se ha verificado la integridad del ZIP del APK y que contiene las preguntas y medios locales. Gradle instaló además Build Tools 35 para su versión del plugin de Android. Queda pendiente la prueba de uso en un teléfono real.

En otro equipo instala Node 24, JDK 21 y Android SDK 36, configura `JAVA_HOME` y `ANDROID_HOME`, ejecuta `npm ci` y después `npm run android:apk`. El SDK oficial de Google es gratuito y se distribuye bajo su licencia propia; Capacitor, React, Vite y OpenJDK son de código abierto. No se usan servicios de compilación de pago.

## Archivos principales

- `capacitor.config.ts`: identificador y configuración de Android, sin URL de servidor remoto.
- `android/`: proyecto Android nativo.
- `mobile/`: entrada móvil que reutiliza `app/page.tsx`.
- `vite.mobile.config.ts`: compilación estática de la app, sin servidor Next/Vinext.
- `scripts/build-mobile.mjs`: compilación y sincronización de recursos.
- `scripts/android-apk.mjs`: compilación nativa y entrega del APK.
- `tests/mobile-package.test.mjs`: verificación de recursos incluidos y ausencia de servidor remoto.

La web conserva su arranque habitual en `iniciar.cmd`. Se inició una carpeta `ios` al preparar ambas plataformas; quedó sin activar ni compilar cuando se decidió centrar esta prueba en Android. No participa en la compilación del APK.

Documentación oficial: https://capacitorjs.com/docs/android y https://capacitorjs.com/docs/getting-started/environment-setup.
