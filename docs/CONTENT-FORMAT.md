# Formato del contenido Ki-Roberto

Generado por `npm run content:analyze` el 2026-09-21 sobre `E:\Nebula_Tech\Ki-Roberto`.
No edites este archivo a mano.

## Nomenclatura

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
desaparece y la imagen es la pregunta (modo unilingüe).

## Estructura del registro

Una letra, un espacio y el valor. `Q` puede ocupar varias líneas.

| Campo | Contenido |
| --- | --- |
| `Q` | Enunciado. Vacío cuando la imagen es el enunciado. En los de opción múltiple lleva las cuatro opciones separadas por `;`. |
| `A` | Respuestas aceptadas separadas por comas. La primera es la canónica. |
| `H` | Pista, **siempre escrita en el idioma de la respuesta**. |
| `R` | Contador de repetición. `0` en todo el lote. |
| `S` | Secuencia editorial (ruta + serie). Poco fiable, ver incidencias. |
| `F` | Marca de formato: `T` traducción, `U` unilingüe, `Z` opción múltiple. |

## Tipos de ejercicio detectados

El tipo se deduce del propio registro y `F` solo se usa para contrastar,
porque el lote trae marcas equivocadas.

| Tipo | Se reconoce por | Cómo se juega |
| --- | --- | --- |
| `choice` | `Q` trae varias opciones separadas por `;` (`F Z`, modo `0`) | Cuatro opciones reales del archivo, se elige una |
| `naming` | `Q` vacío y hay imagen (`F U`) | Se ve la imagen y se **escribe** el nombre |
| `translation` | `Q` trae una palabra (`F T`) | Se lee la palabra y se **escribe** la traducción |
| `cloze` | `H` contiene un hueco (`...`, `…`) | Se completa la frase del idioma objetivo |

### Ejercicios por tipo

| Valor | Registros |
| --- | --- |
| `translation` | 939 |
| `naming` | 235 |
| `cloze` | 25 |
| `choice` | 5 |

### Marca F declarada en el archivo

| Valor | Registros |
| --- | --- |
| `T` | 935 |
| `U` | 239 |
| `(missing)` | 25 |
| `Z` | 5 |

### Marca que el contenido admite realmente

| Valor | Registros |
| --- | --- |
| `T` | 959 |
| `U` | 240 |
| `Z` | 5 |

### Tipo de pista

| Valor | Registros |
| --- | --- |
| `none` | 1063 |
| `definition` | 66 |
| `alternative` | 33 |
| `cloze` | 25 |
| `symbol` | 15 |
| `warning` | 2 |

### Nivel (quinto dígito)

| Valor | Registros |
| --- | --- |
| `1` | 580 |
| `2` | 349 |
| `3` | 200 |
| `4` | 75 |

### Modo (primer dígito)

| Valor | Registros |
| --- | --- |
| `0` | 5 |
| `1` | 1199 |

### Orden de campos en el archivo

| Valor | Registros |
| --- | --- |
| `QAHRSF` | 1165 |
| `FAHRS` | 27 |
| `QARSF` | 12 |


## Ejemplos

**Traducción**

```
Q clock
A horloge,horloge murale
H 
R 0
S 12011
F T
```

_10131011-12-T.txt_

**Unilingüe con imagen**

```
Q
A clock,wall clock
H 
R 0
S 11011
F U
```

_10131011-11-T.txt_

**Opción múltiple**

```
Q eye; mouth; nose; ear
A eye
H 
R 0
S 11141
F Z
```

_00821031-11-T.txt_

**Hueco en la frase**

```
Q
A neck
H The giraffe has a long ...
R 0
S 11013
F U
```

_12872023-11-T.txt_

## Incidencias del lote

### Incidencias por tipo

| Valor | Registros |
| --- | --- |
| `sequence_mismatch` | 806 |
| `missing_flag` | 25 |
| `naming_without_prompt` | 5 |
| `flag_mismatch` | 4 |
| `repeated_field` | 2 |

- Imágenes cuyo código no coincide con ningún registro: `00821033-I.png`
- De esas, enlazadas por modo+familia+nivel al importar: `00821033-I.png` → `00821031`
- Conceptos que se quedan sin imagen: `13051011`
- Letra de la ranura de imagen: `I` 47, `V` 1
- Rutas que faltan: `00821031` (12, 13, 14, 15, 21, 23, 24, 25, 31, 32, 34, 35, 41, 42, 43, 45, 51, 52, 53, 54), `11852041` (45)
- Nombres de archivo ilegibles: ninguno

El detalle archivo a archivo está en `data/content-report.json`.
Las correcciones que sí se aplican al importar están en `data/content-fixes.json`.

## Inventario de conceptos

| Código | Modo | Familia | Nivel | Concepto | Registros | Imagen | Tipos |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `00821031` | 0 | 082 | 1 | eye | 5 | ✓ | choice 5 |
| `10131011` | 1 | 013 | 1 | clock | 25 | ✓ | translation 20, naming 5 |
| `10231081` | 1 | 023 | 1 | circle | 25 | ✓ | translation 20, naming 5 |
| `10232021` | 1 | 023 | 2 | square | 25 | ✓ | translation 20, naming 5 |
| `10233041` | 1 | 023 | 3 | sphere | 25 | ✓ | translation 20, naming 5 |
| `10234041` | 1 | 023 | 4 | hexagon | 25 | ✓ | translation 20, naming 5 |
| `10411032` | 1 | 041 | 1 | Earth | 25 | ✓ | translation 20, naming 5 |
| `10533011` | 1 | 053 | 3 | third | 25 | ✓ | translation 20, naming 5 |
| `10821013` | 1 | 082 | 1 | head | 25 | ✓ | translation 20, naming 5 |
| `10822011` | 1 | 082 | 2 | arm | 25 | ✓ | translation 20, naming 5 |
| `10823043` | 1 | 082 | 3 | hand | 25 | ✓ | translation 20, naming 5 |
| `10823093` | 1 | 082 | 3 | foot | 25 | ✓ | translation 20, naming 5 |
| `10852031` | 1 | 085 | 2 | comb | 25 | ✓ | translation 20, naming 5 |
| `11151011` | 1 | 115 | 1 | letter | 25 | ✓ | translation 20, naming 5 |
| `11321011` | 1 | 132 | 1 | key | 25 | ✓ | translation 20, naming 5 |
| `11351011` | 1 | 135 | 1 | bottle | 25 | ✓ | translation 20, naming 5 |
| `11821012` | 1 | 182 | 1 | house | 25 | ✓ | translation 20, naming 5 |
| `11851011` | 1 | 185 | 1 | chair | 25 | ✓ | translation 20, naming 5 |
| `11852041` | 1 | 185 | 2 | bed | 24 | ✓ | translation 19, naming 5 |
| `11861011` | 1 | 186 | 1 | knife | 25 | ✓ | translation 20, naming 5 |
| `11922022` | 1 | 192 | 2 | town hall | 25 | ✓ | translation 20, naming 5 |
| `11981031` | 1 | 198 | 1 | London | 25 | ✓ | translation 20, naming 5 |
| `11982012` | 1 | 198 | 2 | Berlin | 25 | ✓ | translation 20, naming 5 |
| `12011011` | 1 | 201 | 1 | trousers | 25 | ✓ | translation 20, naming 5 |
| `12012081` | 1 | 201 | 2 | hat | 25 | ✓ | translation 20, naming 5 |
| `12381011` | 1 | 238 | 1 | piano | 25 | ✓ | translation 20, naming 5 |
| `12383041` | 1 | 238 | 3 | trombone | 25 | ✓ | translation 20, naming 5 |
| `12422022` | 1 | 242 | 2 | football | 25 | ✓ | translation 20, naming 5 |
| `12631012` | 1 | 263 | 1 | station | 25 | ✓ | translation 20, naming 5 |
| `12721013` | 1 | 272 | 1 | Germany | 25 | ✓ | translation 20, naming 5 |
| `12721033` | 1 | 272 | 1 | Spain | 25 | ✓ | translation 20, naming 5 |
| `12723023` | 1 | 272 | 3 | Canada | 25 | ✓ | translation 20, naming 5 |
| `12724013` | 1 | 272 | 4 | China | 25 | ✓ | translation 20, naming 5 |
| `12821021` | 1 | 282 | 1 | cat | 25 | ✓ | translation 20, naming 5 |
| `12822051` | 1 | 282 | 2 | cow | 25 | ✓ | translation 20, naming 5 |
| `12824071` | 1 | 282 | 4 | elephant | 25 | ✓ | translation 20, naming 5 |
| `12831011` | 1 | 283 | 1 | duck | 25 | ✓ | translation 20, naming 5 |
| `12832031` | 1 | 283 | 2 | hen | 25 | ✓ | translation 20, naming 5 |
| `12843021` | 1 | 284 | 3 | eel | 25 | ✓ | translation 20, naming 5 |
| `12851011` | 1 | 285 | 1 | fly | 25 | ✓ | translation 20, naming 5 |
| `12852061` | 1 | 285 | 2 | butterfly | 25 | ✓ | translation 20, naming 5 |
| `12872023` | 1 | 287 | 2 | neck | 25 | ✓ | cloze 25 |
| `12932021` | 1 | 293 | 2 | tulip | 25 | ✓ | translation 20, naming 5 |
| `12941011` | 1 | 294 | 1 | apple | 25 | ✓ | translation 20, naming 5 |
| `12942021` | 1 | 294 | 2 | cherry | 25 | ✓ | translation 20, naming 5 |
| `12943021` | 1 | 294 | 3 | banana | 25 | ✓ | translation 20, naming 5 |
| `12951011` | 1 | 295 | 1 | tomato | 25 | ✓ | translation 20, naming 5 |
| `12981021` | 1 | 298 | 1 | leaf | 25 | ✓ | translation 20, naming 5 |
| `13051011` | 1 | 305 | 1 | cigarette | 25 | — | translation 20, naming 5 |
