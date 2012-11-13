angular.module('lobby', [ 'uiComponents' ]);

// TODO display starting parameters when clicking on game

function LobbyController($scope, $http) {
	
	var controller = this;
	this.user = loggedInUser;

	// configure create game select
	$scope.availableGames = availableGames;
	$scope.selectedGame = availableGames[0];

	// configure data table
	$scope.games = games;
	$scope.columns = [ {
		sTitle : "Player",
		"mData" : "playerName"
	}, {
		sTitle : "Game",
		"mData" : "gameTitle"
	}, {
		sTitle : "",
		"mData" : null,
		"mRender" : function(data, type, row) {
			return '<button class="join-game-button">Join!</button>';
		}
	} ];
	$scope.assignEvents = function(dataTable) {
		dataTable.on("click", "tr", function() {
			var data = dataTable.fnGetData(this);
			$scope.$apply(function() {
				$scope.selectedOpenGame = data;
			});
		});
		dataTable.on("click", "button", function() {
			$.blockUI();
			var data = dataTable.fnGetData($(this).parents('tr').get(0));
			$.ajax({
				type : 'GET',
				url : "join-game",
				data : "playerName=" + data.playerName + "&gameId=" + data.gameId,
				dataType : 'json',
				success : function(data) {
					controller.processRedirectResponse(data);
				}
			});
		});
	};

	$scope.createGame = function() {
		$scope.createdGame = {
			"gameType" : $scope.selectedGame.id,
			"gameOptions" : {
			}
		};
		for (var i=0; i<$scope.selectedGame.options.length; i++){
			var gameOption = $scope.selectedGame.options[i];
			if (gameOption.type == 'enumeration')
				$scope.createdGame.gameOptions[gameOption.name] = gameOption.values[Number(gameOption.defaultValueIndex)];
			if (gameOption.type == 'boolean')
				$scope.createdGame.gameOptions[gameOption.name] = gameOption.defaultValue;
		}
		$('#create-game-dialog').dialog({
			modal : true,
			width: 500,
			buttons : {
				OK : function() {
					$(this).dialog("close");
					$.blockUI();
					$http({
						method : 'POST',
						url : "create-game",
						data : $scope.createdGame
					}).success(function() {
						controller.connectToLoggedInUserChannel();
					});
				}
			}
		});
	};

	// handle incoming open games list
	window.receiveUpdatedGameList = function(response) {
		console.log("game list refreshed:");
		console.log(response);
		$scope.$apply(function() {
			$scope.games = JSON.parse(response);
		});
	};
	new PushClient("games", receiveUpdatedGameList).connect();
}

LobbyController.prototype.connectToLoggedInUserChannel = function() {
	var controller = this;
	new PushClient(this.user, function(response) {
		var jsonResponse = JSON.parse(response);
		controller.processRedirectResponse(jsonResponse);
	}).connect();
};

LobbyController.prototype.processRedirectResponse = function(response) {
	window.location.href = "board/" + response.page + "?player=" + response.player + "&opponent=" + response.opponent + "&begin=" + response.begin ;
};
