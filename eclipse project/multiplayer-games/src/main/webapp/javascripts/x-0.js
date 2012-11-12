angular.module('tic-tac-toe', ['uiComponents']);

function X0Controller($scope, $http) {
	var controller = this;
	var boardLogic = new TicTacToeBoardLogic();

	this.initSubscription($scope);
	this.initGameOverDialogMethods($scope, $http);
	
	// see which player is which side - X always begins
	$scope.players = [ 'X', '0' ];
	this.initScopePlayers($scope);
	
	// setup board
	$scope.resetBoard = function() {
		$scope.board = boardLogic.initBoard(controller.options.boardSize);
		$scope.currentPlayerIndex = 0;
		delete $scope.winner;
		delete $scope.opponentsLastMove;
	};
	$scope.resetBoard();
	
	// click on a cell
	$scope.placeSymbol = function(row, column) {
		// if move not legal 
		if ($scope.winner || $scope.board[row][column].content || $scope.players[$scope.currentPlayerIndex] != $scope.player)
			return;

		// do move locally
		$scope.board[row][column].content = $scope.players[$scope.currentPlayerIndex];

		// post move to server
		controller.postMove($http, {
			row : row,
			column : column
		});

		// check victory
		$scope.checkVictory();
	};

	$scope.checkVictory = function() {
		if (boardLogic.currentPlayerIsVictorious()) {
			$scope.winner = $scope.players[$scope.currentPlayerIndex];
			$scope.victoryText = $scope.winner + " wins!";
			controller.displayVictoryDialog();
		} else if (boardLogic.boardIsFull()) {
			$scope.winner = 'noone';
			$scope.victoryText = 'Draw!';
			controller.displayVictoryDialog();
		} else {
			$scope.nextPlayer();
		}
	};

	$scope.nextPlayer = function() {
		if (this.currentPlayerIndex == 0)
			this.currentPlayerIndex = 1;
		else
			this.currentPlayerIndex = 0;
	};

}

X0Controller.prototype = new AngularController();
X0Controller.prototype.constructor = X0Controller;

X0Controller.prototype.opponentMoves = function($scope, move){
	$scope.$apply(function() {
		$scope.board[move.row][move.column].content = $scope.opponent;
		$scope.opponentsLastMove = $scope.board[move.row][move.column];
		$scope.checkVictory();
	});
};

function TicTacToeBoardLogic(){
}

TicTacToeBoardLogic.prototype.initBoard = function(length) {
	var board = [];

	for ( var i = 0; i < length; i++) {
		var row = [];
		for ( var j = 0; j < length; j++) {
			row.push({});
		}
		board.push(row);
	}

	this.board = board;
	
	return board;
};

TicTacToeBoardLogic.prototype.boardIsFull = function() {
	var board = this.board;
	for ( var i = 0; i < board.length; i++) {
		for ( var j = 0; j < board.length; j++) {
			if (!board[i][j].content)
				return false;
		}
	}
	return true;
};

TicTacToeBoardLogic.prototype.currentPlayerIsVictorious = function () {
	var board = this.board;
	var length = board.length;

	// check rows
	for ( var i = 0; i < length; i++) {
		var row = board[i];
		// check against first value
		var firstValueInRow = row[0].content;
		// if nothing in first cell, the row can't be full
		if (!firstValueInRow)
			continue;
		// go through the cells in the row
		var rowFullSame = true;
		for ( var c = 1; c < length && rowFullSame; c++) {
			var cell = row[c];
			if (cell.content != firstValueInRow) {
				rowFullSame = false;
			}
		}
		if (rowFullSame)
			return true;
	}

	// check columns
	for ( var columnCounter = 0; columnCounter < length; columnCounter++) {
		// check against first value
		var firstValueInColumn = board[0][columnCounter].content;
		// if nothing in first cell, the row can't be full
		if (!firstValueInColumn)
			continue;
		// go through the cells in the column
		var columnFullSame = true;
		for ( var rowCounter = 1; rowCounter < length && columnFullSame; rowCounter++) {
			var cell = board[rowCounter][columnCounter];
			if (cell.content != firstValueInColumn) {
				columnFullSame = false;
			}
		}
		if (columnFullSame)
			return true;
	}

	// check descending (first) diagonal
	var firstValueInDescendingDiagonal = board[0][0].content;
	if (firstValueInDescendingDiagonal) {
		var diagonalSame = true;
		for ( var diagonalCounter = 1; diagonalCounter < length && diagonalSame; diagonalCounter++) {
			var cell = board[diagonalCounter][diagonalCounter];
			if (cell.content != firstValueInDescendingDiagonal) {
				diagonalSame = false;
			}
		}
		if (diagonalSame)
			return true;
	}

	// check descending (second) diagonal
	var firstValueInAscendingDiagonal = board[0][length - 1].content;
	if (firstValueInAscendingDiagonal) {
		var diagonalSame = true;
		for ( var rowCounter = 1, columnCounter = length - 2; rowCounter < length && diagonalSame; rowCounter++, columnCounter--) {
			var cell = board[rowCounter][columnCounter];
			if (cell.content != firstValueInAscendingDiagonal) {
				diagonalSame = false;
			}
		}
		if (diagonalSame)
			return true;
	}

	return false;
};