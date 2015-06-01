var nn = require('neuralnet');
var board_size = 9;
var row_size = 3;

exports.game = function() {
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
    if(turn === board_size)
      return -2;

    return 0;
  };

  return gameObj;
}

exports.aiPlayer = function() {
  player = {};
  player.nn = nn.neuralNetwork();

  player.pickMove = function(game) {
    var move = 0;

    return move;
  };

  player.makeMove = function(game) {

    return game;
  };

  player.endGame = function(game, winner) {

  };
  
  return player;
}
