import type {
  LanguageId,
  NativeLanguageId,
  QuestionType,
} from './lesson.ts';
import type { HintKind } from './content/format.ts';

export type UiLanguage = LanguageId;

/** A learner who speaks none of the five reads the interface in English. */
export function uiLanguage(native: NativeLanguageId): UiLanguage {
  return native === 'other' ? '1' : native;
}

export type Dictionary = {
  tag: string;
  tagline: string;
  // shell
  signOut: string;
  backToMenu: string;
  leaveLesson: string;
  // auth
  createAccount: string;
  signIn: string;
  createTab: string;
  signInTab: string;
  username: string;
  password: string;
  showPassword: string;
  hidePassword: string;
  continueLabel: string;
  fillDemo: string;
  localAccountNote: string;
  signupError: string;
  loginError: string;
  genericError: string;
  // menu
  menuHeading: (user: string) => string;
  menuLead: string;
  youSpeak: string;
  youLearn: string;
  otherLanguage: string;
  levelLabel: string;
  levelOption: (level: number, count: number) => string;
  levelEmpty: (level: number) => string;
  answerModeLabel: string;
  answerModes: Record<'auto' | 'write' | 'select' | 'mixed', string>;
  answerModeHelp: Record<'auto' | 'write' | 'select' | 'mixed', string>;
  routeBadge: (route: string) => string;
  exerciseCount: (count: number) => string;
  formatBreakdown: string;
  start: string;
  noContent: string;
  loadFailed: string;
  best: (score: number, total: number) => string;
  bestShort: (score: number) => string;
  demoProfiles: string;
  demoProfilesLead: string;
  // lesson
  progress: (index: number, total: number) => string;
  points: string;
  check: string;
  checking: string;
  loadingLabel: string;
  edit: string;
  next: string;
  seeResult: string;
  seeSolution: string;
  typeHere: string;
  accentHelper: string;
  pictureAlt: string;
  chooseOne: string;
  generatedOptions: string;
  selectInstruction: (target: string) => string;
  // prompts
  promptFor: (type: QuestionType, target: string) => string;
  instructionFor: (type: QuestionType, target: string) => string;
  typeName: Record<'choice' | 'cloze' | 'naming' | 'translation', string>;
  hintLabel: Record<HintKind, string>;
  // feedback
  correctTitle: string;
  accentTitle: string;
  wrongTitle: string;
  accentNote: (answer: string) => string;
  expected: (answer: string) => string;
  alsoAccepted: (answers: string) => string;
  yourAnswer: (value: string) => string;
  // results
  resultHeading: (score: number, total: number) => string;
  resultLead: string;
  newRecord: string;
  statPoints: string;
  statCorrect: string;
  statBest: string;
  again: string;
  reviewTitle: string;
};

function build(
  tag: string,
  t: Omit<Dictionary, 'tag' | 'promptFor' | 'instructionFor'> & {
    prompts: Record<'choice' | 'cloze' | 'naming' | 'translation', (target: string) => string>;
    instructions: Record<'choice' | 'cloze' | 'naming' | 'translation', (target: string) => string>;
  },
): Dictionary {
  const { prompts, instructions, ...rest } = t;
  const key = (type: QuestionType) =>
    type === 'choice' || type === 'cloze' || type === 'naming' || type === 'translation'
      ? type
      : 'translation';
  return {
    ...rest,
    tag,
    promptFor: (type, target) => prompts[key(type)](target),
    instructionFor: (type, target) => instructions[key(type)](target),
  };
}

const en = build('en', {
  tagline: 'Language lab',
  signOut: 'Sign out',
  backToMenu: 'Menu',
  leaveLesson: 'Leave the lesson',
  createAccount: 'Create an account',
  signIn: 'Sign in',
  createTab: 'Create',
  signInTab: 'Sign in',
  username: 'Username',
  password: 'Password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  continueLabel: 'Continue',
  fillDemo: 'Fill in the demo account',
  localAccountNote: 'This account only lives in this browser. It is a demo, not real authentication.',
  signupError: 'Use a username of at least 2 characters and a password of at least 4.',
  loginError: 'Wrong username or password. You can use the demo account below.',
  genericError: 'Something went wrong. Please try again.',
  menuHeading: (user) => `Choose the exercises for ${user}.`,
  menuLead:
    'The language route comes from the two digits in each file name: the language you read and the language you practise.',
  youSpeak: 'I speak',
  youLearn: 'I am learning',
  otherLanguage: 'Another language (picture mode)',
  levelLabel: 'Level',
  levelOption: (level, count) => `${level} · ${count} exercises`,
  levelEmpty: (level) => `${level} · no content`,
  answerModeLabel: 'Answering',
  answerModes: {
    auto: 'As authored',
    write: 'Always type',
    select: 'Always choose',
    mixed: 'Mixed',
  },
  answerModeHelp: {
    auto: 'Type the word, except where the file supplies its own options.',
    write: 'Type every answer, including the multiple-choice cards.',
    select: 'Four options everywhere; extra ones come from the same level.',
    mixed: 'Alternates typing and choosing.',
  },
  routeBadge: (route) => `Route ${route}`,
  exerciseCount: (count) => `${count} exercises`,
  formatBreakdown: 'Formats at this level',
  start: 'Start',
  noContent: 'This level has no content for that route yet.',
  loadFailed: 'The exercises could not be loaded. Try another combination.',
  best: (score, total) => `Best: ${score}/${total}`,
  bestShort: (score) => `Best: ${score} correct`,
  demoProfiles: 'Ready-made routes',
  demoProfilesLead: 'Three learners, three ways through the same files.',
  progress: (index, total) => `${index} of ${total}`,
  points: 'pts',
  check: 'Check',
  checking: 'Checking…',
  loadingLabel: 'Loading…',
  edit: 'Edit',
  next: 'Next',
  seeResult: 'See the result',
  seeSolution: 'See the solution',
  typeHere: 'Type your answer',
  accentHelper: 'Accented characters',
  pictureAlt: 'Picture for this exercise',
  chooseOne: 'Possible answers',
  generatedOptions: 'The extra options come from other words at this level.',
  selectInstruction: (target) => `Choose the right option in ${target}.`,
  prompts: {
    naming: (target) => `What is this called in ${target}?`,
    translation: (target) => `Translate into ${target}`,
    choice: () => 'Pick the right word',
    cloze: () => 'Complete the sentence',
  },
  instructions: {
    naming: (target) => `Look at the picture and write the word in ${target}.`,
    translation: (target) => `Read the word and write it in ${target}.`,
    choice: () => 'Only one of the four options matches the picture.',
    cloze: (target) => `Fill the gap in ${target}. The picture is there to help.`,
  },
  typeName: {
    naming: 'Name the picture',
    translation: 'Translation',
    choice: 'Multiple choice',
    cloze: 'Gap fill',
  },
  hintLabel: {
    none: 'Hint',
    cloze: 'Sentence',
    definition: 'Clue',
    alternative: 'Also',
    warning: 'Careful',
    symbol: 'Symbol',
  },
  correctTitle: 'Correct. +10 points',
  accentTitle: 'Right word, watch the accents',
  wrongTitle: 'Not this time',
  accentNote: (answer) => `It is written ${answer}.`,
  expected: (answer) => `Expected answer: ${answer}.`,
  alsoAccepted: (answers) => `Also accepted: ${answers}.`,
  yourAnswer: (value) => `You wrote: ${value}`,
  resultHeading: (score, total) => `Correct: ${score} of ${total}`,
  resultLead: 'Every attempt counts. Repeat the level or change the route.',
  newRecord: 'New personal best',
  statPoints: 'Points',
  statCorrect: 'Correct',
  statBest: 'Personal best',
  again: 'Play again',
  reviewTitle: 'Words in this round',
});

const fr = build('fr', {
  tagline: 'Laboratoire de langues',
  signOut: 'Se déconnecter',
  backToMenu: 'Menu',
  leaveLesson: 'Quitter la leçon',
  createAccount: 'Créer un compte',
  signIn: 'Se connecter',
  createTab: 'Créer',
  signInTab: 'Connexion',
  username: 'Identifiant',
  password: 'Mot de passe',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
  continueLabel: 'Continuer',
  fillDemo: 'Remplir le compte de démonstration',
  localAccountNote: "Ce compte reste dans ce navigateur. C'est une démonstration, pas une authentification réelle.",
  signupError: 'Utilise un identifiant de 2 caractères minimum et un mot de passe de 4 minimum.',
  loginError: 'Identifiant ou mot de passe incorrect. Le compte de démonstration est disponible ci-dessous.',
  genericError: 'Une erreur est survenue. Réessaie.',
  menuHeading: (user) => `Choisis les exercices de ${user}.`,
  menuLead:
    "Le parcours vient des deux chiffres du nom de fichier : la langue que tu lis et la langue que tu travailles.",
  youSpeak: 'Je parle',
  youLearn: "J'apprends",
  otherLanguage: 'Une autre langue (mode image)',
  levelLabel: 'Niveau',
  levelOption: (level, count) => `${level} · ${count} exercices`,
  levelEmpty: (level) => `${level} · sans contenu`,
  answerModeLabel: 'Réponses',
  answerModes: {
    auto: 'Comme dans les fiches',
    write: 'Toujours écrire',
    select: 'Toujours choisir',
    mixed: 'Alterné',
  },
  answerModeHelp: {
    auto: "Écris le mot, sauf quand la fiche propose déjà ses options.",
    write: 'Écris toutes les réponses, même pour les fiches à choix multiple.',
    select: 'Quatre options partout ; les autres viennent du même niveau.',
    mixed: 'Alterne écriture et choix.',
  },
  routeBadge: (route) => `Parcours ${route}`,
  exerciseCount: (count) => `${count} exercices`,
  formatBreakdown: 'Formats à ce niveau',
  start: 'Commencer',
  noContent: "Ce niveau n'a pas encore de contenu pour ce parcours.",
  loadFailed: 'Impossible de charger les exercices. Essaie une autre combinaison.',
  best: (score, total) => `Record : ${score}/${total}`,
  bestShort: (score) => `Record : ${score} bonnes réponses`,
  demoProfiles: 'Parcours prêts à essayer',
  demoProfilesLead: 'Trois profils, trois façons de traverser les mêmes fiches.',
  progress: (index, total) => `${index} sur ${total}`,
  points: 'pts',
  check: 'Vérifier',
  checking: 'Vérification…',
  loadingLabel: 'Chargement…',
  edit: 'Modifier',
  next: 'Suivant',
  seeResult: 'Voir le résultat',
  seeSolution: 'Voir la solution',
  typeHere: 'Écris ta réponse',
  accentHelper: 'Caractères accentués',
  pictureAlt: "Image de l'exercice",
  chooseOne: 'Réponses possibles',
  generatedOptions: "Les autres options viennent d'autres mots du même niveau.",
  selectInstruction: (target) => `Choisis la bonne option en ${target}.`,
  prompts: {
    naming: (target) => `Comment dit-on ceci en ${target} ?`,
    translation: (target) => `Traduis en ${target}`,
    choice: () => 'Choisis le bon mot',
    cloze: () => 'Complète la phrase',
  },
  instructions: {
    naming: (target) => `Regarde l'image et écris le mot en ${target}.`,
    translation: (target) => `Lis le mot et écris-le en ${target}.`,
    choice: () => "Une seule des quatre options correspond à l'image.",
    cloze: (target) => `Complète le trou en ${target}. L'image t'aide.`,
  },
  typeName: {
    naming: "Nommer l'image",
    translation: 'Traduction',
    choice: 'Choix multiple',
    cloze: 'Texte à trou',
  },
  hintLabel: {
    none: 'Indice',
    cloze: 'Phrase',
    definition: 'Définition',
    alternative: 'Aussi',
    warning: 'Attention',
    symbol: 'Symbole',
  },
  correctTitle: 'Correct. +10 points',
  accentTitle: 'Bon mot, attention aux accents',
  wrongTitle: 'Pas cette fois',
  accentNote: (answer) => `On écrit ${answer}.`,
  expected: (answer) => `Réponse attendue : ${answer}.`,
  alsoAccepted: (answers) => `Aussi acceptées : ${answers}.`,
  yourAnswer: (value) => `Tu as écrit : ${value}`,
  resultHeading: (score, total) => `Bonnes réponses : ${score} sur ${total}`,
  resultLead: 'Chaque essai compte. Refais le niveau ou change de parcours.',
  newRecord: 'Nouveau record',
  statPoints: 'Points',
  statCorrect: 'Bonnes réponses',
  statBest: 'Record',
  again: 'Rejouer',
  reviewTitle: 'Mots de cette série',
});

const es = build('es', {
  tagline: 'Laboratorio de idiomas',
  signOut: 'Salir',
  backToMenu: 'Menú',
  leaveLesson: 'Salir de la lección',
  createAccount: 'Crea una cuenta',
  signIn: 'Entra',
  createTab: 'Crear',
  signInTab: 'Entrar',
  username: 'Usuario',
  password: 'Contraseña',
  showPassword: 'Mostrar contraseña',
  hidePassword: 'Ocultar contraseña',
  continueLabel: 'Continuar',
  fillDemo: 'Rellenar la cuenta de demostración',
  localAccountNote: 'La cuenta se guarda solo en este navegador. Es una demo, no autenticación real.',
  signupError: 'Usa un usuario de al menos 2 caracteres y una contraseña de al menos 4.',
  loginError: 'Usuario o contraseña incorrectos. Abajo tienes la cuenta de demostración.',
  genericError: 'Algo ha fallado. Inténtalo otra vez.',
  menuHeading: (user) => `Elige los ejercicios de ${user}.`,
  menuLead:
    'La ruta sale de los dos dígitos del nombre del archivo: el idioma que lees y el idioma que practicas.',
  youSpeak: 'Hablo',
  youLearn: 'Aprendo',
  otherLanguage: 'Otro idioma (modo imagen)',
  levelLabel: 'Nivel',
  levelOption: (level, count) => `${level} · ${count} ejercicios`,
  levelEmpty: (level) => `${level} · sin contenido`,
  answerModeLabel: 'Respuestas',
  answerModes: {
    auto: 'Como en las fichas',
    write: 'Siempre escribir',
    select: 'Siempre elegir',
    mixed: 'Alternado',
  },
  answerModeHelp: {
    auto: 'Escribes la palabra, salvo en las fichas que ya traen sus opciones.',
    write: 'Escribes todas las respuestas, también las de opción múltiple.',
    select: 'Cuatro opciones siempre; las demás salen del mismo nivel.',
    mixed: 'Alterna escribir y elegir.',
  },
  routeBadge: (route) => `Ruta ${route}`,
  exerciseCount: (count) => `${count} ejercicios`,
  formatBreakdown: 'Formatos en este nivel',
  start: 'Empezar',
  noContent: 'Ese nivel todavía no tiene contenido para esta ruta.',
  loadFailed: 'No se pudieron cargar los ejercicios. Prueba otra combinación.',
  best: (score, total) => `Récord: ${score}/${total}`,
  bestShort: (score) => `Récord: ${score} aciertos`,
  demoProfiles: 'Rutas de ejemplo',
  demoProfilesLead: 'Tres alumnos, tres formas de recorrer las mismas fichas.',
  progress: (index, total) => `${index} de ${total}`,
  points: 'pts',
  check: 'Comprobar',
  checking: 'Comprobando…',
  loadingLabel: 'Cargando…',
  edit: 'Editar',
  next: 'Siguiente',
  seeResult: 'Ver el resultado',
  seeSolution: 'Ver la solución',
  typeHere: 'Escribe tu respuesta',
  accentHelper: 'Caracteres con acento',
  pictureAlt: 'Imagen del ejercicio',
  chooseOne: 'Respuestas posibles',
  generatedOptions: 'Las opciones extra salen de otras palabras del mismo nivel.',
  selectInstruction: (target) => `Elige la opción correcta en ${target}.`,
  prompts: {
    naming: (target) => `¿Cómo se llama esto en ${target}?`,
    translation: (target) => `Tradúcelo al ${target}`,
    choice: () => 'Elige la palabra correcta',
    cloze: () => 'Completa la frase',
  },
  instructions: {
    naming: (target) => `Mira la imagen y escribe la palabra en ${target}.`,
    translation: (target) => `Lee la palabra y escríbela en ${target}.`,
    choice: () => 'Solo una de las cuatro opciones corresponde a la imagen.',
    cloze: (target) => `Rellena el hueco en ${target}. La imagen te ayuda.`,
  },
  typeName: {
    naming: 'Nombrar la imagen',
    translation: 'Traducción',
    choice: 'Opción múltiple',
    cloze: 'Hueco en la frase',
  },
  hintLabel: {
    none: 'Pista',
    cloze: 'Frase',
    definition: 'Definición',
    alternative: 'También',
    warning: 'Ojo',
    symbol: 'Símbolo',
  },
  correctTitle: 'Correcto. +10 puntos',
  accentTitle: 'Palabra correcta, cuida los acentos',
  wrongTitle: 'Esta vez no',
  accentNote: (answer) => `Se escribe ${answer}.`,
  expected: (answer) => `Respuesta esperada: ${answer}.`,
  alsoAccepted: (answers) => `También se acepta: ${answers}.`,
  yourAnswer: (value) => `Escribiste: ${value}`,
  resultHeading: (score, total) => `Aciertos: ${score} de ${total}`,
  resultLead: 'Cada intento cuenta. Repite el nivel o cambia de ruta.',
  newRecord: 'Nuevo récord',
  statPoints: 'Puntos',
  statCorrect: 'Aciertos',
  statBest: 'Récord',
  again: 'Repetir',
  reviewTitle: 'Palabras de esta ronda',
});

const it = build('it', {
  tagline: 'Laboratorio linguistico',
  signOut: 'Esci',
  backToMenu: 'Menu',
  leaveLesson: 'Esci dalla lezione',
  createAccount: 'Crea un account',
  signIn: 'Accedi',
  createTab: 'Crea',
  signInTab: 'Accedi',
  username: 'Utente',
  password: 'Password',
  showPassword: 'Mostra la password',
  hidePassword: 'Nascondi la password',
  continueLabel: 'Continua',
  fillDemo: "Compila l'account dimostrativo",
  localAccountNote: "L'account resta solo in questo browser. È una demo, non autenticazione reale.",
  signupError: 'Usa un utente di almeno 2 caratteri e una password di almeno 4.',
  loginError: "Utente o password errati. Sotto trovi l'account dimostrativo.",
  genericError: 'Qualcosa è andato storto. Riprova.',
  menuHeading: (user) => `Scegli gli esercizi di ${user}.`,
  menuLead:
    'Il percorso nasce dalle due cifre del nome del file: la lingua che leggi e la lingua che eserciti.',
  youSpeak: 'Parlo',
  youLearn: 'Imparo',
  otherLanguage: "Un'altra lingua (modalità immagine)",
  levelLabel: 'Livello',
  levelOption: (level, count) => `${level} · ${count} esercizi`,
  levelEmpty: (level) => `${level} · senza contenuti`,
  answerModeLabel: 'Risposte',
  answerModes: {
    auto: 'Come nelle schede',
    write: 'Sempre scrivere',
    select: 'Sempre scegliere',
    mixed: 'Alternato',
  },
  answerModeHelp: {
    auto: 'Scrivi la parola, tranne nelle schede che portano già le opzioni.',
    write: 'Scrivi tutte le risposte, anche quelle a scelta multipla.',
    select: 'Quattro opzioni ovunque; le altre vengono dallo stesso livello.',
    mixed: 'Alterna scrittura e scelta.',
  },
  routeBadge: (route) => `Percorso ${route}`,
  exerciseCount: (count) => `${count} esercizi`,
  formatBreakdown: 'Formati a questo livello',
  start: 'Inizia',
  noContent: 'Questo livello non ha ancora contenuti per questo percorso.',
  loadFailed: 'Non è stato possibile caricare gli esercizi. Prova un altro abbinamento.',
  best: (score, total) => `Record: ${score}/${total}`,
  bestShort: (score) => `Record: ${score} risposte giuste`,
  demoProfiles: 'Percorsi di esempio',
  demoProfilesLead: 'Tre studenti, tre modi di percorrere le stesse schede.',
  progress: (index, total) => `${index} di ${total}`,
  points: 'pt',
  check: 'Verifica',
  checking: 'Verifica in corso…',
  loadingLabel: 'Caricamento…',
  edit: 'Modifica',
  next: 'Avanti',
  seeResult: 'Vedi il risultato',
  seeSolution: 'Vedi la soluzione',
  typeHere: 'Scrivi la risposta',
  accentHelper: 'Caratteri accentati',
  pictureAlt: "Immagine dell'esercizio",
  chooseOne: 'Risposte possibili',
  generatedOptions: 'Le opzioni extra vengono da altre parole dello stesso livello.',
  selectInstruction: (target) => `Scegli l’opzione giusta in ${target}.`,
  prompts: {
    naming: (target) => `Come si chiama questo in ${target}?`,
    translation: (target) => `Traduci in ${target}`,
    choice: () => 'Scegli la parola giusta',
    cloze: () => 'Completa la frase',
  },
  instructions: {
    naming: (target) => `Guarda l'immagine e scrivi la parola in ${target}.`,
    translation: (target) => `Leggi la parola e scrivila in ${target}.`,
    choice: () => "Solo una delle quattro opzioni corrisponde all'immagine.",
    cloze: (target) => `Riempi lo spazio in ${target}. L'immagine ti aiuta.`,
  },
  typeName: {
    naming: "Nominare l'immagine",
    translation: 'Traduzione',
    choice: 'Scelta multipla',
    cloze: 'Frase da completare',
  },
  hintLabel: {
    none: 'Suggerimento',
    cloze: 'Frase',
    definition: 'Definizione',
    alternative: 'Anche',
    warning: 'Attenzione',
    symbol: 'Simbolo',
  },
  correctTitle: 'Corretto. +10 punti',
  accentTitle: 'Parola giusta, attenzione agli accenti',
  wrongTitle: 'Questa volta no',
  accentNote: (answer) => `Si scrive ${answer}.`,
  expected: (answer) => `Risposta attesa: ${answer}.`,
  alsoAccepted: (answers) => `Si accetta anche: ${answers}.`,
  yourAnswer: (value) => `Hai scritto: ${value}`,
  resultHeading: (score, total) => `Risposte giuste: ${score} su ${total}`,
  resultLead: 'Ogni tentativo conta. Ripeti il livello o cambia percorso.',
  newRecord: 'Nuovo record',
  statPoints: 'Punti',
  statCorrect: 'Risposte giuste',
  statBest: 'Record',
  again: 'Rigioca',
  reviewTitle: 'Parole di questo giro',
});

const de = build('de', {
  tagline: 'Sprachlabor',
  signOut: 'Abmelden',
  backToMenu: 'Menü',
  leaveLesson: 'Lektion verlassen',
  createAccount: 'Konto anlegen',
  signIn: 'Anmelden',
  createTab: 'Anlegen',
  signInTab: 'Anmelden',
  username: 'Benutzername',
  password: 'Passwort',
  showPassword: 'Passwort anzeigen',
  hidePassword: 'Passwort verbergen',
  continueLabel: 'Weiter',
  fillDemo: 'Demodaten eintragen',
  localAccountNote: 'Das Konto bleibt in diesem Browser. Eine Demo, keine echte Anmeldung.',
  signupError: 'Nimm einen Namen mit mindestens 2 Zeichen und ein Passwort mit mindestens 4.',
  loginError: 'Benutzername oder Passwort stimmen nicht. Unten steht das Demokonto.',
  genericError: 'Etwas ist schiefgelaufen. Versuch es noch einmal.',
  menuHeading: (user) => `Wähle die Übungen für ${user}.`,
  menuLead:
    'Die Route steht in den zwei Ziffern des Dateinamens: die Sprache, die du liest, und die Sprache, die du übst.',
  youSpeak: 'Ich spreche',
  youLearn: 'Ich lerne',
  otherLanguage: 'Eine andere Sprache (Bildmodus)',
  levelLabel: 'Stufe',
  levelOption: (level, count) => `${level} · ${count} Übungen`,
  levelEmpty: (level) => `${level} · ohne Inhalt`,
  answerModeLabel: 'Antworten',
  answerModes: {
    auto: 'Wie in den Karten',
    write: 'Immer schreiben',
    select: 'Immer auswählen',
    mixed: 'Gemischt',
  },
  answerModeHelp: {
    auto: 'Du schreibst das Wort, außer wenn die Karte eigene Optionen mitbringt.',
    write: 'Du schreibst jede Antwort, auch bei den Auswahlkarten.',
    select: 'Überall vier Optionen; die übrigen stammen aus derselben Stufe.',
    mixed: 'Wechselt zwischen Schreiben und Auswählen.',
  },
  routeBadge: (route) => `Route ${route}`,
  exerciseCount: (count) => `${count} Übungen`,
  formatBreakdown: 'Formate auf dieser Stufe',
  start: 'Starten',
  noContent: 'Diese Stufe hat für diese Route noch keinen Inhalt.',
  loadFailed: 'Die Übungen konnten nicht geladen werden. Probier eine andere Kombination.',
  best: (score, total) => `Rekord: ${score}/${total}`,
  bestShort: (score) => `Rekord: ${score} richtig`,
  demoProfiles: 'Fertige Routen',
  demoProfilesLead: 'Drei Lernende, drei Wege durch dieselben Karten.',
  progress: (index, total) => `${index} von ${total}`,
  points: 'Pkt.',
  check: 'Prüfen',
  checking: 'Wird geprüft…',
  loadingLabel: 'Wird geladen…',
  edit: 'Bearbeiten',
  next: 'Weiter',
  seeResult: 'Ergebnis ansehen',
  seeSolution: 'Lösung ansehen',
  typeHere: 'Schreib deine Antwort',
  accentHelper: 'Sonderzeichen',
  pictureAlt: 'Bild zur Aufgabe',
  chooseOne: 'Mögliche Antworten',
  generatedOptions: 'Die zusätzlichen Optionen stammen aus anderen Wörtern dieser Stufe.',
  selectInstruction: (target) => `Wähle die richtige Option auf ${target}.`,
  prompts: {
    naming: (target) => `Wie heißt das auf ${target}?`,
    translation: (target) => `Übersetze ins ${target}`,
    choice: () => 'Wähle das richtige Wort',
    cloze: () => 'Ergänze den Satz',
  },
  instructions: {
    naming: (target) => `Sieh dir das Bild an und schreib das Wort auf ${target}.`,
    translation: (target) => `Lies das Wort und schreib es auf ${target}.`,
    choice: () => 'Nur eine der vier Optionen passt zum Bild.',
    cloze: (target) => `Füll die Lücke auf ${target}. Das Bild hilft dir.`,
  },
  typeName: {
    naming: 'Bild benennen',
    translation: 'Übersetzung',
    choice: 'Auswahl',
    cloze: 'Lückensatz',
  },
  hintLabel: {
    none: 'Hinweis',
    cloze: 'Satz',
    definition: 'Umschreibung',
    alternative: 'Auch',
    warning: 'Achtung',
    symbol: 'Zeichen',
  },
  correctTitle: 'Richtig. +10 Punkte',
  accentTitle: 'Richtiges Wort, achte auf die Zeichen',
  wrongTitle: 'Diesmal nicht',
  accentNote: (answer) => `Man schreibt ${answer}.`,
  expected: (answer) => `Erwartete Antwort: ${answer}.`,
  alsoAccepted: (answers) => `Auch akzeptiert: ${answers}.`,
  yourAnswer: (value) => `Du hast geschrieben: ${value}`,
  resultHeading: (score, total) => `Richtig: ${score} von ${total}`,
  resultLead: 'Jeder Versuch zählt. Wiederhol die Stufe oder wechsle die Route.',
  newRecord: 'Neuer Rekord',
  statPoints: 'Punkte',
  statCorrect: 'Richtig',
  statBest: 'Rekord',
  again: 'Nochmal',
  reviewTitle: 'Wörter dieser Runde',
});

export const dictionaries: Record<UiLanguage, Dictionary> = {
  '1': en,
  '2': fr,
  '3': es,
  '4': it,
  '5': de,
};

export function translator(native: NativeLanguageId) {
  return dictionaries[uiLanguage(native)];
}

/** Language name written in the reader's own language. */
export function languageName(id: LanguageId, reader: UiLanguage) {
  return localNames[reader][id];
}

const localNames: Record<UiLanguage, Record<LanguageId, string>> = {
  '1': { '1': 'English', '2': 'French', '3': 'Spanish', '4': 'Italian', '5': 'German' },
  '2': { '1': 'anglais', '2': 'français', '3': 'espagnol', '4': 'italien', '5': 'allemand' },
  '3': { '1': 'inglés', '2': 'francés', '3': 'español', '4': 'italiano', '5': 'alemán' },
  '4': { '1': 'inglese', '2': 'francese', '3': 'spagnolo', '4': 'italiano', '5': 'tedesco' },
  '5': { '1': 'Englisch', '2': 'Französisch', '3': 'Spanisch', '4': 'Italienisch', '5': 'Deutsch' },
};

/** Characters a learner may need that an English keyboard does not offer. */
export const accentKeys: Record<LanguageId, string[]> = {
  '1': [],
  '2': ['à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'œ'],
  '3': ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'],
  '4': ['à', 'è', 'é', 'ì', 'í', 'ò', 'ó', 'ù'],
  '5': ['ä', 'ö', 'ü', 'ß'],
};
