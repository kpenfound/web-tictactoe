var board_size = 9;
var row_size = 3;
var game_object;
var ai_player;
var users_turn;
var context;
var context_size;
var tie_count;

function game() {
  var gameObj = {};

  gameObj.board = [];
  gameObj.moves = [];
  gameObj.turns = [];
  gameObj.turn = 0;
  tie_count = 0;

  for(var i = 0; i < board_size; i++) {
    gameObj.board[i] = 0;
  }

  gameObj.reset = function() {
    for(var i = 0; i < board_size; i++) {
      this.board[i] = 0;
    }
    this.turn = 0;
  };

  gameObj.makeMove = function(space, team) {
    if(this.board[space] !== 0)
      return false;
    this.board[space] = team;
    this.turns[this.turn] = this.board;
    this.turn++;
    return true;
  };

  gameObj.hasWinner = function() {
    drawBoard();
    var b = this.board; // For brevity
    // Rows / Columns
    for(i = 0; i < row_size; i++) {
      if(Math.abs(b[(i * row_size)] + b[(i * row_size) + 1] + b[(i * row_size) + 2]) === 3)
        return b[(i * board_size)];
      if(Math.abs(b[i] + b[i + row_size] + b[i + row_size + row_size]) === 3)
        return b[i];
    }

    // Diagonal
    var mid = Math.floor(board_size/2);
    var cornerA = 0;
    var cornerB = row_size - 1;
    var cornerC = board_size - row_size;
    var cornerD = board_size - 1;
    if(this.board[mid] !== 0) {
      if(Math.abs(b[mid] + b[cornerA] + b[cornerD]) === 3
      || Math.abs(b[mid] + b[cornerB] + b[cornerC]) === 3)
        return b[mid];
    }

    // Tie
    if(this.turn === board_size)
      return -2;

    return 0;
  };

  return gameObj;
}

function aiPlayer() {
  player = {};
  player.nn = neuralNetwork();

  player.pickMove = function(game) {
    var move = Math.floor(Math.random() * board_size);
    this.nn.update(game.board);
    var outs = this.nn.output_layer.get_outputs();
    for(var i = 0; i < outs.length; i++) {
      if(outs[i] > outs[move])
        move = i;
    }
    return move;
  };

  player.makeMove = function(game) {
    var move = this.pickMove(game);
    while(! game.makeMove(move, 1)) {
      var b = game.board;
      var targets = [];
      for(var i = 0; i < b.length; i++) {
        if(b[i] === 0) {
          targets[i] = 0.9;
        } else {
          targets[i] = 0.1;
        }
      }
      this.nn.backpropagate(targets);
      move = this.pickMove(game);
    }

    return game;
  };

  player.endGame = function(game, winner) {
    if(winner != -2) {
      var turn = 2;
      if(winner === -1)
        turn = 1;
      while(turn < game_object.turn) {
        var move = [];
        for(var i = 0; i < board_size; i++) {
          move[i] = 0;
          if(game.board[i] !== game.board[i-1]) {
            move[i] = 1;
          }
        }
        this.nn.update(game.turns[turn]);
        this.nn.backpropagate(move);
        turn++;
      }
    }
  };

  return player;
}

function initialize() {
  users_turn = false;
  var canvas = document.getElementById("myCanvas")
  context = canvas.getContext("2d");
  context_size = canvas.width;
  game_object = game();
  ai_player = aiPlayer();

  ai_player.makeMove(game_object);
  users_turn = true;
  drawBoard();
}

function reset() {
  var winner = game_object.hasWinner();
  ai_player.endGame(game_object, winner);
  game_object.reset();

  ai_player.makeMove(game_object);
  users_turn = true;
  drawBoard();
}

function playerTurn(space) {
  if(game_object.makeMove(space, -1)) {
    users_turn = false;
    if(game_object.hasWinner() === 0) {
      ai_player.makeMove(game_object);
      if(game_object.hasWinner() === -2) {
        alert("Tied!");
        tie_count++;
        if(tie_count === 3) {
          easterEgg();
          tie_count = 0;
        }
        reset();
      } else if(game_object.hasWinner() !== 0) {
        alert("You lose! :(");
        tie_count = 0;
        reset();
      } else {
        users_turn = true;
      }
    } else if(game_object.hasWinner() !== -2){
      alert("You win!");
      tie_count = 0;
      reset();
    } else {
      alert("Tied!");
      tie_count++;
      if(tie_count === 3) {
        easterEgg();
        tie_count = 0;
      }
      reset();
    }
  }
}

function drawBoard() {
  context.clearRect(0,0,context_size, context_size);

  drawLine(context_size / 3, 0,context_size / 3, context_size, 'black');
  drawLine(2 * context_size / 3, 0, 2 * context_size / 3, context_size, 'black');
  drawLine(0, context_size / 3, context_size, context_size / 3, 'black');
  drawLine(0, 2 * context_size / 3, context_size, 2 * context_size / 3, 'black');

  for(var i = 0; i < board_size; i++) {
    var x = Math.floor(i % row_size) * (context_size / 3);
    x += (context_size / 6);
    var y = Math.floor(i / row_size) * (context_size / 3);
    y += (context_size / 6);
    size = context_size / 8;
    if(game_object.board[i] === 1) {
      drawLine(x - size, y - size, x + size, y + size, 'red');
      drawLine(x - size, y + size, x + size, y - size, 'red');
    } else if(game_object.board[i] === -1) {
      drawCircle(x, y, size, 'green');
    }
  }
}
function drawLine(x1, y1, x2, y2, color) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineWidth = 7;
  context.strokeStyle = color;
  context.lineCap = "round";
  context.stroke();
}
function drawCircle(x, y, rad, color) {
  context.beginPath();
  context.arc(x, y, rad, 0, Math.PI * 2);
  context.lineWidth = 7;
  context.strokeStyle = color;
  context.stroke();
}
function clickBoard(event) {
  var x = Math.floor(event.pageX / (context_size / row_size));
  var y = Math.floor(event.pageY / (context_size / row_size));
  var move = (y * row_size) + x;
  if(users_turn)
    playerTurn(move);
}

function easterEgg() {
  var interval = window.setInterval(function() {
    var p = -1;
    if(Math.random() > 0.5) { p = 1; }

    var space = Math.floor(Math.random() * 9);
    game_object.board[space] = p;
    drawBoard();
  }, 10);
  window.setTimeout(function() {
    window.clearInterval(interval);
    alert("A strange game... The only winning move is not to play.");
    reset();
  }, 5000);
}
