// Static twin of the demo: same imported database, no server, no grading API.
// The answers travel to the browser here on purpose; this build is a showcase,
// not the graded product.

const app = document.querySelector('#app');
const endonyms = {
  1: 'English',
  2: 'Français',
  3: 'Español',
  4: 'Italiano',
  5: 'Deutsch',
};
const flags = {
  1: 'assets/flags/gb.svg',
  2: 'assets/flags/fr.svg',
  3: 'assets/flags/es.svg',
  4: 'assets/flags/it.svg',
  5: 'assets/flags/de.svg',
};
const tags = { 1: 'en', 2: 'fr', 3: 'es', 4: 'it', 5: 'de' };
const names = {
  1: { 1: 'English', 2: 'French', 3: 'Spanish', 4: 'Italian', 5: 'German' },
  2: { 1: 'anglais', 2: 'français', 3: 'espagnol', 4: 'italien', 5: 'allemand' },
  3: { 1: 'inglés', 2: 'francés', 3: 'español', 4: 'italiano', 5: 'alemán' },
  4: { 1: 'inglese', 2: 'francese', 3: 'spagnolo', 4: 'italiano', 5: 'tedesco' },
  5: {
    1: 'Englisch',
    2: 'Französisch',
    3: 'Spanisch',
    4: 'Italienisch',
    5: 'Deutsch',
  },
};
const accents = {
  1: [],
  2: ['à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'œ'],
  3: ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'],
  4: ['à', 'è', 'é', 'ì', 'í', 'ò', 'ó', 'ù'],
  5: ['ä', 'ö', 'ü', 'ß'],
};
const T = {
  1: {
    lead: 'Static build of the Nebula Tech demo, served straight from the imported files.',
    speak: 'I speak',
    learn: 'I am learning',
    other: 'Another language (picture mode)',
    level: 'Level',
    answering: 'Answering',
    modes: { auto: 'As authored', write: 'Always type', select: 'Always choose' },
    exercises: (n) => `${n} exercises`,
    empty: 'no content',
    start: 'Start',
    none: 'This level has no content for that route yet.',
    formats: 'Formats at this level',
    kinds: {
      naming: 'Name the picture',
      translation: 'Translation',
      choice: 'Multiple choice',
      cloze: 'Gap fill',
    },
    prompts: {
      naming: (l) => `What is this called in ${l}?`,
      translation: (l) => `Translate into ${l}`,
      choice: () => 'Pick the right word',
      cloze: () => 'Complete the sentence',
    },
    type: 'Type your answer',
    check: 'Check',
    next: 'Next',
    menu: 'Menu',
    again: 'Play again',
    right: 'Correct',
    accent: 'Right word, watch the accents',
    wrong: 'Not this time',
    expected: (a) => `Expected answer: ${a}.`,
    also: (a) => `Also accepted: ${a}.`,
    score: (s, n) => `Correct: ${s} of ${n}`,
    review: 'Words in this round',
    hint: 'Hint',
  },
  2: {
    lead: 'Version statique de la démo Nebula Tech, servie depuis les fichiers importés.',
    speak: 'Je parle',
    learn: "J'apprends",
    other: 'Une autre langue (mode image)',
    level: 'Niveau',
    answering: 'Réponses',
    modes: {
      auto: 'Comme dans les fiches',
      write: 'Toujours écrire',
      select: 'Toujours choisir',
    },
    exercises: (n) => `${n} exercices`,
    empty: 'sans contenu',
    start: 'Commencer',
    none: "Ce niveau n'a pas encore de contenu pour ce parcours.",
    formats: 'Formats à ce niveau',
    kinds: {
      naming: "Nommer l'image",
      translation: 'Traduction',
      choice: 'Choix multiple',
      cloze: 'Texte à trou',
    },
    prompts: {
      naming: (l) => `Comment dit-on ceci en ${l} ?`,
      translation: (l) => `Traduis en ${l}`,
      choice: () => 'Choisis le bon mot',
      cloze: () => 'Complète la phrase',
    },
    type: 'Écris ta réponse',
    check: 'Vérifier',
    next: 'Suivant',
    menu: 'Menu',
    again: 'Rejouer',
    right: 'Correct',
    accent: 'Bon mot, attention aux accents',
    wrong: 'Pas cette fois',
    expected: (a) => `Réponse attendue : ${a}.`,
    also: (a) => `Aussi acceptées : ${a}.`,
    score: (s, n) => `Bonnes réponses : ${s} sur ${n}`,
    review: 'Mots de cette série',
    hint: 'Indice',
  },
  3: {
    lead: 'Versión estática de la demo de Nebula Tech, servida desde los archivos importados.',
    speak: 'Hablo',
    learn: 'Aprendo',
    other: 'Otro idioma (modo imagen)',
    level: 'Nivel',
    answering: 'Respuestas',
    modes: {
      auto: 'Como en las fichas',
      write: 'Siempre escribir',
      select: 'Siempre elegir',
    },
    exercises: (n) => `${n} ejercicios`,
    empty: 'sin contenido',
    start: 'Empezar',
    none: 'Ese nivel todavía no tiene contenido para esta ruta.',
    formats: 'Formatos en este nivel',
    kinds: {
      naming: 'Nombrar la imagen',
      translation: 'Traducción',
      choice: 'Opción múltiple',
      cloze: 'Hueco en la frase',
    },
    prompts: {
      naming: (l) => `¿Cómo se llama esto en ${l}?`,
      translation: (l) => `Tradúcelo al ${l}`,
      choice: () => 'Elige la palabra correcta',
      cloze: () => 'Completa la frase',
    },
    type: 'Escribe tu respuesta',
    check: 'Comprobar',
    next: 'Siguiente',
    menu: 'Menú',
    again: 'Repetir',
    right: 'Correcto',
    accent: 'Palabra correcta, cuida los acentos',
    wrong: 'Esta vez no',
    expected: (a) => `Respuesta esperada: ${a}.`,
    also: (a) => `También se acepta: ${a}.`,
    score: (s, n) => `Aciertos: ${s} de ${n}`,
    review: 'Palabras de esta ronda',
    hint: 'Pista',
  },
  4: {
    lead: 'Versione statica della demo Nebula Tech, servita dai file importati.',
    speak: 'Parlo',
    learn: 'Imparo',
    other: "Un'altra lingua (modalità immagine)",
    level: 'Livello',
    answering: 'Risposte',
    modes: {
      auto: 'Come nelle schede',
      write: 'Sempre scrivere',
      select: 'Sempre scegliere',
    },
    exercises: (n) => `${n} esercizi`,
    empty: 'senza contenuti',
    start: 'Inizia',
    none: 'Questo livello non ha ancora contenuti per questo percorso.',
    formats: 'Formati a questo livello',
    kinds: {
      naming: "Nominare l'immagine",
      translation: 'Traduzione',
      choice: 'Scelta multipla',
      cloze: 'Frase da completare',
    },
    prompts: {
      naming: (l) => `Come si chiama questo in ${l}?`,
      translation: (l) => `Traduci in ${l}`,
      choice: () => 'Scegli la parola giusta',
      cloze: () => 'Completa la frase',
    },
    type: 'Scrivi la risposta',
    check: 'Verifica',
    next: 'Avanti',
    menu: 'Menu',
    again: 'Rigioca',
    right: 'Corretto',
    accent: 'Parola giusta, attenzione agli accenti',
    wrong: 'Questa volta no',
    expected: (a) => `Risposta attesa: ${a}.`,
    also: (a) => `Si accetta anche: ${a}.`,
    score: (s, n) => `Risposte giuste: ${s} su ${n}`,
    review: 'Parole di questo giro',
    hint: 'Suggerimento',
  },
  5: {
    lead: 'Statische Fassung der Nebula-Tech-Demo, direkt aus den importierten Dateien.',
    speak: 'Ich spreche',
    learn: 'Ich lerne',
    other: 'Eine andere Sprache (Bildmodus)',
    level: 'Stufe',
    answering: 'Antworten',
    modes: {
      auto: 'Wie in den Karten',
      write: 'Immer schreiben',
      select: 'Immer auswählen',
    },
    exercises: (n) => `${n} Übungen`,
    empty: 'ohne Inhalt',
    start: 'Starten',
    none: 'Diese Stufe hat für diese Route noch keinen Inhalt.',
    formats: 'Formate auf dieser Stufe',
    kinds: {
      naming: 'Bild benennen',
      translation: 'Übersetzung',
      choice: 'Auswahl',
      cloze: 'Lückensatz',
    },
    prompts: {
      naming: (l) => `Wie heißt das auf ${l}?`,
      translation: (l) => `Übersetze ins ${l}`,
      choice: () => 'Wähle das richtige Wort',
      cloze: () => 'Ergänze den Satz',
    },
    type: 'Schreib deine Antwort',
    check: 'Prüfen',
    next: 'Weiter',
    menu: 'Menü',
    again: 'Nochmal',
    right: 'Richtig',
    accent: 'Richtiges Wort, achte auf die Zeichen',
    wrong: 'Diesmal nicht',
    expected: (a) => `Erwartete Antwort: ${a}.`,
    also: (a) => `Auch akzeptiert: ${a}.`,
    score: (s, n) => `Richtig: ${s} von ${n}`,
    review: 'Wörter dieser Runde',
    hint: 'Hinweis',
  },
};

const UI = {
  1: { titles: ['Which language do you speak?', 'Which language would you like to learn?', 'Choose your level'], subtitles: ['Choose your starting language to tailor the lessons.', 'We will show exercises in the language you choose.', 'Pick an available level, then start practicing.'], back: 'Back', details: 'Lesson settings', filter: 'Exercise filter', filters: ['All formats', 'Multiple choice', 'Complete the sentence', 'Translation and writing'], collection: 'In this level', other: 'Another language', otherHint: 'Learn with pictures' },
  2: { titles: ['Quelle langue parlez-vous ?', 'Quelle langue voulez-vous apprendre ?', 'Choisissez votre niveau'], subtitles: ['Choisissez votre langue de départ.', 'Nous afficherons les exercices dans la langue choisie.', 'Choisissez un niveau disponible pour commencer.'], back: 'Retour', details: 'Réglages', filter: 'Filtre des exercices', filters: ['Tous les formats', 'Choix multiple', 'Compléter la phrase', 'Traduction et écriture'], collection: 'Dans ce niveau', other: 'Autre langue', otherHint: 'Apprendre avec des images' },
  3: { titles: ['¿Qué idioma hablas?', '¿Qué idioma quieres aprender?', 'Elige tu nivel'], subtitles: ['Selecciona el idioma que hablas para adaptar las lecciones.', 'Te mostraremos ejercicios en el idioma que elijas.', 'Elige un nivel disponible y empieza a practicar.'], back: 'Volver', details: 'Configura tu práctica', filter: 'Filtra los ejercicios', filters: ['Todos los formatos', 'Opción múltiple', 'Completar frases', 'Traducción y escritura'], collection: 'En este nivel', other: 'Otro idioma', otherHint: 'Aprender con imágenes' },
  4: { titles: ['Che lingua parli?', 'Quale lingua vuoi imparare?', 'Scegli il livello'], subtitles: ['Scegli la lingua di partenza.', 'Mostreremo gli esercizi nella lingua scelta.', 'Scegli un livello disponibile e inizia.'], back: 'Indietro', details: 'Impostazioni', filter: 'Filtro esercizi', filters: ['Tutti i formati', 'Scelta multipla', 'Completa la frase', 'Traduzione e scrittura'], collection: 'In questo livello', other: 'Altra lingua', otherHint: 'Impara con le immagini' },
  5: { titles: ['Welche Sprache sprichst du?', 'Welche Sprache möchtest du lernen?', 'Wähle deine Stufe'], subtitles: ['Wähle deine Ausgangssprache.', 'Wir zeigen Übungen in deiner Zielsprache.', 'Wähle eine verfügbare Stufe und beginne.'], back: 'Zurück', details: 'Einstellungen', filter: 'Übungsfilter', filters: ['Alle Formate', 'Auswahl', 'Satz ergänzen', 'Übersetzen und schreiben'], collection: 'In dieser Stufe', other: 'Andere Sprache', otherHint: 'Mit Bildern lernen' },
};

const state = {
  native: '',
  target: '',
  level: 1,
  mode: 'auto',
  filter: 'all',
  reader: '3',
  setupStep: 1,
  cards: [],
  index: 0,
  chosen: '',
  checked: null,
  score: 0,
  log: [],
};
let variants = [];

// Named esc so it never shadows the deprecated global esc().
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );
const t = () => T[state.reader];
const ui = () => UI[state.reader];
const route = () => (state.native === 'other' ? state.target : state.native) + state.target;
const normalize = (value) =>
  value
    .replace(/[‘’´`]/g, "'")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!?;]+$/, '');
const fold = (value) =>
  normalize(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .normalize('NFC');
function quality(value, accepted) {
  if (!normalize(value)) return 'none';
  if (accepted.some((answer) => normalize(answer) === normalize(value))) return 'exact';
  if (accepted.some((answer) => fold(answer) === fold(value))) return 'accent';
  return 'none';
}
const hash = (value) => {
  let result = 0;
  for (let i = 0; i < value.length; i += 1)
    result = (result * 31 + value.charCodeAt(i)) >>> 0;
  return result;
};
function optionsFor(variant) {
  if (variant.kind === 'choice') return variant.options;
  const pool = variants
    .filter(
      (item) =>
        item.variant.targetLanguage === variant.targetLanguage &&
        item.variant.level === variant.level &&
        item.variant.primaryAnswer !== variant.primaryAnswer,
    )
    .map((item) => item.variant.primaryAnswer);
  const picked = [...new Set(pool)]
    .sort((a, b) => hash(variant.id + a) - hash(variant.id + b))
    .slice(0, 3);
  return [variant.primaryAnswer, ...picked].sort(
    (a, b) => hash(variant.id + b) - hash(variant.id + a),
  );
}
const answerMode = (variant) =>
  variant.kind === 'choice' || state.mode === 'select' ? 'select' : 'write';
const contentFilter = (variant) =>
  variant.kind === 'choice' ? 'Z' : variant.kind === 'cloze' ? 'C' : 'T';
const matchesFilter = (variant) =>
  state.filter === 'all' || contentFilter(variant) === state.filter;

function levelCounts() {
  const counts = {};
  for (const { variant } of variants) {
    if (!variant.usable || variant.route !== route() || !matchesFilter(variant)) continue;
    counts[variant.level] ??= { total: 0 };
    counts[variant.level].total += 1;
    counts[variant.level][variant.kind] = (counts[variant.level][variant.kind] ?? 0) + 1;
  }
  return counts;
}

function shell(content) {
  app.innerHTML = `<div class="shell">
    <header class="top">
      <div class="brand"><span class="mark">N</span><span>Nebula <em>Tech</em></span></div>
      <span class="top-label">Language Lab</span>
    </header>
    ${content}
  </div>`;
  window.scrollTo(0, 0);
}

function menu(message = '') {
  const counts = levelCounts();
  if (!counts[state.level]) {
    const first = Object.keys(counts).sort((a, b) => a - b)[0];
    if (first) state.level = Number(first);
  }
  const current = counts[state.level] ?? { total: 0 };
  const languageButton = (id, selected, attribute) =>
    `<button class="language-flag" type="button" ${attribute}="${id}" aria-pressed="${selected}">
      <img src="${flags[id]}" alt="" width="76" height="52" />
      <strong>${esc(endonyms[id])}</strong>
    </button>`;
  shell(`<section class="grid step-${state.setupStep}">
    <aside class="content-summary" ${state.setupStep !== 3 ? 'hidden' : ''}>
      <p class="eyebrow">${esc(ui().collection)}</p>
      <h2>${esc(t().level)} ${state.level} <span class="summary-count">${esc(t().exercises(current.total))}</span></h2>
      <div class="formats">
        ${['naming', 'translation', 'choice', 'cloze']
          .map(
            (kind) =>
              `<div class="format ${current[kind] ? '' : 'empty'}"><span>${current[kind] ?? 0}</span><b>${esc(t().kinds[kind])}</b></div>`,
          )
          .join('')}
      </div>
    </aside>
    <div class="card setup-card">
      <div class="setup-progress">
        <span class="${state.setupStep === 1 ? 'active' : ''}"><i>1</i>${esc(t().speak)}</span>
        <span class="${state.setupStep === 2 ? 'active' : ''}"><i>2</i>${esc(t().learn)}</span>
        <span class="${state.setupStep === 3 ? 'active' : ''}"><i>3</i>${esc(t().level)}</span>
      </div>
      ${state.setupStep > 1 ? `<button class="text-button setup-back" id="back" type="button">← ${esc(ui().back)}</button>` : ''}
      <h1>${esc(ui().titles[state.setupStep - 1])}</h1>
      <p class="setup-subtitle">${esc(ui().subtitles[state.setupStep - 1])}</p>
      ${state.setupStep === 1 ? `<fieldset class="language-picker">
        <legend class="sr-only">${esc(t().speak)}</legend>
        <div class="language-flags">
          ${[1, 2, 3, 4, 5].map((id) => languageButton(id, state.native === String(id), 'data-native')).join('')}
          <button class="language-flag other-language" type="button" data-native="other" aria-pressed="${state.native === 'other'}">
            <span class="other-symbol" aria-hidden="true">U</span>
            <strong>${esc(ui().other)}</strong><small>${esc(ui().otherHint)}</small>
          </button>
        </div>
      </fieldset>` : ''}
      ${state.setupStep === 2 ? `<fieldset class="language-picker">
        <legend class="sr-only">${esc(t().learn)}</legend>
        <div class="language-flags">
          ${[1, 2, 3, 4, 5].map((id) => languageButton(id, state.target === String(id), 'data-target')).join('')}
        </div>
      </fieldset>` : ''}
      ${state.setupStep === 3 ? `<fieldset class="level-picker"><legend class="sr-only">${esc(t().level)}</legend><div class="level-grid">
          ${Array.from({ length: 9 }, (_, i) => i + 1)
            .map((level) => {
              const total = counts[level]?.total ?? 0;
              return `<button type="button" class="level-option" data-level="${level}" aria-pressed="${state.level === level}" ${total ? '' : 'disabled'}><strong>${level}</strong><small>${total ? esc(t().exercises(total)) : esc(t().empty)}</small></button>`;
            })
            .join('')}</div></fieldset>
      <div class="settings-title">${esc(ui().details)}</div><div class="settings-grid"><label>${esc(t().answering)}
        <select id="mode">
          ${['auto', 'write', 'select']
            .map(
              (mode) =>
                `<option value="${mode}" ${state.mode === mode ? 'selected' : ''}>${esc(t().modes[mode])}</option>`,
            )
            .join('')}
        </select>
      </label>
      <label>${esc(ui().filter)}
        <select id="filter">
          ${['all','Z','C','T'].map((code, index) => `<option value="${code}" ${state.filter === code ? 'selected' : ''}>${esc(ui().filters[index])}</option>`).join('')}
        </select>
      </label></div>
      ${message ? `<p class="warn">${esc(message)}</p>` : ''}
      <button class="primary" id="start" ${current.total ? '' : 'disabled'}>${esc(t().start)}</button>` : ''}
    </div>
  </section>`);
  app.querySelectorAll('[data-native]').forEach((button) =>
    button.addEventListener('click', () => {
    state.native = button.dataset.native;
    if (state.native !== 'other') state.reader = state.native;
    state.setupStep = 2;
    menu();
    }),
  );
  app.querySelectorAll('[data-target]').forEach((button) =>
    button.addEventListener('click', () => {
    state.target = button.dataset.target;
    state.setupStep = 3;
    menu();
    }),
  );
  const on = (id, handler) => {
    const element = app.querySelector('#' + id);
    if (element) element.addEventListener('change', handler);
  };
  app.querySelectorAll('[data-level]').forEach((button) => button.addEventListener('click', () => {
    state.level = Number(button.dataset.level);
    menu();
  }));
  on('mode', (event) => {
    state.mode = event.target.value;
    menu();
  });
  on('filter', (event) => {
    state.filter = event.target.value;
    menu();
  });
  app.querySelector('#back')?.addEventListener('click', () => {
    state.setupStep = Math.max(1, state.setupStep - 1);
    menu();
  });
  app.querySelector('#start')?.addEventListener('click', start);
}

function start() {
  state.cards = variants
    .filter(
      ({ variant }) =>
        variant.usable &&
        variant.route === route() &&
        variant.level === state.level &&
        matchesFilter(variant),
    )
    .sort((a, b) => a.variant.code.localeCompare(b.variant.code));
  if (!state.cards.length) return menu(t().none);
  state.index = 0;
  state.score = 0;
  state.chosen = '';
  state.checked = null;
  state.log = [];
  card();
}

function card() {
  const { concept, variant } = state.cards[state.index];
  const mode = answerMode(variant);
  const target = names[state.reader][variant.targetLanguage];
  const media = concept.media;
  const picture = media?.path
    ? `<figure class="exercise-visual"><img src="${esc(media.path)}" alt="" loading="eager" decoding="async" ${media.width ? `width="${media.width}" height="${media.height}"` : ''} class="${variant.kind === 'naming' || variant.kind === 'choice' ? '' : 'small'}" /></figure>`
    : '';
  let stage = picture;
  if (variant.kind === 'translation')
    stage += `<p class="word" lang="${tags[variant.sourceLanguage]}">${esc(variant.prompt)}</p>`;
  if (variant.kind === 'cloze' && mode === 'write')
    stage += `<p class="sentence" lang="${tags[variant.targetLanguage]}">${esc(variant.cloze?.before ?? '')}<input id="field" autocomplete="off" spellcheck="false" />${esc(variant.cloze?.after ?? '')}</p>`;
  const answerArea =
    mode === 'select'
      ? `<div class="answers">${optionsFor(variant)
          .map(
            (option) =>
              `<button type="button" data-option="${esc(option)}" lang="${tags[variant.targetLanguage]}">${esc(option)}</button>`,
          )
          .join('')}</div>`
      : variant.kind === 'cloze'
        ? ''
        : `<label>${esc(t().type)}<input id="field" autocomplete="off" spellcheck="false" lang="${tags[variant.targetLanguage]}" /></label>
           <div class="accents">${accents[variant.targetLanguage].map((character) => `<button type="button" data-char="${esc(character)}">${esc(character)}</button>`).join('')}</div>`;
  shell(`<section class="lesson">
    <div class="lesson-head">
      <div>
        <span class="pill">${esc(t().kinds[variant.kind])}</span>
        <span class="pill">${esc(t().level)} ${state.level}</span>
        <h2>${esc(t().prompts[variant.kind](target))}</h2>
      </div>
      <button class="lesson-menu" id="exit" type="button" aria-label="${esc(t().menu)}">
        <span aria-hidden="true">←</span>${esc(t().menu)}
      </button>
    </div>
    <div class="progress"><div class="bar" style="width:${(state.index / state.cards.length) * 100}%"></div></div>
    <p class="muted">${state.index + 1} / ${state.cards.length}</p>
    ${variant.hint && variant.kind !== 'cloze' ? `<p class="hint"><b>${esc(t().hint)}</b><span lang="${tags[variant.targetLanguage]}">${esc(variant.hint)}</span></p>` : ''}
    <div class="stage ${picture ? 'has-visual ' : ''}${esc(variant.kind)}">${stage}</div>
    <form id="answer-form">
      ${answerArea}
      <div id="feedback" class="hidden"></div>
      <div class="actions">
        <button class="primary" id="check" type="submit">${esc(t().check)}</button>
        <button class="primary hidden" id="next" type="button">${esc(t().next)}</button>
      </div>
    </form>
  </section>`);
  app.querySelector('#exit').addEventListener('click', () => menu());
  app.querySelectorAll('[data-option]').forEach((button) =>
    button.addEventListener('click', () => {
      state.chosen = button.dataset.option;
      app.querySelectorAll('[data-option]').forEach((other) =>
        other.classList.toggle('sel', other === button),
      );
    }),
  );
  const field = app.querySelector('#field');
  field?.addEventListener('input', () => {
    state.chosen = field.value;
  });
  app.querySelectorAll('[data-char]').forEach((button) =>
    button.addEventListener('click', () => {
      field.value += button.dataset.char;
      state.chosen = field.value;
      field.focus();
    }),
  );
  app.querySelector('#answer-form').addEventListener('submit', (event) => {
    event.preventDefault();
    check(variant);
  });
  app.querySelector('#next').addEventListener('click', advance);
}

function check(variant) {
  if (state.checked || !state.chosen.trim()) return;
  state.checked = true;
  const result = quality(state.chosen, variant.answers);
  if (result !== 'none') state.score += 1;
  state.log.push({
    variant,
    value: state.chosen,
    correct: result !== 'none',
  });
  const extra = variant.answers.slice(1);
  const feedback = app.querySelector('#feedback');
  feedback.className = 'result ' + (result === 'none' ? 'bad' : 'good');
  feedback.innerHTML = `<strong>${esc(result === 'exact' ? t().right : result === 'accent' ? t().accent : t().wrong)}</strong>
    <p class="muted">${esc(t().expected(variant.primaryAnswer))} ${extra.length ? esc(t().also(extra.join(', '))) : ''}</p>`;
  app.querySelectorAll('[data-option]').forEach((button) => {
    if (variant.answers.some((answer) => normalize(answer) === normalize(button.dataset.option)))
      button.classList.add('ok');
    else if (button.dataset.option === state.chosen) button.classList.add('bad');
    button.disabled = true;
  });
  const field = app.querySelector('#field');
  if (field) field.disabled = true;
  app.querySelector('#check').classList.add('hidden');
  app.querySelector('#next').classList.remove('hidden');
}

function advance() {
  state.chosen = '';
  state.checked = null;
  if (state.index >= state.cards.length - 1) return results();
  state.index += 1;
  card();
}

function results() {
  shell(`<section class="lesson">
    <span class="pill">${esc(t().level)} ${state.level}</span>
    <h1>${esc(t().score(state.score, state.cards.length))}</h1>
    <h2>${esc(t().review)}</h2>
    <div class="review">
      ${state.log
        .map(
          (entry) =>
            `<div><strong lang="${tags[entry.variant.targetLanguage]}">${esc(entry.variant.prompt ? entry.variant.prompt + ' → ' + entry.variant.primaryAnswer : entry.variant.primaryAnswer)}</strong>${entry.correct ? '' : `<p class="muted">${esc(entry.value)}</p>`}</div>`,
        )
        .join('')}
    </div>
    <div class="actions">
      <button class="secondary" id="menu">${esc(t().menu)}</button>
      <button class="primary" id="again">${esc(t().again)}</button>
    </div>
  </section>`);
  app.querySelector('#menu').addEventListener('click', () => menu());
  app.querySelector('#again').addEventListener('click', start);
}

const database = await fetch('data/content-db.json').then((response) =>
  response.json(),
);
variants = database.concepts.flatMap((concept) =>
  concept.variants.map((variant) => ({ concept, variant })),
);
menu();
