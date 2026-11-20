const TRAITS = [
  { id: "adaptable", en: "Adaptable", zh: "適應性強", column: 1 },
  { id: "affectionate", en: "Affectionate", zh: "情深", column: 2 },
  { id: "aggressive", en: "Aggressive", zh: "好鬥", column: 3 },
  { id: "conceited", en: "Conceited", zh: "自負", column: 1 },
  { id: "compassionate", en: "Compassionate", zh: "有同情心", column: 2 },
  { id: "assertive", en: "Assertive", zh: "果敢的", column: 3 },
  { id: "conscientious", en: "Conscientious", zh: "嚴肅認真", column: 1 },
  {
    id: "eager-to-soothe",
    en: "Eager to soothe hurt feelings",
    zh: "渴望安撫受傷的感覺",
    column: 2,
  },
  {
    id: "defends-beliefs",
    en: "Defends own beliefs",
    zh: "捍衛自己的信念",
    column: 3,
  },
  { id: "conventional", en: "Conventional", zh: "循規蹈矩", column: 1 },
  { id: "gentle", en: "Gentle", zh: "溫和", column: 2 },
  { id: "dominant", en: "Dominant", zh: "主導", column: 3 },
  { id: "jealous", en: "Jealous", zh: "妒嫉", column: 1 },
  { id: "loves-children", en: "Loves children", zh: "愛小孩", column: 2 },
  { id: "forceful", en: "Forceful", zh: "強悍富說服力", column: 3 },
  { id: "moody", en: "Moody", zh: "情緒化", column: 1 },
  {
    id: "sensitive-needs",
    en: "Sensitive to the needs of others",
    zh: "在意別人需要",
    column: 2,
  },
  {
    id: "leadership",
    en: "Has leadership abilities",
    zh: "領袖才能",
    column: 3,
  },
  { id: "reliable", en: "Reliable", zh: "可靠穩當", column: 1 },
  { id: "sympathetic", en: "Sympathetic", zh: "能引起他人共鳴", column: 2 },
  { id: "independent", en: "Independent", zh: "獨立", column: 3 },
  { id: "secretive", en: "Secretive", zh: "收藏", column: 1 },
  { id: "tender", en: "Tender", zh: "溫柔慈愛", column: 2 },
  {
    id: "strong-personality",
    en: "Strong Personality",
    zh: "頑強個性",
    column: 3,
  },
  { id: "tactful", en: "Tactful", zh: "圓滑", column: 1 },
  { id: "understanding", en: "Understanding", zh: "明白事理", column: 2 },
  {
    id: "take-a-stand",
    en: "Willing to take a stand",
    zh: "願意站出來",
    column: 3,
  },
  { id: "truthful", en: "Truthful", zh: "講真話", column: 1 },
  { id: "warm", en: "Warm", zh: "親切溫暖", column: 2 },
  {
    id: "take-risk",
    en: "Willing to take risk",
    zh: "願意冒險",
    column: 3,
  },
];

const questionsEl = document.getElementById("questions");
const formEl = document.getElementById("traits-form");
const answeredCountEl = document.getElementById("answered-count");
const progressPctEl = document.getElementById("progress-pct");
const progressFillEl = document.getElementById("progress-fill");
const progressBarEl = document.querySelector(".progress-bar");
const col2TotalEl = document.getElementById("col2-total");
const col3TotalEl = document.getElementById("col3-total");
const finalScoreEl = document.getElementById("final-score");
const axisMarkerEl = document.getElementById("axis-marker");
const axisCaptionEl = document.getElementById("axis-caption");
const toastEl = document.getElementById("toast");
const resetBtn = document.getElementById("reset-btn");

function renderQuestions() {
  const fragment = document.createDocumentFragment();

  TRAITS.forEach((trait, index) => {
    const card = document.createElement("section");
    card.className = "question-card";
    card.style.animationDelay = `${Math.min(index * 0.02, 0.3)}s`;
    card.dataset.traitId = trait.id;

    const choices = Array.from({ length: 7 }, (_, i) => {
      const value = i + 1;
      return `
        <label>
          <input type="radio" name="${trait.id}" value="${value}" required />
          <span class="choice">${value}</span>
        </label>
      `;
    }).join("");

    card.innerHTML = `
      <div class="question-top">
        <span class="q-num">${String(index + 1).padStart(2, "0")}</span>
        <h3 class="q-title">
          <span class="en">${trait.en}</span>
          <span class="zh">${trait.zh}</span>
        </h3>
      </div>
      <div class="likert" role="radiogroup" aria-label="${trait.en} ${trait.zh}">
        ${choices}
      </div>
      <div class="likert-legend" aria-hidden="true">
        <span>1 從不</span>
        <span>7 絕對</span>
      </div>
    `;

    fragment.appendChild(card);
  });

  questionsEl.appendChild(fragment);
}

function getAnswers() {
  const answers = new Map();
  TRAITS.forEach((trait) => {
    const selected = formEl.querySelector(`input[name="${trait.id}"]:checked`);
    if (selected) {
      answers.set(trait.id, Number(selected.value));
    }
  });
  return answers;
}

function updateProgress(answers) {
  const count = answers.size;
  const pct = Math.round((count / TRAITS.length) * 100);
  answeredCountEl.textContent = String(count);
  progressPctEl.textContent = `${pct}%`;
  progressFillEl.style.width = `${pct}%`;
  progressBarEl.setAttribute("aria-valuenow", String(count));

  TRAITS.forEach((trait) => {
    const card = questionsEl.querySelector(`[data-trait-id="${trait.id}"]`);
    if (card) {
      card.classList.toggle("is-answered", answers.has(trait.id));
    }
  });
}

function updateScores(answers) {
  let col2 = 0;
  let col3 = 0;
  let col2Answered = 0;
  let col3Answered = 0;

  TRAITS.forEach((trait) => {
    if (!answers.has(trait.id)) return;
    const value = answers.get(trait.id);
    if (trait.column === 2) {
      col2 += value;
      col2Answered += 1;
    }
    if (trait.column === 3) {
      col3 += value;
      col3Answered += 1;
    }
  });

  const complete = answers.size === TRAITS.length;
  const col2Ready = col2Answered === 10;
  const col3Ready = col3Answered === 10;

  col2TotalEl.textContent = col2Ready ? String(col2) : answers.size ? String(col2) : "—";
  col3TotalEl.textContent = col3Ready ? String(col3) : answers.size ? String(col3) : "—";

  if (col2Ready && col3Ready) {
    const result = col2 - col3;
    finalScoreEl.textContent = result > 0 ? `+${result}` : String(result);

    const clamped = Math.max(-70, Math.min(70, result));
    const percent = ((clamped + 70) / 140) * 100;
    axisMarkerEl.style.left = `${percent}%`;
    axisMarkerEl.classList.add("is-active");

    if (complete) {
      axisCaptionEl.textContent = `你的結果分數為 ${result > 0 ? "+" : ""}${result}，已標示在量表上`;
    } else {
      axisCaptionEl.textContent = `目前分數為 ${result > 0 ? "+" : ""}${result}（尚有未作答題目）`;
    }
  } else {
    finalScoreEl.textContent = "—";
    axisMarkerEl.style.left = "50%";
    axisMarkerEl.classList.remove("is-active");
    axisCaptionEl.textContent = "完成第二欄與第三欄相關題目後會顯示結果位置";
  }
}

function refresh() {
  const answers = getAnswers();
  updateProgress(answers);
  updateScores(answers);
}

function showToast(message) {
  toastEl.hidden = false;
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, 2600);
}

function scrollToResults() {
  document.querySelector(".results-card")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

formEl.addEventListener("change", refresh);

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const answers = getAnswers();

  if (answers.size < TRAITS.length) {
    const firstUnanswered = TRAITS.find((trait) => !answers.has(trait.id));
    const card = questionsEl.querySelector(
      `[data-trait-id="${firstUnanswered.id}"]`
    );
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast(`尚有 ${TRAITS.length - answers.size} 題未作答`);
    return;
  }

  refresh();
  scrollToResults();
  showToast("已完成計分，請查看結果");
});

resetBtn.addEventListener("click", () => {
  formEl.reset();
  refresh();
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("答案已重設");
});

renderQuestions();
refresh();
