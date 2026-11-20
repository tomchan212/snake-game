const COLUMN_1 = [
  { id: "adaptable", en: "Adaptable", zh: "適應性強" },
  { id: "conceited", en: "Conceited", zh: "自負" },
  { id: "conscientious", en: "Conscientious", zh: "嚴肅認真" },
  { id: "conventional", en: "Conventional", zh: "循規蹈矩" },
  { id: "jealous", en: "Jealous", zh: "妒嫉" },
  { id: "moody", en: "Moody", zh: "情緒化" },
  { id: "reliable", en: "Reliable", zh: "可靠穩當" },
  { id: "secretive", en: "Secretive", zh: "收藏" },
  { id: "tactful", en: "Tactful", zh: "圓滑" },
  { id: "truthful", en: "Truthful", zh: "講真話" },
];

const COLUMN_2 = [
  { id: "affectionate", en: "Affectionate", zh: "情深" },
  { id: "compassionate", en: "Compassionate", zh: "有同情心" },
  {
    id: "eager-to-soothe",
    en: "Eager to soothe hurt feelings",
    zh: "渴望安撫受傷的感覺",
  },
  { id: "gentle", en: "Gentle", zh: "溫和" },
  { id: "loves-children", en: "Loves children", zh: "愛小孩" },
  {
    id: "sensitive-needs",
    en: "Sensitive to the needs of others",
    zh: "在意別人需要",
  },
  { id: "sympathetic", en: "Sympathetic", zh: "能引起他人共鳴" },
  { id: "tender", en: "Tender", zh: "溫柔慈愛" },
  { id: "understanding", en: "Understanding", zh: "明白事理" },
  { id: "warm", en: "Warm", zh: "親切溫暖" },
];

const COLUMN_3 = [
  { id: "aggressive", en: "Aggressive", zh: "好鬥" },
  { id: "assertive", en: "Assertive", zh: "果敢的" },
  {
    id: "defends-beliefs",
    en: "Defends own beliefs",
    zh: "捍衛自己的信念",
  },
  { id: "dominant", en: "Dominant", zh: "主導" },
  { id: "forceful", en: "Forceful", zh: "強悍富說服力" },
  {
    id: "leadership",
    en: "Has leadership abilities",
    zh: "領袖才能",
  },
  { id: "independent", en: "Independent", zh: "獨立" },
  {
    id: "strong-personality",
    en: "Strong Personality",
    zh: "頑強個性",
  },
  {
    id: "take-a-stand",
    en: "Willing to take a stand",
    zh: "願意站出來",
  },
  {
    id: "take-risk",
    en: "Willing to take risk",
    zh: "願意冒險",
  },
];

const TRAITS = [
  ...COLUMN_1.map((trait) => ({ ...trait, column: 1 })),
  ...COLUMN_2.map((trait) => ({ ...trait, column: 2 })),
  ...COLUMN_3.map((trait) => ({ ...trait, column: 3 })),
];

const questionsEl = document.getElementById("questions");
const formEl = document.getElementById("traits-form");
const answeredCountEl = document.getElementById("answered-count");
const progressPctEl = document.getElementById("progress-pct");
const progressFillEl = document.getElementById("progress-fill");
const progressBarEl = document.querySelector(".progress-bar");
const col1TotalEl = document.getElementById("col1-total");
const col2TotalEl = document.getElementById("col2-total");
const col3TotalEl = document.getElementById("col3-total");
const finalScoreEl = document.getElementById("final-score");
const axisMarkerEl = document.getElementById("axis-marker");
const axisCaptionEl = document.getElementById("axis-caption");
const toastEl = document.getElementById("toast");
const resetBtn = document.getElementById("reset-btn");

function scoreOptions(traitId) {
  const options = Array.from({ length: 7 }, (_, i) => {
    const value = i + 1;
    return `<option value="${value}">${value}</option>`;
  }).join("");

  return `
    <select
      class="score-select"
      name="${traitId}"
      id="score-${traitId}"
      required
      aria-label="1 到 7 分"
    >
      <option value="" selected disabled>—</option>
      ${options}
    </select>
  `;
}

function traitCell(trait, column) {
  return `
    <div class="trait-cell" data-trait-id="${trait.id}" data-column="${column}">
      <span class="col-tag" aria-hidden="true">第${column}欄</span>
      <label class="trait-label" for="score-${trait.id}">
        <span class="en">${trait.en}</span>
        <span class="zh">${trait.zh}</span>
      </label>
      ${scoreOptions(trait.id)}
    </div>
  `;
}

function renderQuestions() {
  const rows = COLUMN_1.map((col1Trait, index) => {
    const col2Trait = COLUMN_2[index];
    const col3Trait = COLUMN_3[index];
    return `
      <div class="traits-row" style="animation-delay: ${Math.min(index * 0.03, 0.3)}s">
        ${traitCell(col1Trait, 1)}
        ${traitCell(col2Trait, 2)}
        ${traitCell(col3Trait, 3)}
      </div>
    `;
  }).join("");

  questionsEl.innerHTML = `
    <section class="traits-sheet" aria-label="三欄特質問卷">
      <div class="traits-head" aria-hidden="true">
        <div class="traits-head-cell">第一欄</div>
        <div class="traits-head-cell">第二欄</div>
        <div class="traits-head-cell">第三欄</div>
      </div>
      <div class="traits-body">
        ${rows}
      </div>
    </section>
  `;
}

function getAnswers() {
  const answers = new Map();
  TRAITS.forEach((trait) => {
    const field = formEl.querySelector(`select[name="${trait.id}"]`);
    if (field && field.value) {
      answers.set(trait.id, Number(field.value));
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
    const cell = questionsEl.querySelector(`[data-trait-id="${trait.id}"]`);
    if (cell) {
      cell.classList.toggle("is-answered", answers.has(trait.id));
    }
  });
}

function updateScores(answers) {
  let col1 = 0;
  let col2 = 0;
  let col3 = 0;
  let col1Answered = 0;
  let col2Answered = 0;
  let col3Answered = 0;

  TRAITS.forEach((trait) => {
    if (!answers.has(trait.id)) return;
    const value = answers.get(trait.id);
    if (trait.column === 1) {
      col1 += value;
      col1Answered += 1;
    }
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

  col1TotalEl.textContent = answers.size ? String(col1) : "—";
  col2TotalEl.textContent = answers.size ? String(col2) : "—";
  col3TotalEl.textContent = answers.size ? String(col3) : "—";

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
    axisCaptionEl.textContent =
      col1Answered || col2Answered || col3Answered
        ? "完成第二欄與第三欄後會顯示最終結果位置"
        : "完成全部題目後會顯示結果位置";
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
    const cell = questionsEl.querySelector(
      `[data-trait-id="${firstUnanswered.id}"]`
    );
    cell?.scrollIntoView({ behavior: "smooth", block: "center" });
    cell?.querySelector("select")?.focus();
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
