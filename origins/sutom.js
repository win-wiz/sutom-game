const params = new URLSearchParams(window.location.search);
const word = atob(params.get('word') || 'Y2Fjb3Bob25pZQ==');

const lettersCount = {};
let lettersFound = {};

let checking = false;
const checkDelay = 270;

const container = document.getElementById('container');

const handleKeyboard = async (event) => {
  if (checking) {
    return;
  }

  if (event.key === 'Enter') {
    checking = true;
    await checkWord();
    checking = false;
    return;
  }

  if (event.key === 'Backspace') {
    removeLetter();
    return;
  }

  if (event.which >= 65 && event.which <= 90) {
    addLetter(event.key);
  }
}

const handleVirtualKeyboard = async (event) => {
  if (checking) {
    return;
  }
  
  const letter = event.target.dataset.letter;
  if (letter === 'enter') {
    checking = true;
    await checkWord();
    checking = false;
    return;
  }

  if (letter === 'backspace') {
    removeLetter();
    return;
  }

  addLetter(letter);
}

const checkWord = async() => {
  const cells = Array.from(document.querySelectorAll('.current .cell'));
  // Don't check if missing a letter
  if (cells.map((cell) => cell.innerHTML).join('').includes('.')) {
    return;
  }

  const nextLetters = [];
  for (let i = 0; i < cells.length; i++) {
    await sleep(checkDelay);
    nextLetters.push(checkLetter(cells[i], i));
  }

  if (nextLetters.join('') === word) {
    const audioWin = new Audio('sound/win.mp3');
    audioWin.play();

    // Clean listeners and remove virtual keyboard
    document.removeEventListener('keydown', handleKeyboard);
    document.removeEventListener('click', handleVirtualKeyboard);
    document.querySelector('.keyboard').remove();
    return;
  }

  // Reset letters found for next turn
  lettersFound = {};

  addLine(nextLetters);
}

const checkLetter = (cell, index) => {
  const letter = word.charAt(index);
  const cellLetter = cell.innerHTML;
  const keyboardLetter = document.querySelector(`[data-letter="${cellLetter}"]`);

  if (lettersFound[cellLetter]) {
    lettersFound[cellLetter]++;
  } else {
    lettersFound[cellLetter] = 1;
  }

  if (cellLetter === letter) {
    cell.classList.add('found');
    keyboardLetter.classList.remove(...['wrong', 'not-found', 'found']);
    keyboardLetter.classList.add('found');

    const audioFound = new Audio('sound/found.wav');
    audioFound.play();

    return letter;
  }


  if (
    word.includes(cellLetter) &&
    lettersFound[cellLetter] <= lettersCount[cellLetter]
  ) {
    cell.classList.add('wrong');

    if (
      !keyboardLetter.classList.contains('wrong') &&
      !keyboardLetter.classList.contains('not-found') &&
      !keyboardLetter.classList.contains('found')
    ) {
      keyboardLetter.classList.add('wrong');
    }

    const audioWrong = new Audio('sound/wrong.wav');
    audioWrong.play();

    return '.';
  }

  cell.classList.add('not-found');

  if (
    !keyboardLetter.classList.contains('not-found') &&
    !keyboardLetter.classList.contains('found')
  ) {
    keyboardLetter.classList.add('not-found');
  }

  const audioNotFound = new Audio('sound/not-found.wav');
  audioNotFound.play();

  return '.';
}

const addLine = (letters) => {
  const current = document.querySelector('.current');
  if (current) {
    current.classList.remove('current');
  }

  let line = '<div class="line current">';
  letters.forEach(letter => {
    line += `<span class="cell">${letter}</span>`
  });
  line += '</div>';

  container.insertAdjacentHTML('beforeend', line);
}

const addLetter = (letter) => {
  const cells = document.querySelectorAll('.current .cell');
  const cell = Array.from(cells).find((cell) => cell.innerHTML === '.');
  if (!cell) {
    return;
  }

  cell.innerHTML = letter;
}

const removeLetter = () => {
  let index = 0;
  const cells = document.querySelectorAll('.current .cell');
  const cell = Array.from(cells).slice().reverse().find((cell, i) => {
    index = i;
    return cell.innerHTML !== '.'
  });

  if (!cell || index === word.length-1) {
    return;
  }

  cell.innerHTML = '.';
}

const sleep = (delay) => {
  return new Promise((resolve) => setTimeout(() => resolve(), delay));
}

const init = () => {
  document.addEventListener('keydown', handleKeyboard);
  // Manage virtual keyboard
  const elements = document.getElementsByClassName('keyboard-letter');
  Array.from(elements).forEach(function(element) {
    element.addEventListener('click', handleVirtualKeyboard);
  });

  let i = 0;
  const l = word.length;
  const initWord = [];
  for (i; i < l; i++) {
    const letter = word.charAt(i);

    if (lettersCount[letter]) {
      lettersCount[letter]++;
    } else {
      lettersCount[letter] = 1;
    }

    if (i === 0) {
      initWord.push(letter);
      continue;
    }

    initWord.push('.');
  }

  addLine(initWord);
}

init();
