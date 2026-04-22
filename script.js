const generateBtn = document.getElementById("generateBtn");
const saveBtn = document.getElementById("saveBtn");
const shuffleQuestionsBtn = document.getElementById("shuffleQuestionsBtn");

const notesInput = document.getElementById("notesInput");
const studySetTitle = document.getElementById("studySetTitle");
const savedSetsList = document.getElementById("savedSetsList");

const resultsSection = document.getElementById("resultsSection");
const termsList = document.getElementById("termsList");
const flashcardsContainer = document.getElementById("flashcardsContainer");
const mcqContainer = document.getElementById("mcqContainer");
const shortAnswerContainer = document.getElementById("shortAnswerContainer");

generateBtn.addEventListener("click", generateStudySet);
saveBtn.addEventListener("click", saveStudySet);
shuffleQuestionsBtn.addEventListener("click", shuffleQuestions);

setupCollapsibles();
renderSavedSetsList();

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
    .map(line => line.trim())
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
      <button class="reveal-btn" type="button">Reveal Sample Answer</button>
      <div class="answer-text" style="display: none;">${item.term} ${item.definition}</div>
    `;

    const button = card.querySelector(".reveal-btn");
    const answer = card.querySelector(".answer-text");

    button.addEventListener("click", () => {
      answer.style.display = "block";
      button.style.display = "none";
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

  if (savedSets.length === 0) {
    savedSetsList.innerHTML = `<p class="empty-state">No saved study sets yet.</p>`;
    return;
  }

  savedSets.forEach(set => {
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

    savedSetsList.appendChild(card);
  });
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

  const studyItems = parseNotes(selectedSet.notes);

  if (studyItems.length > 0) {
    renderStudySet(studyItems);
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
  }

  alert("Study set deleted.");
}
