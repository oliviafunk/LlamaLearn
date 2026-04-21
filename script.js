const generateBtn = document.getElementById("generateBtn");
const notesInput = document.getElementById("notesInput");
const resultsSection = document.getElementById("resultsSection");
const termsList = document.getElementById("termsList");
const flashcardsContainer = document.getElementById("flashcardsContainer");
const mcqContainer = document.getElementById("mcqContainer");
const shortAnswerContainer = document.getElementById("shortAnswerContainer");

generateBtn.addEventListener("click", generateStudySet);

document.querySelectorAll(".collapse-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const card = button.parentElement;
    card.classList.toggle("open");
  });
});

function openAllSections() {
  document.querySelectorAll(".collapsible-card").forEach(card => {
    card.classList.add("open");
  });
}

function generateStudySet() {
  const notes = notesInput.value.trim();

  if (!notes) {
    alert("Please paste your notes first.");
    return;
  }

  const lines = notes
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const studyItems = extractStudyItems(lines);

  if (studyItems.length === 0) {
    alert("Try adding notes in a clearer format, like 'Term: Definition'.");
    return;
  }

  displayTerms(studyItems);
  displayFlashcards(studyItems);
  displayMCQs(studyItems);
  displayShortAnswers(studyItems);

  resultsSection.classList.remove("hidden");
  openAllSections();
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
      <button class="reveal-btn">Reveal Sample Answer</button>
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