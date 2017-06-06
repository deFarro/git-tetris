var background = window.getComputedStyle(document.body).backgroundColor;
var filling = 'black';
var core, pattern, interval, indexOfPat, direction = 0; active = [], score, speed;

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

startButton.addEventListener('click', startGame);
document.addEventListener('keydown', moveCore);

if (screen.width > 1000) {
  document.querySelector('#keyboard').classList.add('hidden');
}
document.querySelector('#leftkey').addEventListener('click', moveLeft);
document.querySelector('#rightkey').addEventListener('click', moveRight);
document.querySelector('#speedkey').addEventListener('click', speedUp);
document.querySelector('#turnkey').addEventListener('click', turnFigure);

function rand(x) {
  return Math.round(Math.random() * x);
}

function startGame() {
  document.querySelector('#controls').classList.add('hidden');
  startButton.classList.toggle('hidden');
  result.classList.toggle('hidden');
  field.classList.toggle('hidden');
  score = 0;
  speed = 1;
  interval = 1000;
  scoreBoard.innerHTML = score;
  speedBoard.innerHTML = speed;
  scoreLine.classList.toggle('hidden');
  generateFigure();
}

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

function generateFigure() {
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

function displayFigure(index) {
  cells[index].style.backgroundColor = filling;
  cells[index].classList.add('active');
  for (let cell of pattern) {
    cells[index + cell].style.backgroundColor = filling;
    cells[index + cell].classList.add('active');
  }
  active = Array.from(document.querySelectorAll('.active'));
}

function clearFigure(index) {
  cells[index].style.backgroundColor = background;
  cells[index].classList.remove('active');
  for (let cell of pattern) {
    cells[index + cell].style.backgroundColor = background;
    cells[index + cell].classList.remove('active');
  }
}

function dropFigure(pattern) {
  if (checkSpace()) {
    if (core < 30) {
      core = null;
      pattern = null;
      gameOver();
      return;
    }
    displayFigure(core);
    core = null;
    cells.forEach(cell => {cell.classList.remove('active')});
    active = null;
    checkLines();
    generateFigure();
    return;
  }
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
    if (checkTurn(-3)) {
      return;
    }
    clearFigure(core);
    direction = 0;
    pattern = figures[direction][indexOfPat];
    displayFigure(core);
  }
}


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

function deleteRow(index) {
  cells[index].parentNode.remove();
  let newRows = document.createElement('tr');
  newRows.innerHTML = '<td class = "left"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class = "right"></td>';
  field.insertBefore(newRows, field.firstChild);
  cells = Array.from(document.querySelectorAll('td'));
}

function updateScore() {
  score += 100;
  scoreBoard.innerHTML = score;
  if (score % 500 === 0 && interval > 100) {
    interval -= 100;
    speed++;
    speedBoard.innerHTML = speed;
  }
}

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

function speedUp(ev) {
  ev.preventDefault();
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
