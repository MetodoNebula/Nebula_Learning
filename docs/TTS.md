# Audio TTS

La lección de escucha usa archivos de audio versionados para que todos los alumnos oigan la misma pronunciación. El archivo actual se generó con una voz inglesa instalada localmente y no depende de un proveedor externo.

## Regenerar una frase

En Windows, con una voz inglesa instalada:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-tts.ps1 -Text "The cat is under the table." -Output public/assets/listening.wav
```

El script prefiere `Microsoft Zira Desktop`, usa `en-US`, velocidad ligeramente reducida y WAV PCM. Se puede cambiar la voz con `-VoiceName`; revisa la licencia de cualquier voz o modelo antes de distribuir una aplicación comercial.

## Evolución recomendada

Para contenido fijo, sigue generando los audios durante la preparación de las lecciones y sirve los archivos desde CDN. Para contenido dinámico, encapsula un motor local neural (por ejemplo, Kokoro con pesos Apache 2.0) en un servicio de síntesis con caché; no ejecutes el modelo por cada render de React. La aplicación tiene un fallback de `speechSynthesis` en el navegador, útil para prototipos, pero sus voces dependen del dispositivo y no deben ser la voz pedagógica de referencia.
