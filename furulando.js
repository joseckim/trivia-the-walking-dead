/* Design note: Archivo de supervivencia — progreso secuencial y feedback claro de campo. */
const questions = [
  ["¿Cómo se llama el protagonista?", ["Glenn", "Rick", "Carl", "Daryl"], 1],
  ["¿Cómo se llama el mejor amigo de Rick?", ["Shane", "Daryl", "Glenn", "Carol"], 0],
  ["¿En qué temporada muere Shane?", ["Nunca muere", "Temporada 1", "Temporada 2", "Temporada 5"], 2],
  ["¿Cuántos hijos tiene Rick?", ["1", "3", "2", "5"], 1],
  ["¿De qué trabajaba Rick antes?", ["Policía", "Sheriff", "Bombero", "Cocinero"], 1],
  ["¿Cómo se llama la espada que usa Michonne?", ["Cimitarra", "Katana", "Machete", "Florete"], 1],
  ["¿Cómo apodó Negan a su bate de béisbol?", ["Maggie", "Rosita", "Lucille", "Sasha"], 2],
  ["¿Qué arma es característica de Daryl Dixon?", ["Ballesta", "Escopeta", "Arco recurvo", "Rifle de francotirador"], 0],
  ["¿Cómo llaman habitualmente a los zombis en la serie?", ["Zombis", "Caminantes", "Infectados", "Muertos"], 1],
  ["¿Dónde se desarrollan principalmente las temporadas 3 y 4?", ["La granja de Hershel", "La prisión", "Alexandria", "Terminus"], 1],
  ["¿Cómo se llama la comunidad del Gobernador?", ["Woodbury", "The Hilltop", "The Kingdom", "Oceanside"], 0],
  ["¿Quién le corta la pierna a Hershel?", ["Daryl", "Glenn", "Rick", "Carol"], 2],
  ["¿Qué llevaba siempre Carl en la cabeza?", ["Una pañoleta roja", "Casco de béisbol", "El sombrero de sheriff de Rick", "Una gorra militar"], 2],
  ["¿Cómo se llama el perro de Daryl Dixon?", ["Doggo", "Dog", "Buster", "Rex"], 1],
  ["¿Cuál es la frase emblemática de Negan al presentarse con su bate?", ["Knock knock", "Eeny, meeny, miny, moe", "Ready or not", "Time to play"], 1],
  ["¿En qué lugar despierta Rick Grimes del coma?", ["En su casa", "En un hospital", "En la comisaría", "En una ambulancia"], 1],
  ["¿Quién es el líder original en la granja de la temporada 2?", ["Dale", "Otis", "Hershel", "Rick"], 2],
  ["¿Cómo se llama la infección que todos llevan dentro?", ["Cepa T", "El virus activo en todos", "Gripe salvaje", "Infección Alpha"], 1],
  ["¿Qué personaje pierde un ojo tras un disparo accidental?", ["Glenn", "Carl", "El Gobernador", "Ron"], 1],
  ["¿Cuál es el verdadero nombre de Alpha?", ["Mary", "Laura", "Dee", "Samantha"], 2],
];

let questionIndex = 0;
let score = 0;
let wrongAttempts = 0;
let seconds = 30;
let timerId = null;
let selectedButton = null;
let status = null;

const $ = (selector) => document.querySelector(selector);
const screens = { intro: $("#intro"), quiz: $("#quiz"), results: $("#results") };
const answers = $("#answers");
const feedback = $("#feedback");

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle("is-hidden", key !== name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startQuiz() {
  questionIndex = 0;
  score = 0;
  wrongAttempts = 0;
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  clearInterval(timerId);
  seconds = 30;
  status = null;
  selectedButton = null;
  const [question, options] = questions[questionIndex];
  $("#question-title").textContent = question;
  $("#record-number").textContent = String(questionIndex + 1).padStart(2, "0");
  $("#progress-label").textContent = `${String(questionIndex + 1).padStart(2, "0")} / ${questions.length}`;
  $("#progress-fill").style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  feedback.className = "feedback is-hidden";
  feedback.textContent = "";
  answers.innerHTML = "";

  options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.innerHTML = `<span class="answer-key">${String.fromCharCode(65 + index)}</span><span class="answer-text">${option}</span>`;
    button.addEventListener("click", () => {
      if (status === "correct" || status === "timeout") return;
      selectedButton = button;
      responder(index === questions[questionIndex][2]);
    });
    answers.appendChild(button);
  });
  updateTimer();
  timerId = setInterval(() => {
    seconds -= 1;
    updateTimer();
    if (seconds <= 0) {
      clearInterval(timerId);
      status = "timeout";
      showFeedback("timeout", "◷ <b>Se agotó el tiempo.</b> Recupera la señal y vuelve a intentar.", true);
    }
  }, 1000);
}

function updateTimer() {
  const timer = $("#timer");
  timer.innerHTML = `◷ <b>${String(Math.max(seconds, 0)).padStart(2, "0")}</b>`;
  timer.classList.toggle("timer--urgent", seconds <= 10);
}

// Conserva la función y el parámetro solicitados por el usuario.
function responder(esCorrecto) {
  if (esCorrecto) {
    clearInterval(timerId);
    status = "correct";
    score += 1;
    selectedButton.classList.add("answer--correct");
    selectedButton.insertAdjacentHTML("beforeend", '<span class="answer-icon">✓</span>');
    answers.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    showFeedback("correct", "✓ <b>Correcto.</b> La señal se estabiliza.", false);
  } else {
    status = "wrong";
    wrongAttempts += 1;
    selectedButton.classList.add("answer--wrong");
    selectedButton.insertAdjacentHTML("beforeend", '<span class="answer-icon">×</span>');
    selectedButton.disabled = true;
    showFeedback("wrong", "⊗ <b>Incorrecto.</b> Intenta de nuevo.", false);
  }
}

function showFeedback(type, message, canRetry) {
  feedback.className = `feedback feedback--${type}`;
  feedback.innerHTML = `<span>${message}</span>`;
  if (type === "correct") {
    const next = document.createElement("button");
    next.className = "button button--primary";
    next.type = "button";
    next.textContent = questionIndex === questions.length - 1 ? "Ver resultado →" : "Siguiente →";
    next.addEventListener("click", nextQuestion);
    feedback.appendChild(next);
  }
  if (canRetry) {
    const retry = document.createElement("button");
    retry.className = "button button--primary";
    retry.type = "button";
    retry.textContent = "Reintentar ↻";
    retry.addEventListener("click", renderQuestion);
    feedback.appendChild(retry);
  }
}

function nextQuestion() {
  if (questionIndex === questions.length - 1) {
    showResults();
    return;
  }
  questionIndex += 1;
  renderQuestion();
}

function showResults() {
  clearInterval(timerId);
  const accuracy = Math.round((score / questions.length) * 100);
  $("#final-score").textContent = score;
  $("#correct-count").textContent = score;
  $("#wrong-count").textContent = wrongAttempts;
  $("#accuracy").textContent = `${accuracy}%`;
  $("#rank").textContent = score >= 17 ? "Vigilante" : score >= 10 ? "Rastreador" : "Recluta";
  $("#result-message").textContent = score >= 17 ? "La señal no se te escapa." : score >= 10 ? "Has mantenido el rumbo." : "La ruta necesita otra vuelta.";
  showScreen("results");
}

document.querySelectorAll('[data-action="start"]').forEach((button) => button.addEventListener("click", startQuiz));
document.querySelector('[data-action="home"]').addEventListener("click", () => { clearInterval(timerId); showScreen("intro"); });
window.responder = responder;
