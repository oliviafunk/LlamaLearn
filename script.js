const generateBtn = document.getElementById("generateBtn");
const saveBtn = document.getElementById("saveBtn");
const shuffleQuestionsBtn = document.getElementById("shuffleQuestionsBtn");
const regenerateQuestionsBtn = document.getElementById("regenerateQuestionsBtn");

const notesInput = document.getElementById("notesInput");
const notesFileInput = document.getElementById("notesFileInput");
const editNotesBtn = document.getElementById("editNotesBtn");
const notesInputBody = document.getElementById("notesInputBody");
const studySetTitle = document.getElementById("studySetTitle");
const savedSetsLibrary = document.getElementById("savedSetsLibrary");
const dashboardProgressLabel = document.getElementById("dashboardProgressLabel");
const dashboardProgressBar = document.getElementById("dashboardProgressBar");
const dashboardEncouragement = document.getElementById("dashboardEncouragement");
const dashboardRecentSets = document.getElementById("dashboardRecentSets");

const resultsSection = document.getElementById("resultsSection");
const termsList = document.getElementById("termsList");
const flashcardsContainer = document.getElementById("flashcardsContainer");
const mcqContainer = document.getElementById("mcqContainer");
const shortAnswerContainer = document.getElementById("shortAnswerContainer");
const shortAnswerScore = document.getElementById("shortAnswerScore");
const totalAttemptsStat = document.getElementById("totalAttemptsStat");
const latestScoreStat = document.getElementById("latestScoreStat");
const averageScoreStat = document.getElementById("averageScoreStat");
const bestScoreStat = document.getElementById("bestScoreStat");
const latestByTypeStat = document.getElementById("latestByTypeStat");
const retrySessionsStat = document.getElementById("retrySessionsStat");
const recentActivityList = document.getElementById("recentActivityList");
const clearProgressBtn = document.getElementById("clearProgressBtn");
const progressStudySetFilter = document.getElementById("progressStudySetFilter");
const navLinks = document.querySelectorAll(".nav-link");
const dashboardSections = document.querySelectorAll(".dashboard-section");
const sectionTriggers = document.querySelectorAll("[data-section-trigger]");
const resultTabs = document.querySelectorAll(".result-tab");
const resultPanels = document.querySelectorAll(".result-panel");

generateBtn.addEventListener("click", generateStudySet);
saveBtn.addEventListener("click", saveStudySet);
shuffleQuestionsBtn.addEventListener("click", shuffleQuestions);
regenerateQuestionsBtn.addEventListener("click", regenerateQuestions);
notesFileInput.addEventListener("change", uploadNotesFile);
editNotesBtn.addEventListener("click", toggleNotesInput);
clearProgressBtn.addEventListener("click", clearProgress);
progressStudySetFilter.addEventListener("change", renderProgressPage);

setupDashboardNavigation();
setupResultTabs();
setupCollapsibles();
renderSavedSetsList();
renderProgressFilter();
renderProgressPage();
renderDashboardSummary();

function uploadNotesFile() {
  const file = notesFileInput.files[0];

  if (!file) {
    return;
  }

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    extractPdfText(file);
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    notesInput.value = reader.result;
  });

  reader.readAsText(file);
}

function extractPdfText(file) {
  const reader = new FileReader();

  reader.addEventListener("load", async () => {
    const typedArray = new Uint8Array(reader.result);
    const pdf = await pdfjsLib.getDocument(typedArray).promise;
    const pageTexts = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      pageTexts.push(pageText);
    }

    notesInput.value = cleanPDFText(pageTexts.join("\n\n"));
  });

  reader.readAsArrayBuffer(file);
}

function cleanPDFText(text) {
  const lines = text
    .replace(/:\s*\n\s*/g, ": ")
    .replace(/\band:\s*/gi, "and ")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let cleanedText = "";

  lines.forEach((line, index) => {
    const nextLine = lines[index + 1] || "";
    const shouldMerge = !line.endsWith(".") && /^[a-z]/.test(nextLine);

    cleanedText += line;
    cleanedText += shouldMerge ? " " : "\n";
  });

  return cleanedText.replace(/[ \t]+/g, " ").trim();
}

function setupDashboardNavigation() {
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      showDashboardSection(link.dataset.section);
    });
  });

  sectionTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      showDashboardSection(trigger.dataset.sectionTrigger);
    });
  });
}

function showDashboardSection(sectionId) {
  navLinks.forEach(navLink => {
    navLink.classList.remove("active");
  });

  dashboardSections.forEach(section => {
    section.classList.remove("active-section");
  });

  document.querySelector(`[data-section="${sectionId}"]`).classList.add("active");
  document.getElementById(sectionId).classList.add("active-section");
}

function setupResultTabs() {
  resultTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      showResultPanel(tab.dataset.resultPanel);
    });
  });
}

function showResultPanel(panelId) {
  resultTabs.forEach(tab => {
    tab.classList.remove("active");
  });

  resultPanels.forEach(panel => {
    panel.classList.remove("active-result");
  });

  document.querySelector(`[data-result-panel="${panelId}"]`).classList.add("active");
  document.getElementById(panelId).classList.add("active-result");
}

function toggleNotesInput() {
  notesInputBody.classList.toggle("collapsed");
  editNotesBtn.textContent = notesInputBody.classList.contains("collapsed") ? "Edit Notes" : "Collapse Input";
}

function collapseNotesInput() {
  notesInputBody.classList.add("collapsed");
  editNotesBtn.textContent = "Edit Notes";
}

function expandNotesInput() {
  notesInputBody.classList.remove("collapsed");
  editNotesBtn.textContent = "Collapse Input";
}

function setupCollapsibles() {
  const toggleButtons = document.querySelectorAll(".collapse-toggle");

  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".collapsible-card");
      const content = card.querySelector(".collapse-content");

      if (card.classList.contains("open")) {
        card.classList.remove("open");
        content.style.display = "none";
      } else {
        card.classList.add("open");
        content.style.display = "block";
      }
    });
  });
}

function openAllSections() {
  document.querySelectorAll(".collapsible-card").forEach(card => {
    const content = card.querySelector(".collapse-content");
    card.classList.add("open");
    content.style.display = "block";
  });
}

function generateStudySet() {
  const notes = notesInput.value.trim();

  if (!notes) {
    alert("Please paste your notes first.");
    return;
  }

  const studyItems = parseNotes(notes);

  if (studyItems.length === 0) {
    alert("Try adding notes in a clearer format, like 'Term: Definition'.");
    return;
  }

  renderStudySet(studyItems);
}

function parseNotes(notes) {
  const lines = notes
    .split("\n")
    .flatMap(line => line.split(/[.;]+/))
    .map(line => line.replace(/^[-*•]\s*/, "").replace(/\s+/g, " ").trim())
    .filter(line => line.length > 0);

  return extractStudyItems(lines);
}

function extractStudyItems(lines) {
  const items = [];

  lines.forEach(line => {
    if (line.includes(":")) {
      const parts = line.split(":");
      const term = parts[0].trim();
      const definition = parts.slice(1).join(":").trim();

      if (term && definition) {
        items.push({ term, definition });
      }
    } else if (line.includes("=")) {
      const parts = line.split("=");
      const term = parts[0].trim();
      const definition = parts.slice(1).join("=").trim();

      if (term && definition) {
        items.push({ term, definition });
      }
    } else if (line.includes(" is ")) {
      const parts = line.split(" is ");
      const term = parts[0].trim();
      const definition = "is " + parts.slice(1).join(" is ").trim();

      if (term && definition) {
        items.push({ term, definition });
      }
    } else if (line.includes(" are ")) {
      const parts = line.split(" are ");
      const term = parts[0].trim();
      const definition = "are " + parts.slice(1).join(" are ").trim();

      if (term && definition) {
        items.push({ term, definition });
      }
    } else {
      const fragmentMatch = line.match(/^(.+?)\s+(like|such as|including)\s+(.+)$/i);
      const sentenceMatch = line.match(/^(.+?)\s+(means|refers to|comes from|describes|includes|involves|uses|helps|creates|causes|allows|contains|represents|converts|stores|moves|makes|provides|prevents|controls|affects|requires|tracks|records|measures|allocates|spreads|matches|reduces|increases|decreases|lowers|raises|matters|earns|owes|owns|pays)\s+(.+)$/i);
      const words = line.split(" ");
      const looseMatch = words.length >= 4 && words.length <= 14 ? line.match(/^([A-Za-z][A-Za-z]*(?:\s+[A-Za-z][A-Za-z]*){0,2})\s+(.+)$/) : null;

      if (fragmentMatch) {
        const term = fragmentMatch[1].trim();
        const definition = fragmentMatch.slice(2).join(" ").trim();

        if (term && definition) {
          items.push({ term, definition });
        }
      } else if (sentenceMatch) {
        const term = sentenceMatch[1].trim();
        const definition = sentenceMatch.slice(2).join(" ").trim();

        if (term && definition) {
          items.push({ term, definition });
        }
      } else if (looseMatch) {
        const term = looseMatch[1].trim();
        const definition = looseMatch[2].trim();

        if (term && definition) {
          items.push({ term, definition });
        }
      }
    }
  });

  return items.slice(0, 12);
}

function renderStudySet(items) {
  displayTerms(items);
  displayFlashcards(items);
  displayMCQs(items);
  displayShortAnswers(items);

  resultsSection.classList.remove("hidden");
  showDashboardSection("createSection");
  showResultPanel("termsPanel");
  collapseNotesInput();
  openAllSections();
}

function displayTerms(items) {
  termsList.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "term-item";
    div.innerHTML = `<strong>${item.term}</strong>: ${item.definition}`;
    termsList.appendChild(div);
  });
}

function displayFlashcards(items) {
  flashcardsContainer.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "flashcard";
    card.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front">${item.term}</div>
        <div class="flashcard-back">${item.definition}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });

    flashcardsContainer.appendChild(card);
  });
}

function getProgressRecords() {
  const savedProgress = localStorage.getItem("llamaLearnProgress");
  return savedProgress ? JSON.parse(savedProgress) : [];
}

function saveProgressRecords(records) {
  localStorage.setItem("llamaLearnProgress", JSON.stringify(records));
}

function addProgressRecord(type, correct, total, percentage, isRetry) {
  const records = getProgressRecords();
  const currentStudySetTitle = studySetTitle.value.trim();

  records.unshift({
    type,
    correct,
    total,
    percentage,
    isRetry,
    studySetTitle: currentStudySetTitle,
    date: new Date().toLocaleString()
  });

  saveProgressRecords(records);
  renderProgressPage();
  renderDashboardSummary();
}

function renderProgressFilter() {
  const selectedTitle = progressStudySetFilter.value;
  const savedSets = getSavedSets();

  progressStudySetFilter.innerHTML = `<option value="all">All Study Sets</option>`;

  savedSets.forEach(set => {
    const option = document.createElement("option");
    option.value = set.title;
    option.textContent = set.title;
    progressStudySetFilter.appendChild(option);
  });

  const stillExists = savedSets.some(set => set.title === selectedTitle);
  progressStudySetFilter.value = selectedTitle === "all" || stillExists ? selectedTitle : "all";
}

function renderProgressPage() {
  const selectedStudySetTitle = progressStudySetFilter.value;
  const allRecords = getProgressRecords();
  const records = selectedStudySetTitle === "all"
    ? allRecords
    : allRecords.filter(record => record.studySetTitle === selectedStudySetTitle);
  const totalAttempts = records.length;
  const emptyMessage = selectedStudySetTitle === "all"
    ? "No quiz attempts yet."
    : "No progress yet for this study set.";

  totalAttemptsStat.textContent = totalAttempts;

  if (totalAttempts === 0) {
    latestScoreStat.textContent = "No attempts yet";
    averageScoreStat.textContent = "0%";
    bestScoreStat.textContent = "0%";
    latestByTypeStat.textContent = "Latest MCQ: none yet | Latest Short Answer: none yet";
    retrySessionsStat.textContent = "Retry sessions completed: 0";
    recentActivityList.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }

  const latest = records[0];
  const totalPercentage = records.reduce((sum, record) => sum + record.percentage, 0);
  const averagePercentage = Math.round(totalPercentage / totalAttempts);
  const bestRecord = records.reduce((best, record) => {
    return record.percentage > best.percentage ? record : best;
  }, records[0]);
  const latestMCQ = records.find(record => record.type === "Multiple Choice");
  const latestShortAnswer = records.find(record => record.type === "Short Answer");
  const retrySessions = records.filter(record => record.isRetry).length;

  latestScoreStat.textContent = `${latest.correct} / ${latest.total} (${latest.percentage}%)`;
  averageScoreStat.textContent = `${averagePercentage}%`;
  bestScoreStat.textContent = `${bestRecord.correct} / ${bestRecord.total} (${bestRecord.percentage}%)`;
  latestByTypeStat.textContent = `Latest MCQ: ${formatProgressScore(latestMCQ)} | Latest Short Answer: ${formatProgressScore(latestShortAnswer)}`;
  retrySessionsStat.textContent = `Retry sessions completed: ${retrySessions}`;

  recentActivityList.innerHTML = "";
  records.slice(0, 8).forEach(record => {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
      <div>
        <strong>${record.type}${record.isRetry ? " Retry" : ""}</strong>
        <p>${record.studySetTitle || "No study set title"} - ${record.date}</p>
      </div>
      <span>${record.correct}/${record.total} (${record.percentage}%)</span>
    `;
    recentActivityList.appendChild(item);
  });
}

function formatProgressScore(record) {
  if (!record) {
    return "none yet";
  }

  return `${record.correct}/${record.total} (${record.percentage}%)`;
}

function renderDashboardSummary() {
  const progressRecords = getProgressRecords();
  const savedSets = getSavedSets();
  const latestProgress = progressRecords[0];
  const latestPercentage = latestProgress ? latestProgress.percentage : 0;

  dashboardProgressLabel.textContent = `${latestPercentage}%`;
  dashboardProgressBar.style.width = `${latestPercentage}%`;
  dashboardEncouragement.textContent = latestProgress
    ? `Latest: ${latestProgress.type} - ${latestProgress.correct}/${latestProgress.total}. You’re crushing it 🦙`
    : "Save a set and complete a quiz to start your streak.";

  dashboardRecentSets.innerHTML = "";

  if (savedSets.length === 0) {
    dashboardRecentSets.innerHTML = `<p class="empty-state">No saved study sets yet.</p>`;
    return;
  }

  savedSets.slice(0, 3).forEach(set => {
    const card = document.createElement("button");
    card.className = "recent-set-card";
    card.type = "button";
    card.innerHTML = `
      <span class="card-accent">🦙</span>
      <strong>${set.title}</strong>
      <small>Saved ${set.savedAt}</small>
    `;

    card.addEventListener("click", () => {
      loadStudySet(set.title);
    });

    dashboardRecentSets.appendChild(card);
  });
}

function clearProgress() {
  if (!confirm("Clear all saved progress history?")) {
    return;
  }

  localStorage.removeItem("llamaLearnProgress");
  renderProgressPage();
  renderDashboardSummary();
}

function displayMCQs(items) {
  mcqContainer.innerHTML = "";
  const totalQuestions = items.length;
  let submitted = false;
  let activeQuestionCount = totalQuestions;
  let isRetrySession = false;

  const scoreDisplay = document.createElement("p");
  scoreDisplay.className = "score-display";
  scoreDisplay.textContent = "Score: Not submitted yet";
  mcqContainer.appendChild(scoreDisplay);

  items.forEach((item, index) => {
    const wrongAnswers = getWrongAnswers(items, item.definition, 3);
    const options = shuffleArray([item.definition, ...wrongAnswers]);

    const questionCard = document.createElement("div");
    questionCard.className = "question-card";
    questionCard.dataset.correctAnswer = item.definition;

    questionCard.innerHTML = `
      <p><strong>Question ${index + 1}:</strong> What is the correct definition of <strong>${item.term}</strong>?</p>
      <div class="mcq-options"></div>
      <div class="mcq-feedback"></div>
    `;

    const optionsContainer = questionCard.querySelector(".mcq-options");

    options.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option;

      btn.addEventListener("click", () => {
        if (submitted) {
          return;
        }

        const allButtons = optionsContainer.querySelectorAll("button");
        allButtons.forEach(button => {
          button.classList.remove("selected");
        });
        btn.classList.add("selected");
      });

      optionsContainer.appendChild(btn);
    });

    mcqContainer.appendChild(questionCard);
  });

  const submitButton = document.createElement("button");
  submitButton.className = "submit-mcq-btn";
  submitButton.type = "button";
  submitButton.textContent = "Submit Multiple Choice";

  const retryButton = document.createElement("button");
  retryButton.className = "retry-mcq-btn secondary-btn hidden";
  retryButton.type = "button";
  retryButton.textContent = "Retry Incorrect Only";

  const resetButton = document.createElement("button");
  resetButton.className = "reset-mcq-btn secondary-btn";
  resetButton.type = "button";
  resetButton.textContent = "Reset Multiple Choice";

  submitButton.addEventListener("click", () => {
    if (submitted) {
      return;
    }

    submitted = true;
    let correctCount = 0;
    const incorrectCards = [];
    const questionCards = mcqContainer.querySelectorAll(".question-card:not(.hidden)");

    questionCards.forEach(card => {
      const feedback = card.querySelector(".mcq-feedback");
      const selectedButton = card.querySelector(".mcq-options button.selected");
      const correctButton = Array.from(card.querySelectorAll(".mcq-options button"))
        .find(button => button.textContent === card.dataset.correctAnswer);
      const isCorrect = selectedButton && selectedButton.textContent === card.dataset.correctAnswer;

      feedback.textContent = "";
      feedback.classList.remove("correct", "incorrect");
      card.classList.remove("correct", "incorrect");

      card.querySelectorAll(".mcq-options button").forEach(button => {
        button.disabled = true;
        button.classList.remove("correct", "incorrect");
      });

      if (correctButton) {
        correctButton.classList.add("correct");
      }

      if (isCorrect) {
        correctCount++;
        feedback.textContent = "Correct!";
        feedback.classList.add("correct");
        card.classList.add("correct");
      } else {
        incorrectCards.push(card);
        if (selectedButton) {
          selectedButton.classList.add("incorrect");
        }
        feedback.textContent = `Not quite. Correct answer: ${card.dataset.correctAnswer}`;
        feedback.classList.add("incorrect");
        card.classList.add("incorrect");
      }
    });

    const percentage = Math.round((correctCount / activeQuestionCount) * 100);
    scoreDisplay.textContent = `Score: ${correctCount} / ${activeQuestionCount} (${percentage}%)`;
    addProgressRecord("Multiple Choice", correctCount, activeQuestionCount, percentage, isRetrySession);
    submitButton.disabled = true;
    submitButton.textContent = "Multiple Choice Submitted";

    if (incorrectCards.length > 0) {
      retryButton.classList.remove("hidden");
    } else {
      retryButton.classList.add("hidden");
      scoreDisplay.textContent += " - Great job!";
    }
  });

  retryButton.addEventListener("click", () => {
    submitted = false;
    const incorrectCards = mcqContainer.querySelectorAll(".question-card.incorrect");
    activeQuestionCount = incorrectCards.length;
    isRetrySession = true;
    scoreDisplay.textContent = "Score: Not submitted yet";
    submitButton.disabled = false;
    submitButton.textContent = "Submit Multiple Choice";
    retryButton.classList.add("hidden");

    mcqContainer.querySelectorAll(".question-card").forEach(card => {
      const feedback = card.querySelector(".mcq-feedback");
      const shouldRetry = card.classList.contains("incorrect");

      card.classList.toggle("hidden", !shouldRetry);

      if (shouldRetry) {
        feedback.textContent = "";
        feedback.classList.remove("correct", "incorrect");
        card.classList.remove("correct", "incorrect");

        card.querySelectorAll(".mcq-options button").forEach(button => {
          button.disabled = false;
          button.classList.remove("selected", "correct", "incorrect");
        });
      }
    });
  });

  resetButton.addEventListener("click", () => {
    submitted = false;
    activeQuestionCount = totalQuestions;
    isRetrySession = false;
    scoreDisplay.textContent = "Score: Not submitted yet";
    submitButton.disabled = false;
    submitButton.textContent = "Submit Multiple Choice";
    retryButton.classList.add("hidden");

    mcqContainer.querySelectorAll(".question-card").forEach(card => {
      const feedback = card.querySelector(".mcq-feedback");

      card.classList.remove("hidden", "correct", "incorrect");
      feedback.textContent = "";
      feedback.classList.remove("correct", "incorrect");

      card.querySelectorAll(".mcq-options button").forEach(button => {
        button.disabled = false;
        button.classList.remove("selected", "correct", "incorrect");
      });
    });
  });

  const mcqActions = document.createElement("div");
  mcqActions.className = "mcq-actions";
  mcqActions.appendChild(submitButton);
  mcqActions.appendChild(retryButton);
  mcqActions.appendChild(resetButton);
  mcqContainer.appendChild(mcqActions);
}

function displayShortAnswers(items) {
  shortAnswerContainer.innerHTML = "";
  const totalQuestions = items.length;
  let submitted = false;
  let retryQuestionCount = totalQuestions;
  let isRetrySession = false;
  shortAnswerScore.textContent = "Score: Not submitted yet";

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "short-answer-card";
    card.dataset.correctAnswer = `${item.term} ${item.definition}`;

    card.innerHTML = `
      <p><strong>Question ${index + 1}:</strong> In your own words, explain <strong>${item.term}</strong>.</p>
      <input class="short-answer-input" type="text" placeholder="Type your answer here..." />
      <div class="answer-feedback"></div>
    `;

    shortAnswerContainer.appendChild(card);
  });

  const submitButton = document.createElement("button");
  submitButton.className = "submit-answers-btn";
  submitButton.type = "button";
  submitButton.textContent = "Submit Answers";

  const resetButton = document.createElement("button");
  resetButton.className = "reset-answers-btn secondary-btn";
  resetButton.type = "button";
  resetButton.textContent = "Reset Answers";

  const retryButton = document.createElement("button");
  retryButton.className = "retry-incorrect-btn secondary-btn hidden";
  retryButton.type = "button";
  retryButton.textContent = "Retry Incorrect Only";

  submitButton.addEventListener("click", () => {
    if (submitted) {
      return;
    }

    submitted = true;
    let correctCount = 0;
    const incorrectCards = [];
    const answerCards = shortAnswerContainer.querySelectorAll(".short-answer-card:not(.hidden)");

    answerCards.forEach(card => {
      const input = card.querySelector(".short-answer-input");
      const feedback = card.querySelector(".answer-feedback");
      const userAnswer = input.value;
      const correctAnswer = card.dataset.correctAnswer;
      const isCorrect = isShortAnswerCorrect(userAnswer, correctAnswer);

      feedback.classList.remove("correct", "incorrect");
      card.classList.remove("correct", "incorrect");

      if (isCorrect) {
        correctCount++;
        feedback.textContent = "Correct!";
        feedback.classList.add("correct");
        card.classList.add("correct");
      } else {
        incorrectCards.push(card);
        feedback.textContent = `Not quite. Correct answer: ${card.dataset.correctAnswer}`;
        feedback.classList.add("incorrect");
        card.classList.add("incorrect");
      }
    });

    const percentage = Math.round((correctCount / retryQuestionCount) * 100);
    shortAnswerScore.textContent = `Score: ${correctCount} / ${retryQuestionCount} (${percentage}%)`;
    addProgressRecord("Short Answer", correctCount, retryQuestionCount, percentage, isRetrySession);
    submitButton.disabled = true;
    submitButton.textContent = "Answers Submitted";

    if (incorrectCards.length > 0) {
      retryButton.classList.remove("hidden");
    } else {
      retryButton.classList.add("hidden");
    }
  });

  retryButton.addEventListener("click", () => {
    submitted = false;
    const incorrectCards = shortAnswerContainer.querySelectorAll(".short-answer-card.incorrect");
    retryQuestionCount = incorrectCards.length;
    isRetrySession = true;
    shortAnswerScore.textContent = "Score: Not submitted yet";
    submitButton.disabled = false;
    submitButton.textContent = "Submit Answers";
    retryButton.classList.add("hidden");

    shortAnswerContainer.querySelectorAll(".short-answer-card").forEach(card => {
      const input = card.querySelector(".short-answer-input");
      const feedback = card.querySelector(".answer-feedback");
      const shouldRetry = card.classList.contains("incorrect");

      card.classList.toggle("hidden", !shouldRetry);

      if (shouldRetry) {
        input.value = "";
        feedback.textContent = "";
        feedback.classList.remove("correct", "incorrect");
        card.classList.remove("correct", "incorrect");
      }
    });
  });

  resetButton.addEventListener("click", () => {
    submitted = false;
    retryQuestionCount = totalQuestions;
    isRetrySession = false;
    shortAnswerScore.textContent = "Score: Not submitted yet";
    submitButton.disabled = false;
    submitButton.textContent = "Submit Answers";
    retryButton.classList.add("hidden");

    shortAnswerContainer.querySelectorAll(".short-answer-card").forEach(card => {
      const input = card.querySelector(".short-answer-input");
      const feedback = card.querySelector(".answer-feedback");

      card.classList.remove("hidden");
      input.value = "";
      feedback.textContent = "";
      feedback.classList.remove("correct", "incorrect");
      card.classList.remove("correct", "incorrect");
    });
  });

  const shortAnswerActions = document.createElement("div");
  shortAnswerActions.className = "short-answer-actions";
  shortAnswerActions.appendChild(submitButton);
  shortAnswerActions.appendChild(retryButton);
  shortAnswerActions.appendChild(resetButton);
  shortAnswerContainer.appendChild(shortAnswerActions);
}

function normalizeAnswer(answer) {
  return answer
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isShortAnswerCorrect(userAnswer, correctAnswer) {
  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

  if (!normalizedUserAnswer) {
    return false;
  }

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return true;
  }

  const userNumbers = normalizedUserAnswer.match(/\d+(\.\d+)?/g) || [];
  const correctNumbers = normalizedCorrectAnswer.match(/\d+(\.\d+)?/g) || [];

  if (correctNumbers.length > 0 && userNumbers.length > 0) {
    const finalCorrectNumber = correctNumbers[correctNumbers.length - 1];
    return userNumbers.includes(finalCorrectNumber);
  }

  const commonWords = ["the", "and", "for", "that", "with", "this", "from", "are", "was", "were", "has", "have", "had", "into", "over", "under", "your", "you"];
  const userWords = new Set(normalizedUserAnswer.split(" "));
  const correctKeyWords = normalizedCorrectAnswer
    .split(" ")
    .filter(word => word.length > 2 && !commonWords.includes(word));

  if (correctKeyWords.length < 2) {
    return false;
  }

  const matchingWords = correctKeyWords.filter(word => userWords.has(word));
  const requiredMatches = Math.max(2, Math.ceil(Math.min(correctKeyWords.length, userWords.size) * 0.7));

  return matchingWords.length >= requiredMatches;
}

function getWrongAnswers(items, correctAnswer, count) {
  const pool = items
    .map(item => item.definition)
    .filter(def => def !== correctAnswer);

  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, count);
}

function shuffleArray(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function shuffleQuestions() {
  const questionCards = Array.from(mcqContainer.querySelectorAll(".question-card"));
  const shuffledCards = shuffleArray(questionCards);
  const mcqActions = mcqContainer.querySelector(".mcq-actions");

  shuffledCards.forEach(card => {
    mcqContainer.insertBefore(card, mcqActions);
  });
}

function regenerateQuestions() {
  const notes = notesInput.value.trim();

  if (!notes) {
    alert("Please paste your notes first.");
    return;
  }

  const studyItems = parseNotes(notes);

  if (studyItems.length === 0) {
    alert("Try adding notes in a clearer format, like 'Term: Definition'.");
    return;
  }

  displayMCQs(studyItems);
}

function getSavedSets() {
  const saved = localStorage.getItem("llamaLearnStudySets");
  return saved ? JSON.parse(saved) : [];
}

function saveSavedSets(sets) {
  localStorage.setItem("llamaLearnStudySets", JSON.stringify(sets));
}

function saveStudySet() {
  const title = studySetTitle.value.trim();
  const notes = notesInput.value.trim();

  if (!title) {
    alert("Please enter a study set title.");
    return;
  }

  if (!notes) {
    alert("Please paste notes before saving.");
    return;
  }

  const savedSets = getSavedSets();
  const existingIndex = savedSets.findIndex(set => set.title === title);

  const newSet = {
    title,
    notes,
    savedAt: new Date().toLocaleString()
  };

  if (existingIndex !== -1) {
    savedSets[existingIndex] = newSet;
  } else {
    savedSets.unshift(newSet);
  }

  saveSavedSets(savedSets);
  renderSavedSetsList();
  renderProgressFilter();
  renderProgressPage();
  renderDashboardSummary();

  alert("Study set saved!");
}

function renderSavedSetsList() {
  const savedSets = getSavedSets();
  savedSetsLibrary.innerHTML = "";

  if (savedSets.length === 0) {
    savedSetsLibrary.innerHTML = `<p class="empty-state">No saved study sets yet.</p>`;
    return;
  }

  savedSets.forEach(set => {
    addSavedSetCard(savedSetsLibrary, set);
  });
}

function addSavedSetCard(container, set) {
  const card = document.createElement("div");
  card.className = "saved-set-card";

  card.innerHTML = `
    <div class="saved-set-header">
      <h3 class="saved-set-title">${set.title}</h3>
      <p class="saved-set-date">Saved: ${set.savedAt}</p>
    </div>
    <div class="saved-set-actions">
      <button class="load-btn" type="button">Load</button>
      <button class="danger-btn delete-btn" type="button">Delete</button>
    </div>
  `;

  const loadBtn = card.querySelector(".load-btn");
  const deleteBtn = card.querySelector(".delete-btn");

  loadBtn.addEventListener("click", () => {
    loadStudySet(set.title);
  });

  deleteBtn.addEventListener("click", () => {
    deleteStudySet(set.title);
  });

  container.appendChild(card);
}

function loadStudySet(title) {
  const savedSets = getSavedSets();
  const selectedSet = savedSets.find(set => set.title === title);

  if (!selectedSet) {
    alert("That study set could not be found.");
    return;
  }

  studySetTitle.value = selectedSet.title;
  notesInput.value = selectedSet.notes;
  expandNotesInput();

  const studyItems = parseNotes(selectedSet.notes);

  if (studyItems.length > 0) {
    renderStudySet(studyItems);
    showDashboardSection("createSection");
  }
}

function deleteStudySet(title) {
  const savedSets = getSavedSets();
  const updatedSets = savedSets.filter(set => set.title !== title);

  saveSavedSets(updatedSets);
  renderSavedSetsList();
  renderProgressFilter();
  renderProgressPage();
  renderDashboardSummary();

  if (studySetTitle.value === title) {
    studySetTitle.value = "";
    notesInput.value = "";
    resultsSection.classList.add("hidden");
    expandNotesInput();
  }

  alert("Study set deleted.");
}
