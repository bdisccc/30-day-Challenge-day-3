const bodyParts = [
  "rightLeg",
  "leftLeg",
  "rightArm",
  "leftArm",
  "bodyPart",
  "head"
];

const hintText = document.getElementById("hintText");
const wordDisplay = document.getElementById("wordDisplay");
const wrongCount = document.getElementById("wrongCount");
const maxWrong = document.getElementById("maxWrong");
const message = document.getElementById("message");
const keyboard = document.getElementById("keyboard");
const resetBtn = document.getElementById("resetBtn");

let selectedWord = "";
let selectedHint = "";
let selectedCategory = "";
let selectedDifficulty = "";
let guessedLetters = [];
let wrongGuesses = 0;
let maxWrongGuesses = 6;
let gameOver = false;

maxWrong.textContent = maxWrongGuesses;

function getRandomWord() {
  const allWords = typeof words !== "undefined" ? words : [
    { word: "magic", hint: "Mysterious supernatural power." }
  ];

  return allWords[Math.floor(Math.random() * allWords.length)];
}

function startGame() {
  const randomItem = getRandomWord();

  selectedWord = randomItem.word.toLowerCase().replace(/[^a-z\s]/g, "");
  selectedHint = randomItem.hint;
  selectedCategory = randomItem.category;
  selectedDifficulty = randomItem.difficulty;
  guessedLetters = [];
  wrongGuesses = 0;
  gameOver = false;

  hintText.textContent = selectedHint;
  updateGameInfo();
  wrongCount.textContent = wrongGuesses;
  message.textContent = "";
  message.className = "message";

  resetBodyParts();
  createKeyboard();
  updateWordDisplay();
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

  const words = selectedWord.split(" ");

  words.forEach(word => {

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
  }
}

function checkLose() {
  if (wrongGuesses >= maxWrongGuesses) {
    message.textContent = `You lost! The word was "${selectedWord}".`;
    message.classList.add("lose");
    gameOver = true;
    disableKeyboard();
    revealWord();
  }
}

function revealWord() {
  wordDisplay.innerHTML = "";

  selectedWord.split("").forEach(letter => {
    const letterBox = document.createElement("div");
    letterBox.classList.add("letter-box");
    letterBox.textContent = letter;
    wordDisplay.appendChild(letterBox);
  });
}

function disableKeyboard() {
  const buttons = document.querySelectorAll(".key-btn");

  buttons.forEach(button => {
    button.disabled = true;
  });
}

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

startGame();

function updateGameInfo() {

  document.getElementById("categoryText").textContent = selectedCategory;

  document.getElementById("difficultyText").textContent = selectedDifficulty;

  const words = selectedWord.trim().split(/\s+/);

  const count = words.length;

  const lengths = words.map(word => word.length).join(", ");

  document.getElementById("wordInfoText").textContent =
      `${count} (${lengths})`;

}