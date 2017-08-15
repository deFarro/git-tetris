var background = window.getComputedStyle(document.body).backgroundColor;
var filling = 'black';
var core, pattern, interval, indexOfPat, direction = 0, active = [], score, speed, mobile = false;

// Array with patterns for drawing figures in all positions
var figures = [
  [[-10, -9, 1], [-10, 10, 20], [-10, -1, 1], [-1, 10, 11], [-9, -1, 1], [1, 9, 10], [-11, -1, 1]],
  [[-10, -9, 1], [-1, 1, 2], [-10, 1, 10], [-10, -1, 9], [-10, 10, 11], [-11, -1, 10], [-10, -9, 10]],
  [[-10, -9, 1], [-10, 10, 20], [-1, 1, 10], [-11, -10, 1], [-1, 1, 9], [-10, -9, -1], [-1, 1, 11]],
  [[-10, -9, 1], [-1, 1, 2], [-10, -1, 10], [-9, 1, 10], [-11, -10, 10], [-10,  1,  11], [-10, 9, 10]]
];

var cells = Array.from(document.querySelectorAll('#field td'));
var startButton = document.querySelector('#start');
var scoreLine = document.querySelector('#scoreLine');
var scoreBoard = document.querySelector('#score');
var speedBoard = document.querySelector('#speed');
var field = document.querySelector('#field');
var result = document.querySelector('#result');
var manual = document.querySelector('#controls');

startButton.addEventListener('click', startGame);
document.addEventListener('keydown', moveCore);

// If app is opened on mobile device control buttons are being displayed
if (screen.width < 1000) {
  mobile = true;
  manual.classList.add('hidden');
  document.querySelector('#keyboard').classList.remove('hidden');
}
document.querySelector('#leftkey').addEventListener('click', moveLeft);
document.querySelector('#rightkey').addEventListener('click', moveRight);
document.querySelector('#speedkey').addEventListener('click', speedUp);
document.querySelector('#turnkey').addEventListener('click', turnFigure);

function rand(x) {
  return Math.round(Math.random() * x);
}

// Start game function. Nullifies score, hides controls manual
function startGame() {
  manual.classList.add('hidden');
  startButton.classList.toggle('hidden');
  result.classList.toggle('hidden');
  field.classList.toggle('hidden');
  score = 0;
  speed = 1;
  scoreBoard.innerHTML = score;
  speedBoard.innerHTML = speed;
  scoreLine.classList.toggle('hidden');
  generateFigure();
}

// Finish game function. Hides game field, displays score
function gameOver() {
  scoreLine.classList.toggle('hidden');
  field.classList.toggle('hidden');
  for (let cell of cells) {
    cell.style.backgroundColor = background;
  }
  result.innerHTML = `Game is over! Your score is ${score} points.`;
  result.classList.toggle('hidden');
  startButton.innerHTML = 'Try again';
  startButton.classList.toggle('hidden');
}

// Function to generate random figure and calculating start point
function generateFigure() {
  interval = 1100 - speed * 100;
  indexOfPat = rand(6);
  if (indexOfPat >= 5) {
    core = 5;
  }
  else {
    core = 4;
  }
  pattern = figures[direction][indexOfPat];
  dropFigure(pattern);
}

// Function to draw a figure. Getting starting point to draw a figure from it using proper pattern. Marks as active the cells occupied by a figure
function displayFigure(index) {
  cells[index].style.backgroundColor = filling;
  cells[index].classList.add('active');
  for (let cell of pattern) {
    cells[index + cell].style.backgroundColor = filling;
    cells[index + cell].classList.add('active');
  }
  active = Array.from(document.querySelectorAll('.active'));
}

// Function to delete a figure from the field
function clearFigure(index) {
  cells[index].style.backgroundColor = background;
  cells[index].classList.remove('active');
  for (let cell of pattern) {
    cells[index + cell].style.backgroundColor = background;
    cells[index + cell].classList.remove('active');
  }
}

// Function to drop a figure constantly
function dropFigure(pattern) {
  // Check if the are filled cells under the figure or the bottom of the field is reached
  if (checkSpace()) {
    // If there is a filled cell and the figure is on the start position, the game is over
    if (core < 30) {
      core = null;
      pattern = null;
      gameOver();
      return;
    }
    // If the figure touches a filled cell, function nullifies all active marks, checks is there are any lines completed and generates next figure
    displayFigure(core);
    core = null;
    cells.forEach(cell => {cell.classList.remove('active')});
    active = null;
    checkLines();
    generateFigure();
    return;
  }
  // If there is free space under a figure, the core being moved and the figure is being redrawn after pause depending on current speed level. Then function calls itself
  core += 10;
  displayFigure(core);
  let step = new Promise((done, fail) => {
    setTimeout(() => {
      clearFigure(core);
      done(pattern);
    }, interval);
  });
  step.then((pattern) => {
    dropFigure(pattern);
  });
  return;
}

// Function to check space under the active figure
function checkSpace() {
  if (active) {
    for (let cell of active) {
      let index = cells.indexOf(cell);
      if (!cells[index + 10]) {
        return true;
      }
      if (cells[index + 10].style.backgroundColor === filling && !cells[index + 10].classList.contains('active')) {
        return true;
      }
    }
  }
  return false;
}

// Function to check completed lines
function checkLines() {
  for (let i = 0; i < cells.length; i += 10) {
    let lineReady = cells.slice(i, i + 10)
    .map(cell => {return cell.style.backgroundColor})
    .every(cell => {return cell === filling});
    if (lineReady) {
      deleteRow(i);
      updateScore();
    }
  }
}

// Function to remove completed lines from DOM and generating new ones on the top
function deleteRow(index) {
  cells[index].parentNode.remove();
  let newRows = document.createElement('tr');
  newRows.innerHTML = '<td class = "left"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class = "right"></td>';
  field.insertBefore(newRows, field.firstChild);
  cells = Array.from(document.querySelectorAll('#field td'));
}

// Function to update game score and speed (maximum speed level is 10 - 0,1 sec per tick
function updateScore() {
  score += 100;
  scoreBoard.innerHTML = score;
  if (score % 500 === 0 && (1100 - speed * 100) > 100) {
    interval -= 100;
    speed++;
    speedBoard.innerHTML = speed;
  }
}

// Function to track keyboard controls
function moveCore(ev) {
  switch(ev.keyCode) {
    case 37:
    moveLeft();
    break;
    case 39:
    moveRight();
    break;
    case 38:
    turnFigure(ev);
    break;
    case 40:
    speedUp(ev);
    break;
  }
}

// Function to rotate a figure (switching to the next pattern)
function turnFigure(ev) {
  ev.preventDefault();
  if ((direction + 1) < 4) {
    if (checkTurn(1)) {
      return;
    }
    clearFigure(core);
    direction++;
    pattern = figures[direction][indexOfPat];
    displayFigure(core);
  }
  else {
    // When a figure is rotated 3 times, it goes back to the first pattern
    if (checkTurn(-3)) {
      return;
    }
    clearFigure(core);
    direction = 0;
    pattern = figures[direction][indexOfPat];
    displayFigure(core);
  }
}

// Function to check if rotating is possible (no field borders or filled cells on the way)
function checkTurn(step) {
  let pattern = figures[direction + step][indexOfPat];
  for (let dot of pattern) {
    if (cells[core + dot - 1].classList.contains('right') && (core % 10) > 5) {
      return true;
    }
    if (cells[core + dot + 1].classList.contains('left') && (core % 10) < 5) {
      return true;
    }
    if (!cells[core + dot]) {
      return true;
    }
    if (cells[core + dot].style.backgroundColor === filling && !cells[core + dot].classList.contains('active')) {
      return true;
    }
  }
}

// Function to move a figure left
function moveLeft() {
  for (let cell of active) {
    if (cell.classList.contains('left')) {
      return;
    }
    else if (cells[cells.indexOf(cell) - 1].style.backgroundColor === filling && !cells[cells.indexOf(cell) - 1].classList.contains('active')) {
      return;
    }
  }
  clearFigure(core);
  core -= 1;
  displayFigure(core);
}

// Function to move a figure right
function moveRight() {
  for (let cell of active) {
    if (cell.classList.contains('right')) {
      return;
    }
    else if (cells[cells.indexOf(cell) + 1].style.backgroundColor === filling && !cells[cells.indexOf(cell) + 1].classList.contains('active')) {
      return;
    }
  }
  clearFigure(core);
  core += 1;
  displayFigure(core);
}

// Function to speed up figure falling
function speedUp(ev) {
  ev.preventDefault();
  // On a mobile device player can only drop a figure, not to speed up
  if (mobile) {
    interval = 25;
    return;
  }
  if (ev.shiftKey) {
    interval = 25;
    return;
  }
  for (let cell of active) {
    if (!cells[cells.indexOf(cell) + 10]) {
      return;
    }
    else if (cells[cells.indexOf(cell) + 10].style.backgroundColor === filling && !cells[cells.indexOf(cell) + 10].classList.contains('active')) {
      return;
    }
  }
  clearFigure(core);
  core += 10;
  displayFigure(core);
}
