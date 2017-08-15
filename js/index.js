'use strict';

var background = window.getComputedStyle(document.body).backgroundColor;
var filling = 'black';
var core,
    pattern,
    interval,
    indexOfPat,
    direction = 0,
    active = [],
    score,
    speed,
    mobile = false;

// Array with patterns for drawing figures in all positions
var figures = [[[-10, -9, 1], [-10, 10, 20], [-10, -1, 1], [-1, 10, 11], [-9, -1, 1], [1, 9, 10], [-11, -1, 1]], [[-10, -9, 1], [-1, 1, 2], [-10, 1, 10], [-10, -1, 9], [-10, 10, 11], [-11, -1, 10], [-10, -9, 10]], [[-10, -9, 1], [-10, 10, 20], [-1, 1, 10], [-11, -10, 1], [-1, 1, 9], [-10, -9, -1], [-1, 1, 11]], [[-10, -9, 1], [-1, 1, 2], [-10, -1, 10], [-9, 1, 10], [-11, -10, 10], [-10, 1, 11], [-10, 9, 10]]];

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
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var cell = _step.value;

      cell.style.backgroundColor = background;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  result.innerHTML = 'Game is over! Your score is ' + score + ' points.';
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
  } else {
    core = 4;
  }
  pattern = figures[direction][indexOfPat];
  dropFigure(pattern);
}

// Function to draw a figure. Getting starting point to draw a figure from it using proper pattern. Marks as active the cells occupied by a figure
function displayFigure(index) {
  cells[index].style.backgroundColor = filling;
  cells[index].classList.add('active');
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = pattern[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var cell = _step2.value;

      cells[index + cell].style.backgroundColor = filling;
      cells[index + cell].classList.add('active');
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  active = Array.from(document.querySelectorAll('.active'));
}

// Function to delete a figure from the field
function clearFigure(index) {
  cells[index].style.backgroundColor = background;
  cells[index].classList.remove('active');
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = pattern[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var cell = _step3.value;

      cells[index + cell].style.backgroundColor = background;
      cells[index + cell].classList.remove('active');
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
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
    cells.forEach(function (cell) {
      cell.classList.remove('active');
    });
    active = null;
    checkLines();
    generateFigure();
    return;
  }
  // If there is free space under a figure, the core being moved and the figure is being redrawn after pause depending on current speed level. Then function calls itself
  core += 10;
  displayFigure(core);
  var step = new Promise(function (done, fail) {
    setTimeout(function () {
      clearFigure(core);
      done(pattern);
    }, interval);
  });
  step.then(function (pattern) {
    dropFigure(pattern);
  });
  return;
}

// Function to check space under the active figure
function checkSpace() {
  if (active) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = active[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var cell = _step4.value;

        var index = cells.indexOf(cell);
        if (!cells[index + 10]) {
          return true;
        }
        if (cells[index + 10].style.backgroundColor === filling && !cells[index + 10].classList.contains('active')) {
          return true;
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }
  return false;
}

// Function to check completed lines
function checkLines() {
  for (var i = 0; i < cells.length; i += 10) {
    var lineReady = cells.slice(i, i + 10).map(function (cell) {
      return cell.style.backgroundColor;
    }).every(function (cell) {
      return cell === filling;
    });
    if (lineReady) {
      deleteRow(i);
      updateScore();
    }
  }
}

// Function to remove completed lines from DOM and generating new ones on the top
function deleteRow(index) {
  cells[index].parentNode.remove();
  var newRows = document.createElement('tr');
  newRows.innerHTML = '<td class = "left"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class = "right"></td>';
  field.insertBefore(newRows, field.firstChild);
  cells = Array.from(document.querySelectorAll('#field td'));
}

// Function to update game score and speed (maximum speed level is 10 - 0,1 sec per tick
function updateScore() {
  score += 100;
  scoreBoard.innerHTML = score;
  if (score % 500 === 0 && 1100 - speed * 100 > 100) {
    interval -= 100;
    speed++;
    speedBoard.innerHTML = speed;
  }
}

// Function to track keyboard controls
function moveCore(ev) {
  switch (ev.keyCode) {
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
  if (direction + 1 < 4) {
    if (checkTurn(1)) {
      return;
    }
    clearFigure(core);
    direction++;
    pattern = figures[direction][indexOfPat];
    displayFigure(core);
  } else {
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
  var pattern = figures[direction + step][indexOfPat];
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = pattern[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var dot = _step5.value;

      if (cells[core + dot - 1].classList.contains('right') && core % 10 > 5) {
        return true;
      }
      if (cells[core + dot + 1].classList.contains('left') && core % 10 < 5) {
        return true;
      }
      if (!cells[core + dot]) {
        return true;
      }
      if (cells[core + dot].style.backgroundColor === filling && !cells[core + dot].classList.contains('active')) {
        return true;
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }
}

// Function to move a figure left
function moveLeft() {
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = active[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var cell = _step6.value;

      if (cell.classList.contains('left')) {
        return;
      } else if (cells[cells.indexOf(cell) - 1].style.backgroundColor === filling && !cells[cells.indexOf(cell) - 1].classList.contains('active')) {
        return;
      }
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  clearFigure(core);
  core -= 1;
  displayFigure(core);
}

// Function to move a figure right
function moveRight() {
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = active[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var cell = _step7.value;

      if (cell.classList.contains('right')) {
        return;
      } else if (cells[cells.indexOf(cell) + 1].style.backgroundColor === filling && !cells[cells.indexOf(cell) + 1].classList.contains('active')) {
        return;
      }
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
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
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = active[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var cell = _step8.value;

      if (!cells[cells.indexOf(cell) + 10]) {
        return;
      } else if (cells[cells.indexOf(cell) + 10].style.backgroundColor === filling && !cells[cells.indexOf(cell) + 10].classList.contains('active')) {
        return;
      }
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }

  clearFigure(core);
  core += 10;
  displayFigure(core);
}