const generateBtn = document.getElementById("generateBtn");
const saveBtn = document.getElementById("saveBtn");
const shuffleQuestionsBtn = document.getElementById("shuffleQuestionsBtn");
const regenerateQuestionsBtn = document.getElementById("regenerateQuestionsBtn");

const notesInput = document.getElementById("notesInput");
const notesFileInput = document.getElementById("notesFileInput");
const editNotesBtn = document.getElementById("editNotesBtn");
const notesInputBody = document.getElementById("notesInputBody");
const studySetTitle = document.getElementById("studySetTitle");
const savedSetsList = document.getElementById("savedSetsList");
const savedSetsLibrary = document.getElementById("savedSetsLibrary");

const resultsSection = document.getElementById("resultsSection");
const termsList = document.getElementById("termsList");
const flashcardsContainer = document.getElementById("flashcardsContainer");
const mcqContainer = document.getElementById("mcqContainer");
const shortAnswerContainer = document.getElementById("shortAnswerContainer");
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

setupDashboardNavigation();
setupResultTabs();
setupCollapsibles();
renderSavedSetsList();

function uploadNotesFile() {
  const file = notesFileInput.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    notesInput.value = reader.result;
  });

  reader.readAsText(file);
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

function displayMCQs(items) {
  mcqContainer.innerHTML = "";

  items.forEach((item, index) => {
    const wrongAnswers = getWrongAnswers(items, item.definition, 3);
    const options = shuffleArray([item.definition, ...wrongAnswers]);

    const questionCard = document.createElement("div");
    questionCard.className = "question-card";

    questionCard.innerHTML = `
      <p><strong>Question ${index + 1}:</strong> What is the correct definition of <strong>${item.term}</strong>?</p>
      <div class="mcq-options"></div>
    `;

    const optionsContainer = questionCard.querySelector(".mcq-options");

    options.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option;

      btn.addEventListener("click", () => {
        const allButtons = optionsContainer.querySelectorAll("button");
        allButtons.forEach(button => {
          button.disabled = true;
          if (button.textContent === item.definition) {
            button.classList.add("correct");
          } else if (button === btn && button.textContent !== item.definition) {
            button.classList.add("incorrect");
          }
        });
      });

      optionsContainer.appendChild(btn);
    });

    mcqContainer.appendChild(questionCard);
  });
}

function displayShortAnswers(items) {
  shortAnswerContainer.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "short-answer-card";

    card.innerHTML = `
      <p><strong>Question ${index + 1}:</strong> In your own words, explain <strong>${item.term}</strong>.</p>
      <input class="short-answer-input" type="text" placeholder="Type your answer here..." />
      <button class="check-answer-btn" type="button">Check Answer</button>
      <div class="answer-feedback"></div>
    `;

    const input = card.querySelector(".short-answer-input");
    const button = card.querySelector(".check-answer-btn");
    const feedback = card.querySelector(".answer-feedback");

    button.addEventListener("click", () => {
      const userAnswer = input.value.trim().toLowerCase();
      const correctAnswer = `${item.term} ${item.definition}`.trim().toLowerCase();
      const isCorrect = userAnswer && (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer));

      feedback.classList.remove("correct", "incorrect");

      if (isCorrect) {
        feedback.textContent = "Correct!";
        feedback.classList.add("correct");
      } else {
        feedback.textContent = `Not quite. Correct answer: ${item.term} ${item.definition}`;
        feedback.classList.add("incorrect");
      }
    });

    shortAnswerContainer.appendChild(card);
  });
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

  shuffledCards.forEach(card => {
    mcqContainer.appendChild(card);
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

  alert("Study set saved!");
}

function renderSavedSetsList() {
  const savedSets = getSavedSets();
  savedSetsList.innerHTML = "";
  savedSetsLibrary.innerHTML = "";

  if (savedSets.length === 0) {
    savedSetsList.innerHTML = `<p class="empty-state">No saved study sets yet.</p>`;
    savedSetsLibrary.innerHTML = `<p class="empty-state">No saved study sets yet.</p>`;
    return;
  }

  savedSets.forEach(set => {
    addSavedSetCard(savedSetsList, set);
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

  if (studySetTitle.value === title) {
    studySetTitle.value = "";
    notesInput.value = "";
    resultsSection.classList.add("hidden");
    expandNotesInput();
  }

  alert("Study set deleted.");
}
