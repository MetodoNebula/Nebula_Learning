# Preparación cloud

## Alcance de esta versión

La demo web puede ejecutarse en un servidor Node o en un contenedor Linux, sin rutas de este equipo ni servicios de pago. La imagen no necesita escribir datos en disco. Las réplicas sirven el mismo contenido inmutable; no guardan sesiones ni resultados en memoria del servidor.

Esto permite desplegar y replicar **la demo**. No convierte el login público en autenticación real ni los récords del navegador en una base de datos compartida. No se han contratado recursos ni publicado el proyecto.

## Arranque reproducible

Requiere Node 24 y npm. Las versiones de dependencias se resuelven con `package-lock.json`.

```sh
npm ci
npm run check
npm run build
npm run test:smoke
```

Copia `.env.example` a `.env` y ejecuta `npm start`. El servidor escucha en `0.0.0.0`, puerto `PORT` (3000 por defecto). Para desarrollo sigue funcionando `npm run dev` en 5173.

En un proveedor cloud, configura `NEBULA_DEMO_ENABLED=true` y el `PORT` que asigne la plataforma. El arranque exige optar explícitamente por la demo. No publiques secretos en variables con prefijo `VITE_` o `NEXT_PUBLIC_`. Los archivos `.env` se excluyen de Git y del contenedor.

## Contenedor

```sh
docker compose up --build -d
docker compose logs -f web
docker compose down
```

Abre http://localhost:3000. También puede construirse la imagen con `docker build -t nebula-tech .` y ejecutarse con `docker run --rm -p 3000:3000 -e NEBULA_DEMO_ENABLED=true nebula-tech`.

El Dockerfile usa construcción por etapas, usuario sin privilegios, dependencias de ejecución y un healthcheck. Compose añade filesystem de solo lectura y `/tmp` temporal. El proceso Node recibe SIGTERM, deja de aceptar conexiones y dispone de diez segundos para terminar. Configura al menos 15 segundos de gracia en la plataforma.

Elige un servicio que ejecute contenedores Node de larga duración. Configura HTTPS en su proxy, el puerto del contenedor y la comprobación `GET /api/health`. Este archivo no es una receta para Workers, funciones serverless o hosting exclusivamente estático: esos destinos requieren su adaptador de despliegue. `.openai/hosting.json` se conserva como configuración histórica de Sites y no participa en el contenedor.

No se requiere disco persistente para esta demo. Los recursos públicos pueden servirse mediante CDN; no caches `/api/*`. Los errores de API y eventos de arranque/parada van a stdout/stderr para que la plataforma los recopile. El healthcheck comprueba que el proceso responde; cuando exista una base de datos habrá que añadir una comprobación de disponibilidad separada.

## Límites de arquitectura

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| Presentación | `app/page.tsx`, `app/globals.css` | Pantallas en alemán y flujo del juego adaptable a móvil. |
| Contrato cliente | `lib/contracts.ts` | Operaciones asíncronas de sesión, preguntas, evaluación y récords. |
| Adaptador cliente | `lib/client/learning.ts` | API HTTP para ejercicios; identidad y progreso locales de la demo. |
| Dominio | `lib/lesson.ts` | Tipos, catálogo y reglas de corrección independientes de React. |
| HTTP v1 | `app/api/v1/` | Validación, límites de entrada, respuestas y errores de servicio. |
| Repositorio | `lib/server/questions.ts` | Acceso intercambiable al contenido y corrección en servidor. |
| Contenido privado | `data/questions.json` | Semilla versionada con soluciones. No se copia a `public`. |

El adaptador se crea por instancia de pantalla; no hay estado de usuario global compartido por peticiones SSR. La UI no accede directamente a almacenamiento del navegador ni calcula aciertos. Durante la comprobación bloquea nuevas modificaciones y descarta respuestas tardías al salir de la lección.

## Contrato HTTP v1

- `GET /api/v1/questions?lessonId=first-steps`: `{ questions: Exercise[] }`. No incluye `answer` ni `explanation`. Lección desconocida: 404.
- `POST /api/v1/grade`: JSON `{ questionId, value }`. Devuelve `{ correct, answer, explanation }`. Body máximo 4096 bytes, respuesta máximo 500 caracteres, identificador máximo 100. Datos inválidos: 400; pregunta desconocida: 404.
- `GET /api/health`: `{ status: "ok", service: "nebula-tech" }`.
- Errores: `{ error: "CODE" }`, sin detalles internos. Las API de demo responden 503 si el modo demo está desactivado. Las respuestas usan `Cache-Control: no-store`.

Las API de ejercicios son **públicas en modo demo**. Ocultar las soluciones iniciales evita enviarlas innecesariamente, pero no impide consultar el corrector. No se usa este flujo como examen seguro o para emitir certificados.

## Paso a alumnos reales

Mantén los contratos y sustituye las implementaciones, con estas tareas concretas:

1. Implementar sesión real en el servidor con un proveedor OIDC o biblioteca de autenticación, cookies HttpOnly/Secure/SameSite, autorización por usuario y protección CSRF en operaciones autenticadas. Sustituir los métodos `session/login/logout` del adaptador y retirar las credenciales/botón de demo. No almacenar contraseñas o tokens en localStorage.
2. Implementar un repositorio de contenido con base de datos o CMS bajo `QuestionRepository`, manteniendo identificadores estables y versionando las lecciones. El catálogo actual de tres lecciones es contenido editorial estático; si se administra desde CMS, añadir también una operación de catálogo al contrato.
3. Persistir intentos y respuestas con identidad obtenida de la sesión. El servidor debe recalcular la puntuación, registrar la versión del ejercicio y aplicar claves de idempotencia/transacciones para reintentos y edición. Sustituir `records/saveRecord` por endpoints; **no aceptar como fiable el número enviado por el navegador**. Los récords locales de demo no se importan como logros verificados.
4. Incorporar migraciones versionadas, backups y pruebas de restauración para la base de datos elegida. Usar conexiones/pooling compatibles con el proveedor. Todas las réplicas deben compartir este almacenamiento; ninguna debe mantener sesiones o intentos solo en memoria o disco local.
5. Añadir límites de peticiones compartidos, métricas y alertas, pruebas de carga y revisión de dependencias antes de abrir el acceso público a alumnos. Vinext está fijado en una versión beta; evaluar su estabilidad y avisos de seguridad como decisión de lanzamiento.

Estas tareas afectan a adaptadores, servicios y persistencia, no requieren rehacer el diseño ni los nueve formatos de ejercicio. La elección de proveedor y los requisitos reales determinarán el dimensionamiento; no hay garantías de capacidad sin pruebas de carga.

## Integración continua y validación

`.github/workflows/ci.yml` comprueba tipos, lint, 14 pruebas, construcción, smoke HTTP de producción y construcción/healthcheck del contenedor en pushes y pull requests. No contiene credenciales ni despliega automáticamente. Configura este job como obligatorio al activar la protección de ramas en el repositorio remoto.

La comprobación `test:smoke` arranca el build en el puerto 5181 (configurable mediante `SMOKE_PORT`), verifica página, salud, aislamiento del banco privado y corrección HTTP, y detiene solo su proceso. No sustituye las pruebas visuales de móvil.

Validación local realizada: tipos, lint, 14 pruebas y smoke del build de producción. La imagen Docker no se ha ejecutado en este equipo porque su motor no está disponible; el workflow incluye su construcción y healthcheck para validarla en Linux al subir el repositorio. El workflow remoto tampoco se ha ejecutado todavía.
