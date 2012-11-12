angular.module('reversi', ['uiComponents']);

function ReversiController($scope, $http) {

	var controller = this;
	var boardLogic = new ReversiBoardLogic();

	this.initSubscription($scope);
	this.initGameOverDialogMethods($scope, $http);

	// see which player is which side - black always begins
	this.players = $scope.players = [ {
		name : 'Black',
		score : 0
	}, {
		name : 'White',
		score : 0
	} ];
	this.initScopePlayers($scope);

	$scope.applyMove = function(player, rowIndex, columnIndex) {
		$scope.board[rowIndex][columnIndex].player = player;
		boardLogic.capturePieces(rowIndex, columnIndex, $scope.currentPlayer);
		$scope.updateScore();
	};

	$scope.checkVictory = function() {
		if (boardLogic.isBoardFull()) {
			$scope.evaluateVictory();
		} else {
			// next player
			$scope.updatePlayers();
			if (!boardLogic.playerCanMove($scope.currentPlayer)) {
				$scope.updatePlayers();
				if (!boardLogic.playerCanMove($scope.currentPlayer)) {
					$scope.evaluateVictory();
				}
			}
		}
	};

	// click on a cell
	$scope.placePiece = function(rowIndex, columnIndex) {

		if (boardLogic.isLegalMove(rowIndex, columnIndex, $scope.currentPlayer) && $scope.currentPlayer == $scope.player) {

			// do move locally
			$scope.applyMove($scope.player, rowIndex, columnIndex);

			controller.postMove($http, {
				row : rowIndex,
				column : columnIndex
			});

			$scope.checkVictory();
		}
	};

	$scope.evaluateVictory = function() {
		if ($scope.otherPlayer.score == $scope.currentPlayer.score) {
			// draw
			$scope.winner = 'noone';
			$scope.victoryText = 'Draw!';
			controller.displayVictoryDialog();
		} else {
			if ($scope.otherPlayer.score > $scope.currentPlayer.score)
				$scope.updatePlayers();
			$scope.winner = $scope.players[$scope.currentPlayerIndex].name;
			$scope.victoryText = $scope.winner + " wins!";
			controller.displayVictoryDialog();
		}
	};

	$scope.updateScore = function() {
		for ( var i = 0; i < $scope.players.length; i++) {
			var player = $scope.players[i];
			var score = 0;
			for ( var row = 0; row < $scope.board.length; row++) {
				for ( var column = 0; column < $scope.board[row].length; column++) {
					if ($scope.board[row][column].player == player)
						score++;
				}
			}
			player.score = score;
		}
	};

	$scope.updatePlayers = function() {
		if ($scope.currentPlayerIndex == 0) {
			$scope.currentPlayerIndex = 1;
			$scope.currentPlayer = controller.players[1];
			$scope.otherPlayer = controller.players[0];
		} else {
			$scope.currentPlayerIndex = 0;
			$scope.currentPlayer = controller.players[0];
			$scope.otherPlayer = controller.players[1];
		}
	};

	// setup board
	$scope.resetBoard = function() {
		$scope.board = boardLogic.initBoard(controller.options.boardSize, controller.options.initialSetup, this.players);
		$scope.currentPlayerIndex = 0;
		$scope.currentPlayer = controller.players[0];
		$scope.otherPlayer = controller.players[1];
		delete $scope.winner ;
		delete $scope.opponentsLastMove;
		$scope.updateScore();
	};
	$scope.resetBoard();

};

ReversiController.prototype = new AngularController();
ReversiController.prototype.constructor = ReversiController;

ReversiController.prototype.opponentMoves = function($scope, move) {
	$scope.$apply(function() {
		$scope.applyMove($scope.opponent, move.row, move.column);
		$scope.opponentsLastMove = $scope.board[move.row][move.column];
		$scope.checkVictory();
	});
};

function ReversiBoardLogic(){
};

ReversiBoardLogic.prototype.initBoard = function(boardSize, setup, players){
	var board = [];

	for ( var i = 0; i < boardSize; i++) {
		var row = [];
		for ( var j = 0; j < boardSize; j++) {
			row.push({});
		}
		board.push(row);
	}

	if (setup == 'diagonal') {
		this.diagonalSetup(board, players);
	} else if (setup == 'horizontal') {
		this.horizontalSetup(board, players);
	}
	
	this.reversiBoard = board;

	return board;
};

ReversiBoardLogic.prototype.diagonalSetup = function(board, players) {
	var j = Math.floor( board.length / 2 );
	var i = j - 1;
	board[i][i].player = players[1];
	board[i][j].player = players[0];
	board[j][j].player = players[1];
	board[j][i].player = players[0];
};

ReversiBoardLogic.prototype.horizontalSetup = function(board, players) {
	var j = Math.floor( board.length / 2 );
	var i = j - 1;
	board[i][i].player = players[1];
	board[i][j].player = players[1];
	board[j][j].player = players[0];
	board[j][i].player = players[0];
};

ReversiBoardLogic.prototype.isBoardFull = function() {
	var board = this.reversiBoard;
	for ( var row = 0; row < board.length; row++) {
		for ( var column = 0; column < board[row].length; column++) {
			if (!board[row][column].player)
				return false;
		}
	}
	return true;
};

ReversiBoardLogic.prototype.getPiecesInDirection = function(rowIndex, columnIndex, direction) {
	var left = direction == 'left' || direction == 'upper-left' || direction == 'lower-left';
	var right = direction == 'right' || direction == 'upper-right' || direction == 'lower-right';
	var up = direction == 'up' || direction == 'upper-left' || direction == 'upper-right';
	var down = direction == 'down' || direction == 'lower-left' || direction == 'lower-right';

	function getNextRowIndex(rowIndex) {
		if (up)
			return rowIndex - 1;
		if (down)
			return rowIndex + 1;
		return rowIndex;
	}

	function getNextColumnIndex(columnIndex) {
		if (left)
			return columnIndex - 1;
		if (right)
			return columnIndex + 1;
		return columnIndex;
	}

	var cells = [];
	var cellHasDisc = false;
	do {
		rowIndex = getNextRowIndex(rowIndex);
		columnIndex = getNextColumnIndex(columnIndex);
		cellHasDisc = this.reversiBoard[rowIndex] && this.reversiBoard[rowIndex][columnIndex] && this.reversiBoard[rowIndex][columnIndex].player;
		if (cellHasDisc)
			cells.push(this.reversiBoard[rowIndex][columnIndex]);
	} while (cellHasDisc);

	return cells;

};

ReversiBoardLogic.prototype.capturePieces = function(rowIndex, columnIndex, currentPlayer) {
	var directions = [ 'left', 'right', 'up', 'down', 'upper-left', 'lower-left', 'upper-right', 'lower-right' ];
	for ( var i = 0; i < directions.length; i++) {
		var cells = this.getPiecesInDirection(rowIndex, columnIndex, directions[i]);
		// if neighbor belongs to other player
		if (cells.length > 1 && cells[0].player != currentPlayer) {
			for ( var j = 1; j < cells.length; j++)
				// look for cell belonging to current player
				if (cells[j].player == currentPlayer) {
					// turn cells between
					for ( var k = 0; k < j; k++) {
						cells[k].player = currentPlayer;
					}
					break;
				}
		}
	}
};

ReversiBoardLogic.prototype.playerCanMove = function(currentPlayer) {
	for ( var row = 0; row < this.reversiBoard.length; row++) {
		for ( var column = 0; column < this.reversiBoard[row].length; column++) {
			if ((!this.reversiBoard[row][column].player) && this.isLegalMove(row, column, currentPlayer)) {
				return true;
			}
		}
	}
	return false;
};

ReversiBoardLogic.prototype.isLegalMove = function(rowIndex, columnIndex, currentPlayer) {
	var directions = [ 'left', 'right', 'up', 'down', 'upper-left', 'lower-left', 'upper-right', 'lower-right' ];
	for ( var i = 0; i < directions.length; i++) {
		var cells = this.getPiecesInDirection(rowIndex, columnIndex, directions[i]);
		// if neighbor belongs to other player
		if (cells.length > 1 && cells[0].player != currentPlayer) {
			for ( var j = 1; j < cells.length; j++)
				// look for cell belonging to current player
				if (cells[j].player == currentPlayer)
					return true;
		}
	}

	return false;
};