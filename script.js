const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwzUTxmaiQW_Lt7IO1bSvqdWhk9PBGxyxMqEOwsLqWB0mCCiV0vF2u4d0ZP85IXnsmW/exec";

const bodyParts = [
  "rightLeg",
  "leftLeg",
  "rightArm",
  "leftArm",
  "bodyPart",
  "head"
];

const hintText = document.getElementById("hintText");
const hintNumber = document.getElementById("hintNumber");
const prevHintBtn = document.getElementById("prevHintBtn");
const nextHintBtn = document.getElementById("nextHintBtn");
const hintArea = document.getElementById("hintArea");
const optionsToggle = document.getElementById("optionsToggle");
const categorySelect = document.getElementById("categorySelect");

const wordDisplay = document.getElementById("wordDisplay");
const wrongCount = document.getElementById("wrongCount");
const maxWrong = document.getElementById("maxWrong");
const message = document.getElementById("message");
const funFactText = document.getElementById("funFactText");
const keyboard = document.getElementById("keyboard");
const resetBtn = document.getElementById("resetBtn");

let words = [];
let selectedWord = "";
let selectedHints = [];
let selectedFunFact = "";
let currentHintIndex = 0;
let selectedCategory = "";
let selectedDifficulty = "";
let chosenCategory = "All";

let guessedLetters = [];
let wrongGuesses = 0;
let maxWrongGuesses = 6;
let gameOver = false;

maxWrong.textContent = maxWrongGuesses;

async function loadWordsFromSheet() {
  try {
    hintText.textContent = "Loading words from Google Sheets...";
    message.textContent = "";

    const response = await fetch(SHEET_API_URL);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Google Sheet failed to load.");
    }

    words = data.words
      .map(item => ({
        word: String(item.word || "").trim(),
        category: String(item.category || "General").trim(),
        difficulty: String(item.difficulty || "Easy").trim(),
        hint1: String(item.hint1 || "").trim(),
        hint2: String(item.hint2 || "").trim(),
        hint3: String(item.hint3 || "").trim(),
        hint4: String(item.hint4 || "").trim(),
        funFact: String(item.funFact || item.funfact || "").trim()
      }))
      .filter(item => item.word !== "");

    if (words.length === 0) {
      throw new Error("No words found in Google Sheet.");
    }

    setupCategorySelect();
    startGame();
  } catch (error) {
    console.error(error);
    hintText.textContent = "Could not load words from Google Sheets.";
    message.textContent = error.message || "Please check your Google Apps Script URL.";
    message.classList.add("lose");
  }
}

function setupCategorySelect() {
  const categories = [
    ...new Set(
      words
        .map(item => item.category)
        .filter(category => category && category.trim() !== "")
    )
  ].sort();

  categorySelect.innerHTML = `<option value="All">All Categories</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function getRandomWord() {
  const filteredWords =
    chosenCategory === "All"
      ? words
      : words.filter(item => item.category === chosenCategory);

  const availableWords = filteredWords.length > 0 ? filteredWords : words;

  return availableWords[Math.floor(Math.random() * availableWords.length)];
}

function getHintsFromItem(item) {
  const hints = [
    item.hint1,
    item.hint2,
    item.hint3,
    item.hint4
  ]
    .filter(hint => typeof hint === "string" && hint.trim() !== "")
    .map(hint => hint.trim());

  return hints.length > 0 ? hints : ["No hint available."];
}

function startGame() {
  if (words.length === 0) return;

  const randomItem = getRandomWord();

  selectedWord = randomItem.word.toLowerCase().replace(/[^a-z\s]/g, "");
  selectedHints = getHintsFromItem(randomItem);
  selectedFunFact = randomItem.funFact || "";
  currentHintIndex = 0;

  selectedCategory = randomItem.category || "General";
  selectedDifficulty = randomItem.difficulty || "Easy";

  guessedLetters = [];
  wrongGuesses = 0;
  gameOver = false;

  updateHintDisplay();
  updateGameInfo();

  wrongCount.textContent = wrongGuesses;
  message.textContent = "";
  message.className = "message";

  if (funFactText) {
    funFactText.textContent = "";
    funFactText.classList.remove("show");
  }

  resetBodyParts();
  createKeyboard();
  updateWordDisplay();
}

function updateHintDisplay() {
  hintText.textContent = selectedHints[currentHintIndex];
  hintNumber.textContent = `${currentHintIndex + 1} / ${selectedHints.length}`;

  prevHintBtn.disabled = currentHintIndex === 0;
  nextHintBtn.disabled = currentHintIndex === selectedHints.length - 1;
}

function showFunFact() {
  if (!funFactText) return;

  if (selectedFunFact) {
    funFactText.textContent = `Fun Fact: ${selectedFunFact}`;
  } else {
    funFactText.textContent = "Fun Fact: No fun fact available for this word yet.";
  }

  funFactText.classList.add("show");
}

function resetBodyParts() {
  bodyParts.forEach(partId => {
    const part = document.getElementById(partId);

    if (part) {
      part.classList.remove("fall-away");
      part.style.opacity = "1";
    }
  });
}

function createKeyboard() {
  keyboard.innerHTML = "";

  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  alphabet.split("").forEach(letter => {
    const button = document.createElement("button");
    button.textContent = letter;
    button.classList.add("key-btn");

    button.addEventListener("click", () => handleGuess(letter, button));

    keyboard.appendChild(button);
  });
}

function updateWordDisplay() {
  wordDisplay.innerHTML = "";

  const wordGroups = selectedWord.split(" ");

  wordGroups.forEach(word => {
    const wordGroup = document.createElement("div");
    wordGroup.classList.add("word-group");

    word.split("").forEach(letter => {
      const letterBox = document.createElement("div");
      letterBox.classList.add("letter-box");

      if (guessedLetters.includes(letter)) {
        letterBox.textContent = letter.toUpperCase();
      }

      wordGroup.appendChild(letterBox);
    });

    wordDisplay.appendChild(wordGroup);
  });
}

function handleGuess(letter, button) {
  if (gameOver) return;

  button.disabled = true;
  guessedLetters.push(letter);

  if (selectedWord.includes(letter)) {
    button.classList.add("correct");
    updateWordDisplay();
    checkWin();
  } else {
    button.classList.add("wrong");
    wrongGuesses++;
    wrongCount.textContent = wrongGuesses;
    removeBodyPart();
    checkLose();
  }
}

function removeBodyPart() {
  const partId = bodyParts[wrongGuesses - 1];
  const part = document.getElementById(partId);

  if (part) {
    part.classList.add("fall-away");
  }
}

function checkWin() {
  const completed = selectedWord
    .split("")
    .every(letter => letter === " " || guessedLetters.includes(letter));

  if (completed) {
    message.textContent = "You won!";
    message.classList.add("win");
    gameOver = true;
    disableKeyboard();
    showFunFact();
  }
}

function checkLose() {
  if (wrongGuesses >= maxWrongGuesses) {
    message.textContent = `You lost! The word was "${selectedWord}".`;
    message.classList.add("lose");
    gameOver = true;
    disableKeyboard();
    revealWord();
    showFunFact();
  }
}

function revealWord() {
  wordDisplay.innerHTML = "";

  const wordGroups = selectedWord.split(" ");

  wordGroups.forEach(word => {
    const wordGroup = document.createElement("div");
    wordGroup.classList.add("word-group");

    word.split("").forEach(letter => {
      const letterBox = document.createElement("div");
      letterBox.classList.add("letter-box");
      letterBox.textContent = letter.toUpperCase();
      wordGroup.appendChild(letterBox);
    });

    wordDisplay.appendChild(wordGroup);
  });
}

function disableKeyboard() {
  const buttons = document.querySelectorAll(".key-btn");

  buttons.forEach(button => {
    button.disabled = true;
  });
}

function updateGameInfo() {
  document.getElementById("categoryText").textContent = selectedCategory;
  document.getElementById("difficultyText").textContent = selectedDifficulty;

  const wordGroups = selectedWord.trim().split(/\s+/);
  const count = wordGroups.length;
  const lengths = wordGroups.map(word => word.length).join(", ");

  document.getElementById("wordInfoText").textContent = `${count} (${lengths})`;
}

prevHintBtn.addEventListener("click", () => {
  if (currentHintIndex > 0) {
    currentHintIndex--;
    updateHintDisplay();
  }
});

nextHintBtn.addEventListener("click", () => {
  if (currentHintIndex < selectedHints.length - 1) {
    currentHintIndex++;
    updateHintDisplay();
  }
});

categorySelect.addEventListener("change", () => {
  chosenCategory = categorySelect.value;
  startGame();
});

document.addEventListener("keydown", event => {
  if (gameOver) return;

  const letter = event.key.toLowerCase();

  if (!/^[a-z]$/.test(letter)) return;
  if (guessedLetters.includes(letter)) return;

  const button = [...document.querySelectorAll(".key-btn")]
    .find(btn => btn.textContent === letter);

  if (button) {
    handleGuess(letter, button);
  }
});

resetBtn.addEventListener("click", startGame);

function updateOptionsToggleText() {
  if (!hintArea || !optionsToggle) return;

  const isHidden = hintArea.classList.contains("is-hidden");

  optionsToggle.textContent = isHidden
    ? "Show Hints & Category"
    : "Hide Hints & Category";
}

function setupHintCategoryToggle() {
  if (!hintArea || !optionsToggle) return;

  if (window.innerWidth <= 700) {
    hintArea.classList.add("is-hidden");
  }

  updateOptionsToggleText();

  optionsToggle.addEventListener("click", () => {
    hintArea.classList.toggle("is-hidden");
    updateOptionsToggleText();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) {
      hintArea.classList.remove("is-hidden");
    }

    updateOptionsToggleText();
  });
}

setupHintCategoryToggle();
loadWordsFromSheet();