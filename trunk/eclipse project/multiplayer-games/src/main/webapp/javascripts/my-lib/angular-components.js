function AngularController() {
	this.url = 'game-command';
	// $scope.resetBoard();
	this.options = gameOptions;
}

AngularController.prototype.initSubscription = function($scope) {

	var controller = this;

	// parse URL params
	var params = $.url().param();

	// init data
	this.playerName = params.player;
	this.opponentName = params.opponent;
	this.playerBegins = params.begin == 'true';

	// server handles sending
	// var sendChannel = params.player + 'vs' + params.opponent;
	var receiveChannel = params.opponent + 'vs' + params.player;

	// subscribe for opponent's moves
	var cometCallback = function(response) {
		var responseObj = JSON.parse(response);
		// opponent moves
		if (responseObj.commandType == 'move') {
			var move = responseObj.payload;
			controller.opponentMoves($scope, move);
		} else // opponent quits
		if (responseObj.commandType == 'quit-game') {
			controller.showMessageDialog("Your opponent has left the game!", function() {
				controller.goToLobby();
			});
		} else // restart
		if (responseObj.commandType == 'restart-game') {
			controller.showMessageDialog("Your opponent has restarted the game!", function() {
				controller.hideDialogs();
			});
			controller.resetGame($scope);
		}
	};
	new PushClient(receiveChannel, function(response) {
		cometCallback(response);
	}).connect();
};

AngularController.prototype.initGameOverDialogMethods = function($scope, $http) {

	var controller = this;

	$scope.playAgain = function() {
		$http({
			method : 'POST',
			url : controller.url,
			data : {
				commandType : 'restart-game',
				player : controller.playerName,
				opponent : controller.opponentName
			}
		}).success(function() {
			console.log("restart posted");
		});
		controller.hideDialogs();
		$scope.resetBoard();
	};

	$scope.backToLobby = function() {
		$http({
			method : 'POST',
			url : controller.url,
			data : {
				commandType : 'quit-game',
				player : controller.playerName,
				opponent : controller.opponentName
			}
		}).success(function() {
			console.log("quit posted");
		});
		controller.goToLobby();
	};
};

AngularController.prototype.postMove = function($http, move) {

	var controller = this;

	$http({
		method : 'POST',
		url : controller.url,
		data : {
			payload : move,
			commandType : 'move',
			player : controller.playerName,
			opponent : controller.opponentName
		}
	}).success(function() {
		console.log("move posted");
	});
};

AngularController.prototype.initScopePlayers = function($scope) {
	if (this.playerBegins) {
		$scope.player = $scope.players[0];
		$scope.opponent = $scope.players[1];
	} else {
		$scope.player = $scope.players[1];
		$scope.opponent = $scope.players[0];
	}
};

AngularController.prototype.opponentMoves = function($scope, move) {
	throw "Override this method and highlight opponent's last move!";
};

AngularController.prototype.resetGame = function($scope) {
	$scope.$apply(function() {
		$scope.resetBoard();
	});
};

AngularController.prototype.goToLobby = function() {
	window.location.href = "../lobby";
};

AngularController.prototype.showMessageDialog = function(message, callback) {
	$('#game-message').html(message);
	$("#messageDialog").dialog({
		modal : true,
		buttons : {
			OK : function() {
				$(this).dialog("close");
			}
		},
		close : function() {
			if (callback)
				callback();
		}
	});
};

AngularController.prototype.hideDialogs = function() {
	$('.game-dialog').each(function() {
		try {
			$(this).dialog("close");
		} catch (dialogNotInitializedException) {
		}
	});
};

AngularController.prototype.displayVictoryDialog = function() {
	$('#victoryDialog').dialog({
		modal : true
	});
};