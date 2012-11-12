angular.module('uiComponents', [])
.directive('datatable', function() {
	var htmlTable = '<table></table>';
	return {
		restrict : 'E',
		template : htmlTable,
		replace : true,
		scope : {
			aaData : '=',
			aoColumns : '=',
			postProcessor : '&'
		},
		compile : function(tElement, tAttrs, transclude){
			
			var linkFunction = function(scope, element, attrs){
				var dataTable = element.dataTable({
					aaData : scope.aaData,
					aoColumns : scope.aoColumns
				});
				scope.postProcessor({dataTable: dataTable});
				
				scope.$watch('aaData', function() {
					dataTable.fnClearTable();
					dataTable.fnAddData(scope.aaData);
			    });
			};
			
			return linkFunction;
		}
	};
})
.directive('victoryDialog', function(){
	return {
		restrict : 'E',
		template : '<div id="victoryDialog" class="game-dialog" title="Game over">' + 
		 				'<p>{{ victoryText }}</p>' + 
		 				'<button class="styled-button" ng-click="playAgain()">Play again</button>' +
		 				'<button class="styled-button" ng-click="backToLobby()">Back to lobby</button>'+
		 			'</div>',
		 replace : true
	};
})
.directive('messageDialog', function(){
	return {
		restrict : 'E',
		template : '<div id="messageDialog" class="game-dialog" title="Game over">'+
	 					'<p id="game-message"></p>' + 
	 				'</div>',
		replace : true
	};
})
.directive('gameDialogs', function(){
	return {
		restrict : 'E',
		template : 	'<div id="dialog-holder">'+
						'<div id="victoryDialog" class="game-dialog" title="Game over">' + 
							'<p>{{ victoryText }}</p>' + 
							'<button class="styled-button" ng-click="playAgain()">Play again</button>' +
							'<button class="styled-button" ng-click="backToLobby()">Back to lobby</button>'+
						'</div>' +
						'<div id="messageDialog" class="game-dialog" title="Game over">'+
		 					'<p id="game-message"></p>' + 
		 				'</div>' +
		 			'</div>'	,
		replace : true
	};
})

;