package games.model.persistence;

import games.model.Game;

import java.util.Collection;

public interface GameRepository {

	Collection<Game> getGames();
	
	Game getGameByGameId(String gameId);
}
