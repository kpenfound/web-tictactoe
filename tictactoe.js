var board_size = 9;
var row_size = 3;
var game_object;
var ai_player;
var users_turn;
var context;
var context_size;

function game() {
  var gameObj = {};

  gameObj.board = [];
  gameObj.moves = [];
  gameObj.turns = [];
  gameObj.turn = 0;

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
    var b = this.board; // For brevity
    // Rows / Columns
    for(i = 0; i < row_size; i++) {
      if(Math.abs(b[(i * board_size)] + b[(i * board_size) + 1] + b[(i * board_size) + 2]) === 3)
        return b[(i * board_size)];
      if(Math.abs(b[i] + b[i + board_size] + b[i + board_size + board_size]) === 3)
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
    var move = 0;
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
    while(! game.makeMove(move)) {
      var b = game.board;
      for(var i = 0; i < b.length; i++) {
        if(b[i] === 0) {
          b[i] = 0.9;
        } else {
          b[i] = 0.1;
        }
      }
      this.nn.backpropagate(b);
      move = this.pickMove(game);
    }

    return game;
  };

  player.endGame = function(game, winner) {
    if(winner != -2) {
      var turn = 2;
      if(winner === -1)
        turn = 1;
      while(turn < board_size) {
        var move = [];
        for(var i = 0; i < board_size; i++) {
          move[i] = 0;
          if(game.board[i] !== game.board[i-1]) {
            move[i] = 1;
          }
        }
        nn.update(game.turns[turn]);
        nn.backpropagate(move);
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
}

function reset() {
  var winner = game_object.hasWinner();
  ai_player.endGame(game_object, winner);
  game_object.reset();
}

function playerTurn(space) {
  if(game_object.makeMove(space, -1)) {
    users_turn = false;
    if(game_object.hasWinner() === 0) {
      ai_player.makeMove(game_object);
      if(game_object.hasWinner() === -2) {
        alert("Tied!");
        reset();
      } else if(game_object.hasWinner() !== 0) {
        alert("You lose! :(");
        reset();
      } else {
        users_turn = true;
      }
    } else if(game_object.hasWinner() !== -2){
      alert("You win!");
      reset();
    } else {
      alert("Tied!");
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
    var x = Math.floor(i / row_size) * (context_size / 3);
    x =+ (context_size / 6);
    var y = Math.floor(i % row_size) * (context_size / 3);
    y =+ (context_size / 6);
    size = context_size / 7;
    if(game_object[i] === 1) {
      drawLine(x - size, y - size, x + size, y + size, 'red');
      drawLine(x - size, y + size, x + size, y - size, 'red');
    } else if(game_object[i] === -1) {
      drawCircle(x, y, size, 'green');
    }
  }
}
function drawLine(x1, y1, x2, y2, color) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineWidth = 5;
  context.strokeStyle = color;
  context.lineCap = "round";
  context.stroke();
}
function drawCircle(x, y, rad, color) {
  context.beginPath();
  context.arc(x, y, rad, 0, Math.PI * 2);
  context.lineWidth = 5;
  context.strokeStyle = color;
  context.stroke();
}
function clickBoard(event) {
  var x = Math.floor(context_size / event.pageX);
  var y = Math.floor(context_size / event.pageY);
  var move = (y * row_size) + x;
  if(users_turn)
    playerTurn(move);
}
