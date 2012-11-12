package games.model.dto;

import games.model.Game;

public class OpenGameDTO {
	String playerName;

	String gameId;
	String gameName;
	String gameDescription;
	String gameTitle;

	Object parameters;

	public OpenGameDTO(String userName, Game game, Object gameParameters) {
		playerName = userName;
		gameId = game.getGameId();
		gameTitle = game.getShortName();
		gameName = game.getName();
		gameDescription = game.getDescription();
		parameters = gameParameters;
	}
}
