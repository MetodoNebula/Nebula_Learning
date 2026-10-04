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

const state = {
  native: '3',
  target: '1',
  level: 1,
  mode: 'auto',
  reader: '3',
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

function levelCounts() {
  const counts = {};
  for (const { variant } of variants) {
    if (!variant.usable || variant.route !== route()) continue;
    counts[variant.level] ??= { total: 0 };
    counts[variant.level].total += 1;
    counts[variant.level][variant.kind] = (counts[variant.level][variant.kind] ?? 0) + 1;
  }
  return counts;
}

function shell(content) {
  app.innerHTML = `<div class="shell">
    <header class="top">
      <div class="brand"><span class="mark">N</span><span>Nebula Tech<br><span class="muted" style="font-size:.8rem">${esc(t().lead.split(',')[0])}</span></span></div>
      <span class="pill">GitHub Pages</span>
    </header>
    ${content}
  </div>`;
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
      <img src="${flags[id]}" alt="" width="38" height="27" />
      <span>${esc(endonyms[id])}</span>
    </button>`;
  shell(`<section class="grid">
    <div>
      <span class="pill">${esc(t().level)} ${state.level}</span>
      <span class="pill">${esc(route())}</span>
      <h1>${esc(database.concepts.length)} conceptos · ${esc(variants.filter((v) => v.variant.usable).length)} fichas</h1>
      <p class="muted">${esc(t().lead)}</p>
      <h2>${esc(t().formats)}</h2>
      <div class="formats">
        ${['naming', 'translation', 'choice', 'cloze']
          .map(
            (kind) =>
              `<div class="format ${current[kind] ? '' : 'empty'}"><span>${current[kind] ?? 0}</span><b>${esc(t().kinds[kind])}</b></div>`,
          )
          .join('')}
      </div>
    </div>
    <div class="card">
      <fieldset class="language-picker">
        <legend>${esc(t().speak)}</legend>
        <div class="language-flags">
          ${[1, 2, 3, 4, 5].map((id) => languageButton(id, state.native === String(id), 'data-native')).join('')}
          <button class="language-flag other-language" type="button" data-native="other" aria-pressed="${state.native === 'other'}">
            <span class="other-symbol" aria-hidden="true">U</span>
            <span>${esc(t().other)}</span>
          </button>
        </div>
      </fieldset>
      <fieldset class="language-picker">
        <legend>${esc(t().learn)}</legend>
        <div class="language-flags">
          ${[1, 2, 3, 4, 5].map((id) => languageButton(id, state.target === String(id), 'data-target')).join('')}
        </div>
      </fieldset>
      <label>${esc(t().level)}
        <select id="level">
          ${Array.from({ length: 9 }, (_, i) => i + 1)
            .map((level) => {
              const total = counts[level]?.total ?? 0;
              return `<option value="${level}" ${state.level === level ? 'selected' : ''} ${total ? '' : 'disabled'}>${level} · ${total ? esc(t().exercises(total)) : esc(t().empty)}</option>`;
            })
            .join('')}
        </select>
      </label>
      <label>${esc(t().answering)}
        <select id="mode">
          ${['auto', 'write', 'select']
            .map(
              (mode) =>
                `<option value="${mode}" ${state.mode === mode ? 'selected' : ''}>${esc(t().modes[mode])}</option>`,
            )
            .join('')}
        </select>
      </label>
      ${message ? `<p class="warn">${esc(message)}</p>` : ''}
      <button class="primary" id="start" ${current.total ? '' : 'disabled'}>${esc(t().start)}</button>
    </div>
  </section>`);
  app.querySelectorAll('[data-native]').forEach((button) =>
    button.addEventListener('click', () => {
    state.native = button.dataset.native;
    if (state.native !== 'other') state.reader = state.native;
    menu();
    }),
  );
  app.querySelectorAll('[data-target]').forEach((button) =>
    button.addEventListener('click', () => {
    state.target = button.dataset.target;
    menu();
    }),
  );
  const on = (id, handler) =>
    app.querySelector('#' + id).addEventListener('change', handler);
  on('level', (event) => {
    state.level = Number(event.target.value);
    menu();
  });
  on('mode', (event) => {
    state.mode = event.target.value;
    menu();
  });
  app.querySelector('#start').addEventListener('click', start);
}

function start() {
  state.cards = variants
    .filter(
      ({ variant }) =>
        variant.usable && variant.route === route() && variant.level === state.level,
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
  const picture = media
    ? `<img src="${esc(media.path)}" alt="" ${media.width ? `width="${media.width}" height="${media.height}"` : ''} class="${variant.kind === 'naming' || variant.kind === 'choice' ? '' : 'small'}" />`
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
        <span class="pill">${esc(variant.code)} · ${esc(variant.route)}</span>
        <h2>${esc(t().prompts[variant.kind](target))}</h2>
      </div>
      <button class="secondary" id="exit">${esc(t().menu)}</button>
    </div>
    <div class="progress"><div class="bar" style="width:${(state.index / state.cards.length) * 100}%"></div></div>
    <p class="muted">${state.index + 1} / ${state.cards.length}</p>
    ${variant.hint && variant.kind !== 'cloze' ? `<p class="hint"><b>${esc(t().hint)}</b><span lang="${tags[variant.targetLanguage]}">${esc(variant.hint)}</span></p>` : ''}
    <div class="stage">${stage}</div>
    ${answerArea}
    <div id="feedback" class="hidden"></div>
    <div class="actions">
      <button class="primary" id="check">${esc(t().check)}</button>
      <button class="primary hidden" id="next">${esc(t().next)}</button>
    </div>
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
  app.querySelector('#check').addEventListener('click', () => check(variant));
  app.querySelector('#next').addEventListener('click', advance);
}

function check(variant) {
  if (!state.chosen.trim()) return;
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
  if (state.index >= state.cards.length - 1) return results();
  state.index += 1;
  card();
}

function results() {
  shell(`<section class="lesson">
    <span class="pill">${esc(route())} · ${esc(t().level)} ${state.level}</span>
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
