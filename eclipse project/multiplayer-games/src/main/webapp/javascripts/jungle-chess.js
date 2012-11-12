angular.module('jungle-chess', ['uiComponents']);

var alternateRules;

function JungleChessController($scope, $http) {
	
	alternateRules = this.options;
	
	var controller = this;
	
	this.initSubscription($scope);
	this.initGameOverDialogMethods($scope, $http);
	
	$scope.players = this.players = [ {
		name : 'player1',
		startingPosition : 'top'
	}, {
		name : 'player2',
		startingPosition : 'bottom'
	} ];
	
	this.initScopePlayers($scope);
	
	this.types = {
		water : 'water',
		trap : 'trap',
		den : 'den',
		grass : 'grass'
	};
	this.scope = $scope;

	$scope.resetBoard = function() {
		$scope.board = controller.createBoard();
		$scope.currentPlayerIndex = 0;
		$scope.currentPlayer = controller.players[0];
		$scope.otherPlayer = controller.players[1];
		delete $scope.winner;
		delete $scope.opponentsLastMove;
	};

	$scope.resetBoard();

	$scope.cellClicked = function(rowIndex, columnIndex) {

		if ($scope.winner || $scope.currentPlayer != $scope.player)
			return;
		
		var board = this.board;
		var cell = board[rowIndex][columnIndex];

		// if own animal selected
		if (cell.animal && cell.animal.player == $scope.currentPlayer) {

			if ($scope.previousSelection) {

				// same animal selected
				if ($scope.previousSelection == cell)
					return;
				else {
					// un-highlight previous selection
					var previousRow = $scope.previousSelection.animal.x;
					var previousColumn = $scope.previousSelection.animal.y;
					controller.unhighlightCell(board, previousRow, previousColumn);
				}
			}

			// highlight animal
			cell.selected = true;

			// highlight movement grid
			var neighbors = controller.getNeighbors(board, rowIndex, columnIndex);
			for ( var i = 0; i < neighbors.length; i++) {
				// skip out of bounds indexes
				if (!neighbors[i])
					continue;
				$scope.evaluateMovement(cell, neighbors[i]);
			}

			$scope.previousSelection = cell;
		} else 
		// if moving animal
		if (cell.movementShadow || cell.attackShadow) {
			// unhighlight animal
			var previousRow = $scope.previousSelection.animal.x;
			var previousColumn = $scope.previousSelection.animal.y;
			controller.unhighlightCell(board, previousRow, previousColumn);
			
			$scope.moveAnimal({
				from : {
					row : previousRow,
					column : previousColumn
				},
				to : {
					row : rowIndex,
					column : columnIndex
				}
			});
			
			controller.postMove($http, {
				from : {
					row : previousRow,
					column : previousColumn
				},
				to : {
					row : rowIndex,
					column : columnIndex
				}
			});
			
			// remove references
			$scope.previousSelection.animal = null;
			$scope.previousSelection = null;

			$scope.checkVictory();
		}
	};
	
	$scope.checkVictory = function(){
		if ($scope.isCurrentPlayerVictorious()) {
			$scope.winner = $scope.currentPlayer;
			$scope.victoryText = "victory for " + $scope.winner.name;
			controller.displayVictoryDialog();
		} else {
			// next player
			$scope.updatePlayers();
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

	$scope.evaluateMovement = function(place, destination) {
		if (destination === undefined)
			return;

		if (destination.animal) {
			destination.attackShadow = controller.canAttack(place, destination);
		} else {
			destination.movementShadow = controller.canMove(place, destination);
		}
	};

	$scope.isCurrentPlayerVictorious = function() {
		// other player's den is free
		// other player still has animals
		return $scope.otherPlayer.den.animal || $scope.otherPlayer.animals == 0;
	};
	
	$scope.moveAnimal = function(move){
		var fromCell = $scope.board[move.from.row][move.from.column];
		var movedAnimal = fromCell.animal;
		delete fromCell.animal ;
		
		var toCell = $scope.board[move.to.row][move.to.column];
		if (toCell.animal)
			toCell.animal.player.animals--;
		toCell.animal = movedAnimal;
		
		movedAnimal.x = move.to.row;
		movedAnimal.y = move.to.column;
	};
	
	$scope.highlightOpponentsLastMove = function(move){
		$scope.opponentsLastMove = $scope.board[move.to.row][move.to.column];
	};
}

JungleChessController.prototype = new AngularController();
JungleChessController.prototype.constructor = JungleChessController;

JungleChessController.prototype.opponentMoves = function($scope, move) {
	$scope.$apply(function(){
		$scope.moveAnimal(move);
		$scope.highlightOpponentsLastMove(move);
		$scope.checkVictory();
	});
};

JungleChessController.prototype.unhighlightCell = function(board, rowIndex, columnIndex) {
	var cell = board[rowIndex][columnIndex];
	cell.selected = false;

	var previousNeighbors = this.getNeighbors(board, rowIndex, columnIndex);
	for ( var i = 0; i < previousNeighbors.length; i++) {
		// skip out of bounds indexes
		if (!previousNeighbors[i])
			continue;
		previousNeighbors[i].attackShadow = false;
		previousNeighbors[i].movementShadow = false;
	}
};

JungleChessController.prototype.getNeighbors = function(board, rowIndex, columnIndex) {
	// left and right
	var neighbors = [ board[rowIndex][columnIndex - 1], board[rowIndex][columnIndex + 1] ];
	// up
	if (board[rowIndex - 1])
		neighbors.push(board[rowIndex - 1][columnIndex]);
	// down
	if (board[rowIndex + 1])
		neighbors.push(board[rowIndex + 1][columnIndex]);
	// across water : right
	var nextColumnIndex = columnIndex - 1;
	while (board[rowIndex][nextColumnIndex] && board[rowIndex][nextColumnIndex].type == this.types.water) {
		nextColumnIndex--;
	}
	if (nextColumnIndex != columnIndex - 1)
		neighbors.push(board[rowIndex][nextColumnIndex]);
	// across water : left
	nextColumnIndex = columnIndex + 1;
	while (board[rowIndex][nextColumnIndex] && board[rowIndex][nextColumnIndex].type == this.types.water) {
		nextColumnIndex++;
	}
	if (nextColumnIndex != columnIndex + 1)
		neighbors.push(board[rowIndex][nextColumnIndex]);
	// across water : up
	var nextRowIndex = rowIndex - 1;
	while (board[nextRowIndex] && board[nextRowIndex][columnIndex] && board[nextRowIndex][columnIndex].type == this.types.water) {
		nextRowIndex--;
	}
	if (nextRowIndex != rowIndex - 1)
		neighbors.push(board[nextRowIndex][columnIndex]);
	// across water : down
	nextRowIndex = rowIndex + 1;
	while (board[nextRowIndex] && board[nextRowIndex][columnIndex] && board[nextRowIndex][columnIndex].type == this.types.water) {
		nextRowIndex++;
	}
	if (nextRowIndex != rowIndex + 1)
		neighbors.push(board[nextRowIndex][columnIndex]);
	// result
	return neighbors;
};

JungleChessController.prototype.cellsAreFreeBetween = function(place, destination) {
	var board = this.scope.board;
	if (place.x == destination.x) {
		var beginY = place.y < destination.y ? place.y : destination.y;
		var endY = place.y > destination.y ? place.y : destination.y;
		for ( var i = beginY + 1; i < endY - 1; i++) {
			if (board[place.x][i].animal)
				return false;
		}
		return true;
	} else if (place.y == destination.y) {
		var beginX = place.x < destination.x ? place.x : destination.x;
		var endX = place.x > destination.x ? place.x : destination.x;
		for ( var i = beginX + 1; i < endX - 1; i++) {
			if (board[i][place.y].animal)
				return false;
		}
		return true;
	} else
		throw "You can't get here: free cells";
};

JungleChessController.prototype.canMove = function(place, destination) {
	var distance = boardMath.lineDistance(place, destination);
	if (distance > 1) {
		return place.animal.canJump(distance) && this.cellsAreFreeBetween(place, destination);
	}
	// only the rat can swim
	if (destination.type == this.types.water)
		return place.animal.canSwim();
	// can't move into own den
	if (destination.type == this.types.den)
		return place.animal.player != destination.player;
	// can move freely in traps or grass
	if (destination.type == this.types.grass)
		return true;
	if (destination.type == this.types.trap) {
		if (this.options.highLevelAnimalsMayEnterTraps) {
			return true;
		} else {
			return place.animal.powerLevel < 4;
		}
	}
	throw "You can't get here: canMove";
};

JungleChessController.prototype.canAttack = function(place, destination) {
	var attacker = place.animal, defender = destination.animal;
	// can't move on ally
	if (attacker.player == defender.player)
		return false;
	// can't attack when exiting or entering water
	if (!this.options.attackFromWater) {
		if (place.type != destination.type && (place.type == this.types.water || destination.type == this.types.water))
			return false;
	}
	// check jumping
	var distance = boardMath.lineDistance(place, destination);
	if (distance > 1) {
		return attacker.canJump(distance) && attacker.canKill(defender) && this.cellsAreFreeBetween(place, destination);
	}
	// if the enemy is on your trap, it can be attacked by anything
	// alternate rule: traps are universal
	if (destination.type == this.types.trap && (this.options.universalTraps || destination.player == place.animal.player)) {
		return true;
	}
	// regular attack
	return attacker.canKill(defender);
	throw "You can't get here: canAttack";
};

JungleChessController.prototype.createBoard = function() {
	var board = [];
	var animals = [ new Animal('Rat', 2, 0, 0), new Animal('Cat', 1, 5, 1), new Animal('Leopard', 2, 2, 4), new Animal('Lion', 0, 0, 6),
			new Animal('Elephant', 2, 6, 7) ];
	{
		var tiger = new Animal('Tiger', 0, 6);
		tiger.powerLevel = this.options.tigerEqualsLion ? 6 : 5;
		animals.push(tiger);
	}
	{
		var dog = new Animal('Dog', 1, 1);
		var wolf = new Animal('Wolf', 2, 4);
		var fox = new Animal('Fox', 2, 4);
		if (this.options.foxReplacesWolf){
			fox.powerLevel = 2;
			dog.powerLevel = 3;
			
			animals.push(dog);
			animals.push(fox);
		} else {
			dog.powerLevel = 2;
			wolf.powerLevel = 3;
			
			animals.push(dog);
			animals.push(wolf);
		}
	}
	var players = this.players;
	var types = this.types;

	var rows = 9, columns = 7;

	// create empty board
	for ( var i = 0; i < rows; i++) {
		var row = [];
		for ( var j = 0; j < columns; j++) {
			row.push({
				type : 'grass',
				x : i,
				y : j,
				getAnimalPicture : function() {
					if (this.animal)
						return "../../images/games/jungle-chess/animals/" + this.animal.name + ".png";
					else
						return '';
				}
			});
		}
		board.push(row);
	}

	// set terrain
	var waterCells = [ [ 3, 1 ], [ 3, 2 ], [ 3, 4 ], [ 3, 5 ], [ 4, 1 ], [ 4, 2 ], [ 4, 4 ], [ 4, 5 ], [ 5, 1 ], [ 5, 2 ], [ 5, 4 ],
			[ 5, 5 ], ];
	var player1TrapCells = [ [ 0, 2 ], [ 0, 4 ], [ 1, 3 ] ];
	var player2TrapCells = [ [ 7, 3 ], [ 8, 2 ], [ 8, 4 ] ];
	var denCells = [ [ 0, 3 ], [ 8, 3 ] ];
	// set water
	for ( var i = 0; i < waterCells.length; i++) {
		board[waterCells[i][0]][waterCells[i][1]].type = types.water;
	}
	// set traps
	for ( var i = 0; i < player1TrapCells.length; i++) {
		var trapCell = board[player1TrapCells[i][0]][player1TrapCells[i][1]];
		trapCell.type = types.trap;
		trapCell.player = players[0];
	}
	for ( var i = 0; i < player2TrapCells.length; i++) {
		var trapCell = board[player2TrapCells[i][0]][player2TrapCells[i][1]];
		trapCell.type = types.trap;
		trapCell.player = players[1];
	}
	// set den
	for ( var i = 0; i < denCells.length; i++) {
		var denCell = board[denCells[i][0]][denCells[i][1]];
		denCell.type = types.den;
		denCell.player = players[i];
		players[i].den = denCell;
	}

	// place animals at their starting position
	for ( var i = 0; i < players.length; i++) {
		var player = players[i];
		player.animals = animals.length;

		for ( var j = 0; j < animals.length; j++) {
			var animal = angular.copy(animals[j]);
			if (player.startingPosition == 'bottom') {
				animal.x = rows - 1 - animals[j].x;
				animal.y = columns - 1 - animals[j].y;
			}
			animal.player = player;
			board[animal.x][animal.y].animal = animal;
		}
	}

	return board;
};

function Animal(name, startingX, startingY, powerLevel, player) {
	this.name = name;
	this.x = startingX;
	this.y = startingY;
	this.powerLevel = powerLevel || 0;
	this.player = player;
}

Animal.prototype.canSwim = function() {
	if (this.name == 'Rat')
		return true;
	// alternate rule: dog may swim
	if (alternateRules.dogCanSwim && this.name == 'Dog')
		return true;
	return false;
};

Animal.prototype.canJump = function(distance) {
	if (this.name == 'Tiger')
		return true;
	if (this.name == 'Lion')
		// alternate rule: lion may not jump horizontally
		if (alternateRules.lionJump)
			return distance > 2;
		else
			return true;
	// alternate rule: leopard may jump horizontally
	if (this.name == 'Leopard' && alternateRules.leopardJump && distance == 2)
		return true;
	return false;
};

Animal.prototype.canKill = function(defender) {
	var attacker = this;
	// alternate rule: elephant may not kill the rat
	if (!alternateRules.elephantMayKillRat && attacker.name == 'Elephant' && defender.name == 'Rat')
		return false;
	// a larger animal may attack a smaller or equal one
	if (attacker.powerLevel >= defender.powerLevel) {
		return true;
	}
	// rat may attack elephant
	if (attacker.name == 'Rat' && defender.name == 'Elephant')
		return true;
	// a smaller animal may not attack a larger one
	if (attacker.powerLevel < defender.powerLevel) {
		return false;
	}
};

var boardMath = {
	createPoint : function(x, y) {
		return {
			x : x,
			y : y
		};
	},

	lineDistance : function(point1, point2) {
		var xs = 0;
		var ys = 0;

		xs = point2.x - point1.x;
		xs = xs * xs;

		ys = point2.y - point1.y;
		ys = ys * ys;

		return Math.sqrt(xs + ys);
	}
};
