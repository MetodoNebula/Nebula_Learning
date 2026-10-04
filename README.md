# Nebula Tech · Laboratorio de idiomas

Demo de vocabulario entre cinco idiomas (inglés, francés, español, italiano y
alemán) construida sobre el lote de contenidos de `E:\Nebula_Tech\Ki-Roberto`.
La interfaz, los enunciados y las correcciones se muestran en el idioma que
habla el alumno. Funciona localmente, tiene API, contenedor y una versión
estática para GitHub Pages.

El análisis completo del lote está en [docs/CONTENT-FORMAT.md](docs/CONTENT-FORMAT.md)
y se regenera con `npm run content:analyze`.

## Abrir

Haz doble clic en `iniciar.cmd` y abre http://localhost:5173. Desde un móvil en
la misma Wi-Fi usa la dirección *Network* que imprime el servidor.

Usuario de demostración: **demo** / **Nebula123!**. Es un inicio de sesión
simulado que solo vive en este navegador, no autenticación real.

## Cómo se leen los archivos del lote

```
DFFFLSSS-XY-T.txt        DFFFLSSS-K.<imagen>
│└┬┘│└┬┘  ││
│ │ │ │   │└─ Y  idioma que se practica (el de la respuesta)
│ │ │ │   └── X  idioma que lee el alumno (el del enunciado)
│ │ │ └────── SSS  serie editorial, no interviene en el enrutado
│ │ └──────── L    nivel, 1..9
│ └────────── FFF  familia de conceptos (082 cuerpo, 272 países, 294 frutas...)
└──────────── D    modo de ejercicio
```

Idiomas: `1` inglés · `2` francés · `3` español · `4` italiano · `5` alemán.
Cuando X = Y el alumno no comparte ninguno de los cinco idiomas: el enunciado
desaparece y la imagen pasa a ser la pregunta.

Dentro del `.txt`, una letra, un espacio y el valor: `Q` enunciado, `A`
respuestas aceptadas separadas por comas, `H` pista (**siempre en el idioma de
la respuesta**), `R` contador de repetición, `S` secuencia editorial y `F` marca
de formato.

## Los cuatro tipos de ejercicio

El tipo se deduce del contenido del registro; `F` solo sirve para contrastar,
porque el lote trae marcas equivocadas y prompts escritos en la línea `F`.

| Tipo | Se reconoce por | Cómo se juega | Fichas |
| --- | --- | --- | --- |
| `naming` | `Q` vacío y hay imagen | Se ve la imagen y **se escribe** el nombre | 230 |
| `translation` | `Q` trae una palabra | Se lee la palabra y **se escribe** la traducción | 939 |
| `choice` | `Q` trae las opciones (modo `0`) | Cuatro opciones reales del archivo, se elige una | 5 |
| `cloze` | `H` contiene un hueco (`...`) | Se completa la frase en el idioma objetivo | 25 |

La regla se comprueba en cada `npm test` sobre las 1199 fichas importadas: las
5 que traen opciones en `Q` se responden **eligiendo**, entre las opciones del
propio archivo; las otras 1194 se responden **escribiendo**, y su payload no
lleva ninguna opción. El menú permite forzar otra cosa:

- **Como en las fichas** (por defecto): se escribe, salvo en las de opción múltiple.
- **Siempre escribir**: también las de opción múltiple se escriben.
- **Siempre elegir**: cuatro opciones en todas; las que no vienen del archivo se
  toman de otras palabras del mismo nivel e idioma y la pantalla lo avisa.
- **Alternado**: mezcla las dos formas.

Las respuestas se comparan sin distinguir mayúsculas ni espacios sobrantes. Una
palabra correcta escrita sin tildes cuenta como acierto y se avisa de la grafía
correcta; las opciones de un ejercicio de escritura nunca viajan al navegador
antes de corregir.

## Incidencias del lote

`npm run content:analyze` las recuenta en cada pasada. Las relevantes hoy:

- 4 archivos marcan `F U` sobre una traducción y 2 escriben el enunciado en la
  línea `F`. El importador los interpreta por contenido y lo deja anotado.
- `13051011` (cigarette) usa `F` como `Q` en las 25 rutas y no tiene imagen: sus
  5 fichas unilingües se descartan por no tener nada que preguntar.
- `00821033-I.png` no coincide con ningún registro; se enlaza a `00821031` por
  modo, familia y nivel, que es el único candidato.
- `12941011` guarda su imagen en la ranura `V` en lugar de `I`.
- El campo `S` no cuadra con el nombre del archivo en 806 registros, así que no
  se usa para enrutar.
- Falta la ruta `45` de `11852041`.
- `12831011-13` traía `añade` como sinónimo de *pato*; se corrige a `ánade` en
  `data/content-fixes.json`, que es la única corrección aplicada al importar.
- `00821031-55` escribe sus cuatro opciones en una línea, sin numerar
  (`Auge  Mund  Nase  Ohr`): se reconoce por los espacios dobles y porque `A`
  numera la opción (`A 1 Auge`), sin depender de la marca `F Z`.
- El francés de `00821031-22` numera `1, 2, 2, 4` y el italiano de `-44` separa
  las opciones con un solo espacio. Ninguna de las dos rompe el reparto, que
  corta por el marcador.

## Contenido importado

49 conceptos, 1199 fichas jugables y 48 imágenes. Niveles con contenido: 1 a 4.
Reimportar tras cambiar el lote:

```bash
npm run content:analyze && npm run content:import && npm run media:optimize
```

## Imágenes

El lote trae fotos de 1024–1774 px guardadas como PNG de 24 bits, hasta 2,5 MB
cada una. `npm run media:optimize` genera derivadas web en `public/media/`:

- recorta el margen liso del fondo cuando lo hay (32 de 48 imágenes), que es lo
  que hace que el objeto llene la ficha en vez de quedarse pequeño en el centro;
- reescala a 900 px de lado mayor y reencoda a WebP calidad 82;
- guarda ancho y alto reales en `data/media-manifest.json`, que es lo que la
  interfaz usa para reservar el hueco y respetar la proporción.

**41,1 MB → 2,0 MB.** Como las derivadas viven en `public/`, la app ya no
necesita el lote original montado en tiempo de ejecución: `/api/v1/media` queda
solo como respaldo si falta alguna derivada.

Ajustes: `--width 1200`, `--quality 90`, `--no-trim`.

## Demo estática (GitHub Pages)

```bash
npm run pages:build && npm run pages:serve
```

Escribe `gh-pages-dist/` con la base de datos, las imágenes optimizadas y el
front end de `scripts/pages/`. No tiene servidor ni corrección remota: las
respuestas van dentro del JSON, así que es una vitrina, no el producto
corregido. Pesa 2,5 MB.

`gh-pages-single/index.html` es un bundle de una sola página hecho a mano antes
de esta ampliación; ya no corresponde con los datos actuales.

## Código

- `lib/content/format.ts`: parser del lote, clasificador de ejercicios y
  comparación de respuestas. Sin acceso a disco, lo comparten servidor, importador
  y análisis.
- `lib/server/content.ts`: construye `data/content-db.json` y arma las preguntas.
- `lib/i18n.ts`: todos los textos de la interfaz en los cinco idiomas.
- `lib/lesson.ts`, `lib/contracts.ts`, `lib/client/learning.ts`: tipos, contrato
  asíncrono y adaptador de sesión y progreso.
- `app/api/v1/`: preguntas, disponibilidad por nivel, corrección e imágenes.
- `app/page.tsx`, `app/globals.css`: menú, lección y resultados.
- `scripts/analyze-content.mjs`: genera `docs/CONTENT-FORMAT.md` y
  `data/content-report.json`.
- `scripts/import-content.mjs`: genera `data/content-db.json`.
- `scripts/optimize-media.mjs`: genera `public/media/` y `data/media-manifest.json`.
- `scripts/pages/`: front end de la demo estática.
- `tests/`: 28 pruebas de formato, dominio, contrato HTTP y adaptador.
- `data/questions.json` y las lecciones `first-steps`, `word-detective` y
  `verbs-a2` son el banco de la primera maqueta; siguen servidos por la API y
  cubiertos por pruebas, pero ya no tienen entrada en la interfaz.

React, TypeScript, Vite/Vinext, Tailwind, Base UI/Shadcn y Lucide. Vinext es
beta. Licencias y fuentes de recursos en `ATTRIBUTION.md`.

## Comprobaciones

Con Node 24: `npm ci`, `npm run check`, `npm run build` y `npm run test:smoke`.
Para el build de producción copia `.env.example` a `.env` y ejecuta `npm start`
(puerto 3000), o `docker compose up --build`.

La carpeta `android` y los scripts móviles se conservan como referencia del
prototipo anterior y no se han regenerado con estos cambios. No se ha probado en
un teléfono físico.
